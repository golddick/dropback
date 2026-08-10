import { prisma } from "./prisma";

/**
 * A user must be an accepted project member to write to a project
 * (comment, change status, upload a record). Being logged in isn't
 * enough — they need to have been invited and accepted first.
 */
export async function getMembership(projectId: string, userId: string) {
  return prisma.member.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
}

export async function requireMembership(projectId: string, userId: string) {
  const membership = await getMembership(projectId, userId);
  if (!membership) {
    throw new Error(
      "You must be a project member to do this. Ask an existing member to invite you."
    );
  }
  return membership;
}
