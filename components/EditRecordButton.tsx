"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

type Attachment = { kind: "screenshot" | "video"; url: string } | null;

export default function EditRecordButton({
  recordId,
  currentUrl,
  currentNote,
  currentAttachment,
}: {
  recordId: string;
  currentUrl: string;
  currentNote: string;
  currentAttachment: Attachment;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(currentUrl ?? "");
  const [note, setNote] = useState(currentNote ?? "");
  const [attachment, setAttachment] = useState<Attachment>(currentAttachment);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { startUpload } = useUploadThing("videoUploader", {
    onClientUploadComplete: (res) => {
      const uploaded = res?.[0];
      if (uploaded) setAttachment({ kind: "video", url: uploaded.url });
      setUploading(false);
    },
    onUploadError: () => {
      setFileError("Video upload failed. Try again.");
      setUploading(false);
    },
  });

  async function handleFile(file: File) {
    setFileError("");
    setPendingFile(file);
    setUploading(true);

    if (file.type.startsWith("video/")) {
      if (file.size > 10 * 1024 * 1024) {
        setFileError("Videos are capped at 10MB. Try a screenshot instead.");
        setUploading(false);
        setPendingFile(null);
        return;
      }
      await startUpload([file]);
      return;
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    const base64 = btoa(binary);

    const res = await fetch("/api/upload-screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        type: file.type,
        data: base64,
        metadata: {
          visibility: "PUBLIC",
          folder: "screenshots",
        },
      }),
    });
    setUploading(false);
    if (!res.ok) {
      setFileError("Screenshot upload failed. Try again.");
      return;
    }
    const { url: uploadedUrl } = await res.json();
    setAttachment({ kind: "screenshot", url: uploadedUrl });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const item = Array.from(e.clipboardData.items).find((i) =>
      i.type.startsWith("image/")
    );
    if (item) {
      const blob = item.getAsFile();
      if (blob) handleFile(blob);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/records/${recordId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url || null,
        note,
        attachment,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setOpen(false);
      window.location.reload();
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="px-2 py-1 rounded border text-sm">
        Edit
      </button>
      {open ? (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <form onSubmit={handleSave} onPaste={handlePaste} className="bg-surface border border-hairline rounded-xl p-6 w-full max-w-md z-10">
            <h2 className="font-display text-lg font-bold mb-3">Edit record</h2>

            <div className="mb-4">
              <label className="block text-sm text-muted mb-1">URL</label>
              <input
                value={url ?? ""}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-surface border border-hairline rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-muted mb-1">What's wrong?</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full bg-surface border border-hairline rounded px-3 py-2 resize-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-muted mb-1">Screenshot or video</label>
              <div className="border border-dashed border-hairline rounded-lg p-5 text-center">
                {uploading ? (
                  <p className="text-muted text-sm font-mono">Uploading…</p>
                ) : attachment ? (
                  <div>
                    {attachment.kind === "screenshot" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={attachment.url} alt="Attachment preview" className="max-h-48 mx-auto rounded-lg mb-2" />
                    ) : (
                      <video src={attachment.url} controls className="max-h-48 mx-auto rounded-lg mb-2" />
                    )}
                    <p className="text-muted text-xs font-mono">{pendingFile?.name}</p>
                  </div>
                ) : (
                  <p className="text-muted text-sm">
                    Paste a screenshot (⌘V) or{' '}
                    <label className="text-amber cursor-pointer underline">
                      choose a file
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
 
                  </p>
                )}
              </div>
              {fileError && <p className="text-signal-red text-xs font-mono mt-2">{fileError}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg border">
                Cancel
              </button>
              <button type="submit" disabled={submitting || uploading} className="bg-amber text-ink px-4 py-2 rounded-lg">
                {submitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
