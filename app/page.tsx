"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { buildTemplate, findFolder, findMember, folders, members, type FolderId, type MemberId } from "@/lib/data";

type SavedDoc = {
  id: string;
  title: string;
  memberId: MemberId;
  folderId: FolderId;
  folderName: string;
  fileName: string;
  url?: string;
  note?: string;
  createdAt: string;
};

type UploadItem = {
  name: string;
  status: "waiting" | "uploading" | "done" | "error";
  url?: string;
  error?: string;
};

type GoogleUser = {
  email?: string;
  name?: string;
  picture?: string;
  scope?: string;
};

const storageKey = "nbai-next-docs";

export default function Home() {
  const [activeMember, setActiveMember] = useState<MemberId>("an");
  const [activeFolder, setActiveFolder] = useState<FolderId>("persona");
  const [docs, setDocs] = useState<SavedDoc[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(storageKey) || "[]") as SavedDoc[];
  });
  const [status, setStatus] = useState("Sẵn sàng nhận docs");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const member = findMember(activeMember);
  const folder = findFolder(activeFolder);
  const template = useMemo(() => buildTemplate(member, folder), [member, folder]);
  const visibleDocs = docs.filter((doc) => doc.memberId === activeMember);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const memberParam = params.get("member") as MemberId | null;
    const folderParam = params.get("folder") as FolderId | null;
    if (memberParam && members.some((item) => item.id === memberParam)) setActiveMember(memberParam);
    if (folderParam && folders.some((item) => item.id === folderParam)) setActiveFolder(folderParam);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((result) => {
        if (result?.loggedIn) setGoogleUser(result.user);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  function selectMember(memberId: MemberId) {
    setActiveMember(memberId);
    window.location.href = `/?member=${memberId}&folder=${activeFolder}`;
  }

  function selectFolder(folderId: FolderId) {
    setActiveFolder(folderId);
    window.location.href = `/?member=${activeMember}&folder=${folderId}`;
  }

  function persist(nextDocs: SavedDoc[]) {
    setDocs(nextDocs);
    localStorage.setItem(storageKey, JSON.stringify(nextDocs));
  }

  async function submitDoc(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUploading(true);
    setProgress(0);
    setStatus("Đang chuẩn bị upload lên Google Drive...");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
    if (files.length === 0) {
      setStatus("Chưa chọn file.");
      setIsUploading(false);
      return;
    }
    setUploadItems(files.map((file) => ({ name: file.name, status: "waiting" })));
    formData.set("memberId", member.id);
    formData.set("memberName", member.name);
    formData.set("folderId", folder.id);
    formData.set("folderName", folder.name);

    try {
      setUploadItems(files.map((file) => ({ name: file.name, status: "uploading" })));
      setStatus(`Đang upload ${files.length} file lên Google Drive...`);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (response.status === 401) {
        window.location.href = "/api/auth/google";
        return;
      }
      if (response.status === 403 && result.reauth) {
        setStatus("Google token chưa có quyền Drive. Đang yêu cầu đăng nhập lại để cấp quyền upload...");
        window.location.href = "/api/auth/google";
        return;
      }
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Upload failed");
      }

      const createdAt = new Date().toLocaleString("vi-VN");
      const uploadedFiles = Array.isArray(result.files) ? result.files : [];
      const savedDocs: SavedDoc[] = uploadedFiles.map((file: { fileName: string; fileUrl?: string }) => ({
        id: crypto.randomUUID(),
        title: file.fileName || "Untitled",
        memberId: member.id,
        folderId: folder.id,
        folderName: folder.name,
        fileName: file.fileName || "",
        url: file.fileUrl,
        createdAt
      }));
      persist([...savedDocs, ...docs]);
      setUploadItems(uploadedFiles.map((file: { fileName: string; fileUrl?: string }) => ({
        name: file.fileName,
        status: "done",
        url: file.fileUrl
      })));
      setProgress(100);
      form.reset();
      setStatus(`Upload xong ${uploadedFiles.length} file. File đã nằm trong Google Drive.`);
    } catch (error) {
      setUploadItems((items) => items.map((item) => ({
        ...item,
        status: item.status === "done" ? "done" : "error",
        error: error instanceof Error ? error.message : "Upload chưa thành công."
      })));
      setStatus(error instanceof Error ? error.message : "Upload chưa thành công.");
    } finally {
      setIsUploading(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([`<!doctype html><meta charset="utf-8"><pre>${template}</pre>`], {
      type: "application/msword"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${member.name}-${folder.label}.doc`.replaceAll(" ", "-");
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img src="/favicon.png" alt="NBAI" />
          <div>
            <strong>NBAI Intranet</strong>
            <span>Digital Workers documentation intake</span>
          </div>
        </div>
        <div className="top-actions">
          {googleUser ? (
            <div className="user-chip">
              {googleUser.picture ? <img src={googleUser.picture} alt="" /> : null}
              <div>
                <strong>{googleUser.name || "Google account"}</strong>
                <span>{googleUser.email}</span>
              </div>
            </div>
          ) : (
            <span className="auth-hint">{authChecked ? "Chưa đăng nhập" : "Đang kiểm tra..."}</span>
          )}
          {googleUser ? (
            <a className="link-button ghost" href="/api/auth/logout">Đăng xuất</a>
          ) : null}
          <a className="link-button" href="/api/auth/google">
            {googleUser ? "Cấp lại quyền Drive" : "Đăng nhập Google"}
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">AI4Autism / NBAI ecosystem</p>
            <h1>Intranet thu thập docs để build Digital Workers.</h1>
            <p className="lead">
              Chọn người phụ trách, chọn folder chuẩn, upload tài liệu lên Drive và dùng bộ câu hỏi gợi ý để chuẩn hóa persona,
              skills, rules, workflows.
            </p>
            <div className="hero-actions">
              <a className="link-button" href={process.env.NEXT_PUBLIC_DRIVE_ROOT_URL || "#"} target="_blank">Mở Drive team</a>
              <button type="button" className="ghost" onClick={downloadTemplate}>Tải mẫu Word</button>
            </div>
          </div>
          <img className="hero-logo" src="/nbai-logo.png" alt="NBAI logo" />
          <aside className="login-card">
            <span>Google OAuth + Drive API</span>
            <strong>Yêu cầu đăng nhập trước khi upload</strong>
            <p>Trên Vercel, file upload đi qua API route bảo mật thay vì gọi trực tiếp Apps Script từ browser.</p>
          </aside>
        </section>

        <nav className="tabs" aria-label="Chọn thành viên">
          {members.map((item) => (
            <button
              key={item.id}
              className={item.id === activeMember ? "active" : ""}
              type="button"
              onClick={() => selectMember(item.id)}
            >
              <span style={{ background: item.accent }} />
              {item.name}
            </button>
          ))}
        </nav>

        <section className="member-band">
          <div>
            <p className="eyebrow">{member.company} / {member.short}</p>
            <h2>{member.name}</h2>
            <p>{member.role}</p>
          </div>
          <div className="metrics">
            {member.metrics.map(([value, label]) => (
              <div className="metric" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="content-grid">
          <div className="panel upload-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Upload</p>
                <h3>Tài liệu cho {folder.name}</h3>
              </div>
              <span className="status-pill">{status}</span>
            </div>
            <div className="drive-actions">
              <a className="link-button ghost" href={`/api/drive/member-folder?member=${member.id}`} target="_blank">
                Mở folder {member.company}
              </a>
              <span>
                Folder {member.company} phải có env <code>{member.folderEnv}</code>. Nếu env chưa có, nút mở folder/upload sẽ báo thiếu cấu hình.
              </span>
            </div>

            <div className="folder-tabs">
              {folders.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === activeFolder ? "active" : ""}
                  onClick={() => selectFolder(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form onSubmit={submitDoc}>
              <div className="naming-guide">
                <strong>Đặt tên file trước khi upload</strong>
                <p>Dùng cấu trúc: <code>DonVi_Folder_TenNoiDung.docx</code></p>
                <ul>
                  <li><code>Alpha1_Persona_soul.docx</code></li>
                  <li><code>Alpha1_Skills_thuchi1ngay.docx</code></li>
                  <li><code>Alpha8_Rules_approval-workflow.pdf</code></li>
                  <li><code>Aquaponics_Workflows_sensor-escalation.md</code></li>
                </ul>
              </div>
              <label>
                File Word/PDF/Markdown
                <input name="files" type="file" accept=".doc,.docx,.pdf,.md,.txt,.xlsx,.pptx" multiple required />
              </label>
              <button disabled={isUploading} type="submit">{isUploading ? "Đang upload..." : "Upload lên Drive"}</button>
            </form>
            <div className="progress-wrap" aria-label="Upload progress">
              <div className="progress-bar">
                <span style={{ width: `${progress}%` }} />
              </div>
              <strong>{progress}%</strong>
            </div>
            {uploadItems.length > 0 ? (
              <div className="upload-list">
                {uploadItems.map((item) => (
                  <article key={item.name} className={item.status}>
                    <span>{item.name}</span>
                    {item.url ? <a href={item.url} target="_blank">Mở file</a> : <em>{statusLabel(item.status)}</em>}
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Taxonomy</p>
                <h3>Folder chuẩn</h3>
              </div>
            </div>
            <div className="folder-list">
              {folders.map((item) => (
                <article key={item.id} className={item.id === activeFolder ? "selected" : ""}>
                  <strong>{item.name}</strong>
                  <p>{item.purpose}</p>
                  <ul>
                    {item.files.map((file) => <li key={file}>{file}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Agent discovery</p>
              <h3>Câu hỏi gợi ý để build Digital Workers</h3>
            </div>
            <span className="status-pill">{member.questions.length} câu</span>
          </div>
          <div className="questions">
            {member.questions.map((question, index) => (
              <div className="question" key={question}>
                <span>{index + 1}</span>
                <p>{question}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Drive log</p>
                <h3>Docs đã ghi nhận</h3>
              </div>
              <button className="ghost" type="button" onClick={() => persist(docs.filter((doc) => doc.memberId !== activeMember))}>
                Xóa demo
              </button>
            </div>
            <div className="doc-list">
              {visibleDocs.length === 0 ? (
                <p className="hint">Chưa có tài liệu nào cho tab này.</p>
              ) : visibleDocs.map((doc) => (
                <article key={doc.id}>
                  <strong>{doc.title}</strong>
                  <span>{doc.folderName} · {doc.fileName} · {doc.createdAt}</span>
                  {doc.url ? <a href={doc.url} target="_blank">Mở file Drive</a> : null}
                </article>
              ))}
            </div>
          </div>

          <div className="panel template-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Word starter</p>
                <h3>Mẫu điền nhanh</h3>
              </div>
              <button className="ghost" type="button" onClick={downloadTemplate}>Tải .doc</button>
            </div>
            <textarea readOnly value={template} />
          </div>
        </section>
      </main>
    </>
  );
}

function statusLabel(status: UploadItem["status"]) {
  if (status === "waiting") return "Đang chờ";
  if (status === "uploading") return "Đang upload";
  if (status === "done") return "Đã xong";
  return "Lỗi";
}
