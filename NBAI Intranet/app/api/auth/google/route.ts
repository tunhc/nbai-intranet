import { NextResponse } from "next/server";
import { requiredEnv, stateCookieName } from "@/lib/google";

export async function GET() {
  const state = crypto.randomUUID();
  const redirectUri = requiredEnv("GOOGLE_REDIRECT_URI");
  const scope = [
    "openid",
    "email",
    "profile",
    process.env.GOOGLE_DRIVE_SCOPE || "https://www.googleapis.com/auth/drive"
  ].join(" ");

  const params = new URLSearchParams({
    client_id: requiredEnv("GOOGLE_CLIENT_ID"),
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope,
    state
  });

  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  response.cookies.set(stateCookieName, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60
  });
  return response;
}
