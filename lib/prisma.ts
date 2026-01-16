import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from '@prisma/adapter-libsql';

// Evita di creare più istanze in sviluppo (Hot Reload Next.js)
const globalForPrisma = globalThis as unknown as { prismaLat?: PrismaClient };

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? '',
});

export const prisma =
  globalForPrisma.prismaLat ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaLat = prisma;
}
