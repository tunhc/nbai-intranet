import { NextResponse } from "next/server";
import { getValidToken } from "@/lib/google";

export async function GET() {
  const token = await getValidToken();
  if (!token) {
    return NextResponse.json({ ok: false, loggedIn: false }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    loggedIn: true,
    user: {
      email: token.email,
      name: token.name,
      picture: token.picture
    }
  });
}
