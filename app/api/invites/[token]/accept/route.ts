import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const invite = await prisma.invite.findUnique({
    where: { token: params.token },
  });

  if (!invite || invite.status !== "pending") {
    return NextResponse.json(
      { error: "This invite is invalid or already used." },
      { status: 400 }
    );
  }

  if (invite.expiresAt < new Date()) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "expired" },
    });
    return NextResponse.json({ error: "This invite has expired." }, { status: 400 });
  }

  // The signed-in email must match who was invited — prevents someone else
  // from grabbing a stranger's invite link.
  if (user.email !== invite.email) {
    return NextResponse.json(
      { error: `This invite was sent to ${invite.email}, not ${user.email}.` },
      { status: 403 }
    );
  }

  await prisma.$transaction([
    prisma.member.upsert({
      where: {
        projectId_userId: { projectId: invite.projectId, userId: user.id },
      },
      update: { role: invite.role },
      create: { projectId: invite.projectId, userId: user.id, role: invite.role },
    }),
    prisma.invite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    }),
  ]);

  return NextResponse.json({ projectId: invite.projectId });
}
