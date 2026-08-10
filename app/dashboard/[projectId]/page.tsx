import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireMembership } from "@/lib/access";
import { Tree } from "@/components/Tree";
import { InviteMemberForm } from "@/components/InviteMemberForm";
import { ProjectExportControl } from "@/components/ProjectExportControl";
import { ProjectMembersButton } from "@/components/ProjectMembersButton";
import { prisma } from "@/lib/prisma";
import { RecordsView } from "@/components/RecordsView";
import { ShareProjectLink } from "@/components/ShareProjectLink";

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const projectId = params.projectId;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const isAuthenticated = Boolean(userId);

  if (isAuthenticated) {
    try {
      await requireMembership(projectId, userId);
    } catch (error) {
      return <main className="max-w-5xl mx-auto px-6 py-16">You are not a member of this project.</main>;
    }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: { user: true },
      },
    },
  });

  if (!project) {
    return <main className="max-w-5xl mx-auto px-6 py-16">Project not found.</main>;
  }

  const recordsRaw = await prisma.testRecord.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });

  const records = recordsRaw.map((r) => ({
    id: r.id,
    note:
      (r.events.find((ev) => ev.type === "note" || ev.type === "comment")?.payload as any)
        ?.text ?? "",
    status: r.status,
    updatedAt: (r.events[r.events.length - 1]?.createdAt ?? r.createdAt).toISOString(),
  }));

  const verifiedCount = records.filter((r) => r.status === "verified").length;

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-start justify-between mb-10">
        <div>
          <Link href="/dashboard" className="text-sm text-amber hover:underline mb-2 inline-flex items-center gap-2">
            ← Back to projects
          </Link>
          <p className="font-mono text-xs text-muted mb-1">PROJECT</p>
          <h1 className="font-display text-3xl font-bold">{project.name}</h1>
          <div className="mt-2 gap-2 space-y-3">
            {!isAuthenticated ? (
              <div className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-muted">
                View-only mode. Sign in to edit, create records, or invite teammates.
              </div>
            ) : (
              <>
                <InviteMemberForm projectId={projectId} />
                <ProjectMembersButton members={project.members} />
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <ShareProjectLink projectId={projectId} />
          {isAuthenticated ? (
            <>
              <ProjectExportControl projectId={projectId} />
              <Link href={`/dashboard/${projectId}/new`} className="bg-amber text-ink font-medium px-4 py-2 rounded-lg hover:opacity-90 transition">
                New record
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_180px] gap-10">
        <div className="space-y-3">
          <RecordsView records={records} />
        </div>

        <div className="hidden md:block">
          <p className="font-mono text-xs text-muted mb-3 text-center">{verifiedCount} verified</p>
          <Tree verifiedCount={verifiedCount} />
        </div>
      </div>
    </main>
  );
}
