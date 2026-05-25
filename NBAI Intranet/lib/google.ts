import { cookies } from "next/headers";

export type TokenPayload = {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  scope?: string;
  email?: string;
  name?: string;
  picture?: string;
};

export const authCookieName = "nbai_google_tokens";
export const stateCookieName = "nbai_oauth_state";

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export function encodeCookie(value: TokenPayload): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function decodeCookie(value?: string): TokenPayload | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getTokenFromCookie(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  return decodeCookie(cookieStore.get(authCookieName)?.value);
}

export async function setTokenCookie(token: TokenPayload) {
  const cookieStore = await cookies();
  cookieStore.set(authCookieName, encodeCookie(token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookieName);
}

export async function refreshAccessToken(token: TokenPayload): Promise<TokenPayload | null> {
  if (!token.refresh_token) return null;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      refresh_token: token.refresh_token,
      grant_type: "refresh_token"
    })
  });

  if (!response.ok) return null;
  const data = await response.json();
  const nextToken: TokenPayload = {
    ...token,
    access_token: data.access_token,
    expires_at: Date.now() + Number(data.expires_in || 3600) * 1000
  };
  await setTokenCookie(nextToken);
  return nextToken;
}

export async function getValidToken(): Promise<TokenPayload | null> {
  const token = await getTokenFromCookie();
  if (!token) return null;
  if (token.expires_at > Date.now() + 60_000) return token;
  return refreshAccessToken(token);
}

export async function googleJson<T>(url: string, token: TokenPayload, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token.access_token}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}
