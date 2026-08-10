/**
 * DropAPHI client — matches the documented v1 API at dropaphi.xyz/docs.
 * Auth: API key in the `DROP-API-Key` header.
 */

// const rawBaseUrl = process.env.DROPAPHI_BASE_URL || "https://dropaphi.xyz/api";
// const BASE_URL = rawBaseUrl.replace(/\/api\/?$/, "");
const BASE_URL = 'https://dropaphi.xyz/api'
const API_KEY = process.env.DROPAPHI_API_KEY!;

function headers(extra?: Record<string, string>) {
  return {
    "DROP-API-Key": API_KEY,
    ...extra,
  };
}

// ---------- OTP ----------

export async function sendOtp(email: string): Promise<{
  id: string;
  message: string;
  expiresAt: string;
}> {
  const res = await fetch(`${BASE_URL}/v1/otp/send`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      email,
      length: 6,
      expiry: 10,
      brandName: "Dropback",
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `DropAPHI send-otp failed: ${res.status}`);
  }
  return json.data;
}

export async function verifyOtp(
  email: string,
  code: string
): Promise<{ verified: boolean }> {
  const res = await fetch(`${BASE_URL}/v1/otp/verify`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email, code }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    return { verified: false };
  }
  return { verified: json.data.verified };
}

export async function resendOtp(email: string): Promise<{ id: string }> {
  const res = await fetch(`${BASE_URL}/v1/otp/resend`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email, reason: "not_received", length: 6, expiry: 10 }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `DropAPHI resend-otp failed: ${res.status}`);
  }
  return json.data;
}

// ---------- Email (custom content) ----------
// Use DropAPHI's email/send endpoint with custom HTML and plaintext.
// This avoids relying on built-in templates and makes invite/notification
// content reusable across the app.

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
}) {
  const res = await fetch(`${BASE_URL}/v1/email/send`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      fromName: options.fromName ?? "Dropback",
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `DropAPHI send email failed: ${res.status}`);
  }
  return json.data;
}

export async function sendInviteEmail(
  toEmail: string,
  data: {
    projectName: string;
    inviterEmail: string;
    role: string;
    inviteUrl: string;
  }
) {
  const subject = `You're invited to join ${data.projectName} on Dropback`;
  const html = `
    <p>Hello,</p>
    <p><strong>${data.inviterEmail}</strong> invited you to join <strong>${data.projectName}</strong> on Dropback as a <strong>${data.role}</strong>.</p>
    <p><a href="${data.inviteUrl}" style="color:#2563eb;text-decoration:none;">Accept the invite</a></p>
    <p>If the button does not work, copy and paste this link into your browser:</p>
    <p><a href="${data.inviteUrl}">${data.inviteUrl}</a></p>
    <p>Thanks,<br/>The Dropback team</p>
  `;
  const text = `Hello,

${data.inviterEmail} invited you to join ${data.projectName} on Dropback as a ${data.role}.

Accept the invite: ${data.inviteUrl}

Thanks,
The Dropback team`;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    text,
    fromName: "Dropback",
  });
}

export async function sendStatusChangeEmail(
  toEmail: string,
  data: {
    recordNote: string;
    newStatus: string;
    recordUrl: string;
  }
) {
  const subject = `Your report status changed to ${data.newStatus}`;
  const html = `
    <p>Hello,</p>
    <p>The status of your report <strong>${data.recordNote}</strong> has changed to <strong>${data.newStatus}</strong>.</p>
    <p><a href="${data.recordUrl}" style="color:#2563eb;text-decoration:none;">View the record</a></p>
    <p>If the link does not work, copy and paste this URL into your browser:</p>
    <p><a href="${data.recordUrl}">${data.recordUrl}</a></p>
    <p>Thanks,<br/>The Dropback team</p>
  `;
  const text = `Hello,

The status of your report ${data.recordNote} has changed to ${data.newStatus}.

View the record: ${data.recordUrl}

Thanks,
The Dropback team`;

  const res = await sendEmail({
    to: toEmail,
    subject,
    html,
    text,
    fromName: "Dropback",
  });
  return res;
}

// ---------- Files (used for screenshot uploads) ----------

export async function uploadScreenshot(params: {
  blob: Blob;
  name: string;
  type: string;
  metadata?: Record<string, unknown>;
}): Promise<{
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
}> {
  const arrayBuffer = await params.blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const res = await fetch(`https://dropaphi.xyz/api/v1/files/upload`, {
  // const res = await fetch(`http://localhost:3001/api/v1/files/upload`, {
    method: "POST",
    headers: {
      "DROP-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: params.name || "screenshot.png",
      type: params.type,
      data: base64,
      metadata: params.metadata ?? { visibility: "PUBLIC" },
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `DropAPHI file upload failed: ${res.status}`);
  }
  return json.data;
}
