import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Middleware for benchmarking performance bottlenecks
prisma.$use(async (params, next) => {
  const before = Date.now();

  const result = (await next(params)) as unknown;

  const after = Date.now();

  console.log(
    `Query ${params.model}.${params.action} took ${after - before}ms`,
  );

  return result;
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
