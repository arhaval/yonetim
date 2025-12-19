import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function logPrismaDbInfo() {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    console.log("PRISMA_DB_INFO", { error: "DATABASE_URL is missing" });
    return;
  }

  try {
    const u = new URL(raw);
    console.log("PRISMA_DB_INFO", {
      host: u.hostname,
      port: u.port,
      user: u.username,
      db: u.pathname,
    });
  } catch (e) {
    console.log("PRISMA_DB_INFO", { error: "DATABASE_URL is not a valid URL" });
  }
}

// sadece ilk oluşturulurken logla (log spam olmasın)
if (!globalForPrisma.prisma) {
  logPrismaDbInfo();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // burada kalsın
      },
    },
    errorFormat: "minimal",
  });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
