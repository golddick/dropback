import { NextRequest, NextResponse } from "next/server";
import { uploadScreenshot } from "@/lib/dropaphi";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  let fileInfo:
    | { blob: Blob; name: string; type: string }
    | null = null;
  let metadata: Record<string, unknown> = { visibility: "PUBLIC" };

  if (contentType.startsWith("multipart/form-data")) {
    try {
      const form = await req.formData();
      const maybeFile = form.get("file");
      const maybeMetadata = form.get("metadata");

      if (typeof maybeMetadata === "string") {
        try {
          metadata = JSON.parse(maybeMetadata);
        } catch {
          // ignore invalid metadata JSON and use default
        }
      }

      if (maybeFile instanceof File) {
        fileInfo = {
          blob: maybeFile,
          name: maybeFile.name,
          type: maybeFile.type,
        };
      }
    } catch (err) {
      // fall through to JSON fallback
    }
  }

  if (!fileInfo) {
    const body = await req.json().catch(() => null);
    if (
      body &&
      typeof body === "object" &&
      typeof body.name === "string" &&
      typeof body.type === "string" &&
      typeof body.data === "string"
    ) {
      if (body.metadata && typeof body.metadata === "object") {
        metadata = body.metadata;
      }

      const buffer = Buffer.from(body.data, "base64");
      fileInfo = {
        blob: new File([buffer], body.name, { type: body.type }),
        name: body.name,
        type: body.type,
      };
    }
  }

  if (!fileInfo) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const result = await uploadScreenshot({ ...fileInfo, metadata });
    return NextResponse.json({ url: result.url, id: result.id });
  } catch (err) {
    console.error("Screenshot upload failed", err);
    return NextResponse.json(
      { error: "Screenshot upload failed" },
      { status: 500 }
    );
  }
}
