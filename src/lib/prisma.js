import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development
// to prevent exhausting your database connection limit.
// In production, each serverless function gets its own instance
// which is fine because they don't hot-reload.

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // logs every SQL query in your terminal during dev
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
