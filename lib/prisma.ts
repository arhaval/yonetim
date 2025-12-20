import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DATABASE_URL = process.env.DATABASE_URL?.trim();

function logPrismaDbInfo() {
  if (!DATABASE_URL) {
    console.log("PRISMA_DB_INFO", { error: "DATABASE_URL is missing" });
    return;
  }

  try {
    const u = new URL(DATABASE_URL);
    console.log("PRISMA_DB_INFO", {
      host: u.hostname,
      port: u.port,
      user: u.username,
      db: u.pathname,
      trimmed: process.env.DATABASE_URL === DATABASE_URL,
      rawLen: process.env.DATABASE_URL?.length,
      trimmedLen: DATABASE_URL.length,
    });
  } catch {
    console.log("PRISMA_DB_INFO", { error: "DATABASE_URL is not a valid URL" });
  }
}

if (!globalForPrisma.prisma) {
  logPrismaDbInfo();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
    errorFormat: "minimal",
    // Connection pooling optimizasyonu
    // Supabase connection pooler kullanıyorsanız bu ayarlar otomatik
  });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
