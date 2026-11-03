import { PrismaClient } from "@prisma/client";

// Tell TypeScript that globalThis may carry a cached Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // logs every SQL query in your terminal during dev
  });

// Cache the client in development so hot reloads reuse it
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
