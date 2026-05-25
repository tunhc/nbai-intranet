import { NextResponse } from "next/server";
import { findFolder, findMember } from "@/lib/data";
import { getValidToken, googleJson } from "@/lib/google";

export const runtime = "nodejs";

type DriveFile = {
  id: string;
  name: string;
  webViewLink?: string;
};

export async function POST(request: Request) {
  const token = await getValidToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Google login required." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const member = findMember(String(formData.get("memberId") || ""));
    const folder = findFolder(String(formData.get("folderId") || ""));
    const uploads = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);

    if (uploads.length === 0) {
      return NextResponse.json({ ok: false, error: "Missing files." }, { status: 400 });
    }

    const memberFolderId = process.env[member.folderEnv];
    if (!memberFolderId) {
      return NextResponse.json({ ok: false, error: `Missing env var: ${member.folderEnv}` }, { status: 500 });
    }

    const targetFolderId = await getOrCreateChildFolder(memberFolderId, folder.name, token.access_token);
    const files: DriveFile[] = [];

    for (const upload of uploads) {
      const file = await uploadToDrive({
        accessToken: token.access_token,
        folderId: targetFolderId,
        name: upload.name,
        mimeType: upload.type || "application/octet-stream",
        bytes: await upload.arrayBuffer()
      });
      files.push(file);
    }

    const uploadedAt = new Date().toISOString();
    const notes = [
      `Batch title: ${member.company}_${folder.label}_${uploadedAt.slice(0, 10)}`,
      `Member: ${member.name}`,
      `Legal name: ${member.legalName || ""}`,
      `Company: ${member.company}`,
      `Folder: ${folder.name}`,
      `Uploaded files: ${files.length}`,
      ...files.flatMap((file, index) => [
        `File ${index + 1}: ${file.name}`,
        `File ${index + 1} URL: ${file.webViewLink || ""}`
      ]),
      `Uploaded by: ${token.email || ""}`,
      `Uploaded at: ${uploadedAt}`
    ].join("\n");

    await uploadToDrive({
      accessToken: token.access_token,
      folderId: targetFolderId,
      name: `${sanitizeFileName(`${member.company}_${folder.label}_${uploadedAt}`)}.notes.txt`,
      mimeType: "text/plain",
      bytes: Buffer.from(notes, "utf8")
    });

    return NextResponse.json({
      ok: true,
      files: files.map((file) => ({
        fileId: file.id,
        fileName: file.name,
        fileUrl: file.webViewLink
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}

async function getOrCreateChildFolder(parentId: string, name: string, accessToken: string): Promise<string> {
  const query = [
    `name = '${name.replaceAll("'", "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    `'${parentId}' in parents`,
    "trashed = false"
  ].join(" and ");

  const search = await googleJson<{ files: DriveFile[] }>(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    { access_token: accessToken, expires_at: Date.now() + 3600_000 }
  );

  if (search.files[0]) return search.files[0].id;

  const created = await googleJson<DriveFile>(
    "https://www.googleapis.com/drive/v3/files?fields=id,name",
    { access_token: accessToken, expires_at: Date.now() + 3600_000 },
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId]
      })
    }
  );

  return created.id;
}

async function uploadToDrive(input: {
  accessToken: string;
  folderId: string;
  name: string;
  mimeType: string;
  bytes: ArrayBuffer | Buffer;
}): Promise<DriveFile> {
  const boundary = `nbai_${crypto.randomUUID()}`;
  const metadata = {
    name: input.name,
    parents: [input.folderId]
  };
  const delimiter = `--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body = new Blob([
    delimiter,
    "Content-Type: application/json; charset=UTF-8\r\n\r\n",
    JSON.stringify(metadata),
    "\r\n",
    delimiter,
    `Content-Type: ${input.mimeType}\r\n\r\n`,
    input.bytes,
    closeDelimiter
  ]);

  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body
  });

  if (!response.ok) {
    throw new Error(`Drive upload failed ${response.status}: ${await response.text()}`);
  }

  return response.json() as Promise<DriveFile>;
}

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|#%{}~&]/g, "-").slice(0, 120) || "metadata";
}
