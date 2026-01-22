import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DATABASE_URL = process.env.DATABASE_URL?.trim();

function validateDatabaseUrl() {
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is missing!");
    throw new Error("DATABASE_URL is required!");
  }

  try {
    const u = new URL(DATABASE_URL);
    
    // ZORUNLU: Pooler kullanımı kontrolü
    if (!u.hostname.includes('pooler.supabase.com')) {
      console.error("❌ KRITIK HATA: DATABASE_URL pooler kullanmıyor!");
      console.error("Mevcut hostname:", u.hostname);
      console.error("Olması gereken: aws-1-eu-north-1.pooler.supabase.com");
      throw new Error("DATABASE_URL must use pooler.supabase.com!");
    }

    // ZORUNLU: Port 5432 kontrolü
    if (u.port !== '5432' && !DATABASE_URL.includes(':5432/')) {
      console.error("❌ KRITIK HATA: DATABASE_URL yanlış port kullanıyor!");
      console.error("Mevcut port:", u.port || 'default');
      console.error("Olması gereken port: 5432");
      throw new Error("DATABASE_URL must use port 5432!");
    }

    // Supabase Pro Connection Pooler format kontrolü
    if (u.hostname.includes('pooler.supabase.com')) {
      if (!u.username.includes('.')) {
        console.error("❌ Supabase Pooler URL format error - username should be 'postgres.PROJECT_REF'");
        throw new Error("Invalid Supabase pooler username format!");
      }
    }
    
    console.log("✅ Database URL validation passed");
    console.log("   Hostname:", u.hostname);
    console.log("   Port:", u.port || '5432 (default)');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ DATABASE_URL validation failed:", error.message);
      throw error;
    }
    console.error("❌ DATABASE_URL is not a valid URL!");
    throw new Error("Invalid DATABASE_URL format!");
  }
}

// Singleton pattern - tek instance
if (!globalForPrisma.prisma) {
  validateDatabaseUrl();
  
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["error", "warn"]
      : ["error"],
    errorFormat: "minimal",
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });
  
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
