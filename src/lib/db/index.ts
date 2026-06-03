import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Forcem la creació d'una instància simple sense passar objectes d'adaptadors
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["query", "error", "warn"],
  });
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;