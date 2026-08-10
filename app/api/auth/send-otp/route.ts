import { NextRequest, NextResponse } from "next/server";
import { sendOtp } from "@/lib/dropaphi";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    await sendOtp(email);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to send code" },
      { status: 500 }
    );
  }
}
