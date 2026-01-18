import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DATABASE_URL = process.env.DATABASE_URL?.trim();

function validateDatabaseUrl() {
  if (!DATABASE_URL) {
    console.error("❌ PRISMA_ERROR: DATABASE_URL environment variable is missing!");
    console.error("💡 Çözüm: Vercel Dashboard → Settings → Environment Variables → DATABASE_URL ekleyin");
    return false;
  }

  try {
    const u = new URL(DATABASE_URL);
    const username = u.username;
    
    // Supabase Connection Pooler için kullanıcı adı kontrolü
    if (u.hostname.includes('pooler.supabase.com')) {
      if (!username.includes('.')) {
        console.error("❌ PRISMA_ERROR: Supabase Connection Pooler URL'inde kullanıcı adı formatı yanlış!");
        console.error(`   Mevcut kullanıcı adı: ${username}`);
        console.error("💡 Çözüm: Kullanıcı adı 'postgres.PROJECT_REF' formatında olmalı (nokta var!)");
        console.error("   Örnek: postgresql://postgres.kwrbcwspdjlgixjkplzq:password@...");
        return false;
      }
      
      if (!u.searchParams.has('pgbouncer')) {
        console.warn("⚠️ PRISMA_WARNING: Connection Pooler URL'inde 'pgbouncer=true' parametresi eksik!");
        console.warn("   Önerilen format: ...?pgbouncer=true");
      }
    }

    // Normal Supabase URL kontrolü
    if (u.hostname.includes('supabase.co') && !username.includes('.')) {
      console.warn("⚠️ PRISMA_WARNING: Supabase URL'inde kullanıcı adı formatı kontrol edin!");
      console.warn(`   Mevcut kullanıcı adı: ${username}`);
      console.warn("   Önerilen format: postgres.PROJECT_REF");
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ PRISMA_DB_INFO", {
        host: u.hostname,
        port: u.port || "default",
        user: username,
        db: u.pathname,
        isPooler: u.hostname.includes('pooler.supabase.com'),
      });
    }
    
    return true;
  } catch (error) {
    console.error("❌ PRISMA_ERROR: DATABASE_URL is not a valid URL!");
    console.error("   Hata:", error);
    return false;
  }
}

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
  validateDatabaseUrl();
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
  });

// Prisma Accelerate veya connection pooling için
// @ts-ignore - Prisma extension
prisma.$extends?.({
  query: {
    $allOperations({ operation, model, args, query }: any) {
      const start = performance.now();
      return query(args).finally(() => {
        const end = performance.now();
        if (end - start > 1000) {
          console.warn(`[SLOW QUERY] ${model}.${operation} took ${(end - start).toFixed(2)}ms`);
        }
      });
    },
  },
});

// Connection test ve error handling
if (!globalForPrisma.prisma) {
  // İlk bağlantıda test et (sadece development'ta)
  if (process.env.NODE_ENV === "development") {
    prisma.$connect()
      .then(() => {
        console.log("✅ Prisma database connection successful");
      })
      .catch((error: any) => {
        console.error("❌ Prisma database connection failed!");
        if (error.message?.includes("Tenant") || error.message?.includes("user not found")) {
          console.error("💡 Bu hata genellikle DATABASE_URL'deki kullanıcı adı formatından kaynaklanır.");
          console.error("💡 Supabase Connection Pooler kullanıyorsanız:");
          console.error("   - Kullanıcı adı: postgres.PROJECT_REF (nokta var!)");
          console.error("   - Örnek: postgresql://postgres.kwrbcwspdjlgixjkplzq:password@...");
          console.error("💡 Vercel Dashboard → Settings → Environment Variables → DATABASE_URL'i kontrol edin");
        }
        console.error("   Hata detayı:", error.message);
      });
  }
  
  globalForPrisma.prisma = prisma;
}
