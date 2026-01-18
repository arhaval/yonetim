import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DATABASE_URL = process.env.DATABASE_URL?.trim();

// Supabase Pro için optimize edilmiş ayarlar
const PRISMA_CONFIG = {
  // Production'da sadece error logla
  log: process.env.NODE_ENV === "development" 
    ? ["error", "warn"] as const
    : ["error"] as const,
  
  // Minimal error format - daha hızlı
  errorFormat: "minimal" as const,
  
  // Datasource
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
};

function validateDatabaseUrl() {
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is missing!");
    return false;
  }

  try {
    const u = new URL(DATABASE_URL);
    
    // Supabase Pro Connection Pooler kontrolü
    if (u.hostname.includes('pooler.supabase.com')) {
      if (!u.username.includes('.')) {
        console.error("❌ Supabase Pooler URL format error - username should be 'postgres.PROJECT_REF'");
        return false;
      }
    }
    
    return true;
  } catch {
    console.error("❌ DATABASE_URL is not a valid URL!");
    return false;
  }
}

// Singleton pattern - tek instance
if (!globalForPrisma.prisma) {
  validateDatabaseUrl();
  
  globalForPrisma.prisma = new PrismaClient(PRISMA_CONFIG);
  
  // Graceful shutdown için
  if (process.env.NODE_ENV === "production") {
    process.on("beforeExit", async () => {
      await globalForPrisma.prisma?.$disconnect();
    });
  }
}

export const prisma = globalForPrisma.prisma;

// Development'ta bağlantı testi
if (process.env.NODE_ENV === "development" && globalForPrisma.prisma) {
  prisma.$connect()
    .then(() => console.log("✅ Database connected"))
    .catch((e: Error) => console.error("❌ Database connection failed:", e.message));
}
