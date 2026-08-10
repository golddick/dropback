import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const invite = await prisma.invite.findUnique({
    where: { token: params.token },
    include: { project: true, invitedBy: true },
  });

  if (!invite || invite.status !== "pending" || invite.expiresAt < new Date()) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold mb-2">
            Invite not valid
          </h1>
          <p className="text-muted">
            This invite link has expired or was already used.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-amber mb-4">
          You're invited
        </p>
        <h1 className="font-display text-2xl font-bold mb-2">
          Join {invite.project.name} on Dropback
        </h1>
        <p className="text-muted mb-8">
          {invite.invitedBy.email} invited you as a{" "}
          <span className="text-text">{invite.role}</span>.
        </p>
        <Link
          href={`/login?inviteToken=${invite.token}`}
          className="bg-amber text-ink font-medium px-6 py-3 rounded-lg hover:opacity-90 transition inline-block"
        >
          Sign in to accept
        </Link>
        <p className="text-muted text-xs font-mono mt-4">
          Sign in with {invite.email} — that's who this invite was sent to.
        </p>
      </div>
    </main>
  );
}
