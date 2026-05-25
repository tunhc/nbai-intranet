import { NextRequest, NextResponse } from "next/server";
import { requiredEnv, setTokenCookie, stateCookieName, type TokenPayload } from "@/lib/google";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(stateCookieName)?.value;

  if (!code || !state || state !== expectedState) {
    return NextResponse.json({ ok: false, error: "Invalid Google OAuth callback." }, { status: 400 });
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: requiredEnv("GOOGLE_REDIRECT_URI"),
      grant_type: "authorization_code"
    })
  });

  if (!tokenResponse.ok) {
    return NextResponse.json({ ok: false, error: await tokenResponse.text() }, { status: 400 });
  }

  const tokenData = await tokenResponse.json();
  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const profile = profileResponse.ok ? await profileResponse.json() : {};

  const token: TokenPayload = {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: Date.now() + Number(tokenData.expires_in || 3600) * 1000,
    scope: tokenData.scope,
    email: profile.email,
    name: profile.name,
    picture: profile.picture
  };

  await setTokenCookie(token);
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(stateCookieName);
  return response;
}
