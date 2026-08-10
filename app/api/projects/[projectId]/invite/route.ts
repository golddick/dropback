import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newInviteId } from "@/lib/ids";
import { requireMembership } from "@/lib/access";
import { sendInviteEmail } from "@/lib/dropaphi";

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    // Any existing member (tester or developer) can invite — not just the owner.
    await requireMembership(params.projectId, userId);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }

  const { email, role } = await req.json();
  if (!email || !["tester", "developer"].includes(role)) {
    return NextResponse.json(
      { error: "email and a valid role (tester|developer) are required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const inviter = await prisma.user.findUnique({ where: { id: userId } });

  const invite = await prisma.invite.create({
    data: {
      id: newInviteId(),
      projectId: params.projectId,
      email,
      role,
      token: randomUUID(),
      invitedById: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${invite.token}`;

  try {
    await sendInviteEmail(email, {
      projectName: project.name,
      inviterEmail: inviter?.email ?? "a teammate",
      role,
      inviteUrl,
    });
  } catch (e) {
    // Invite row exists either way — the link still works if email delivery fails.
    console.error("Invite email failed to send", e);
  }

  return NextResponse.json({ inviteUrl });
}
