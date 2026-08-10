import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Video only — screenshots go through DropAPHI's Files API instead.
  // 8MB cap per the project doc.
  videoUploader: f({ video: { maxFileSize: "8MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      // file.url is the hosted URL — the client reads this back to attach
      // a `video` record_event with { url: file.url } as the payload.
      console.log("Video uploaded:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
