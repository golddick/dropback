"use client";

import React from "react";

export default function MediaViewer({ open, url, type, onClose }: { open: boolean; url?: string; type?: "screenshot" | "video"; onClose: () => void; }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 max-w-4xl w-full p-4">
        <div className="bg-surface border border-hairline rounded-xl p-4">
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="px-2 py-1 rounded border">Close</button>
          </div>
          <div className="flex justify-center">
            {type === "video" ? (
              <video src={url} controls className="max-h-[70vh] max-w-full rounded-lg" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="media" className="max-h-[70vh] max-w-full rounded-lg" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
