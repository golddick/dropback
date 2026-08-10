import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error(
    "Prisma connection string is not configured. Set DATABASE_URL or DIRECT_URL."
  );
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
