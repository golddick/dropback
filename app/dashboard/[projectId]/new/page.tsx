"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";

type Attachment = { kind: "screenshot" | "video"; url: string } | null;

export default function NewRecordPage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  const [attachment, setAttachment] = useState<Attachment>(null);
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
      // UploadThing handles video
      await startUpload([file]);
      return;
    }

    // DropAPHI handles screenshots.
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload: any = { projectId: params.projectId, url, note };
    if (attachment) payload.attachment = attachment;

    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    if (!res.ok) return;
    const json = await res.json();
    router.push(`/record/${json.recordId}`);
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-bold mb-8">New record</h1>

      <form onSubmit={handleSubmit} className="space-y-6" onPaste={handlePaste}>
        <div>
          <label className="block text-sm font-mono text-muted mb-2">
            Page URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourapp.com/checkout"
            className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:border-amber"
          />
        </div>

        <div>
          <label className="block text-sm font-mono text-muted mb-2">
            Screenshot or video
          </label>
          <div className="border border-dashed border-hairline rounded-lg p-8 text-center">
            {uploading ? (
              <p className="text-muted text-sm font-mono">Uploading…</p>
            ) : attachment ? (
              <div>
                {attachment.kind === "screenshot" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.url}
                    alt="Uploaded screenshot"
                    className="max-h-48 mx-auto rounded-lg mb-2"
                  />
                ) : (
                  <video
                    src={attachment.url}
                    controls
                    className="max-h-48 mx-auto rounded-lg mb-2"
                  />
                )}
                <p className="text-muted text-xs font-mono">
                  {pendingFile?.name}
                </p>
              </div>
            ) : (
              <p className="text-muted text-sm">
                Paste a screenshot (⌘V) or{" "}
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
          {fileError && (
            <p className="text-signal-red text-xs font-mono mt-2">
              {fileError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-mono text-muted mb-2">
            What's wrong?
          </label>
          <textarea
            required
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe what happened and what you expected instead."
            className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:border-amber resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="bg-amber text-ink font-medium px-6 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit record"}
        </button>
      </form>
    </main>
  );
}
