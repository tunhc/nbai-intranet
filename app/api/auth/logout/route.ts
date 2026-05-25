import { NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/google";

export async function GET(request: Request) {
  await clearTokenCookie();
  return NextResponse.redirect(new URL("/", request.url));
}
