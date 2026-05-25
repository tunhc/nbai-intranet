import { NextRequest, NextResponse } from "next/server";
import { findMember } from "@/lib/data";

export async function GET(request: NextRequest) {
  const member = findMember(request.nextUrl.searchParams.get("member"));
  const folderId = process.env[member.folderEnv];

  if (!folderId) {
    return NextResponse.json({ ok: false, error: `Missing env var: ${member.folderEnv}` }, { status: 500 });
  }

  return NextResponse.redirect(`https://drive.google.com/drive/folders/${folderId}`);
}
