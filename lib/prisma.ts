import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma Client'ı singleton pattern ile oluştur
// Supabase Connection Pooler için özel ayarlar
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Connection pooling ayarları - performans için
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Her zaman singleton kullan (Vercel serverless için)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

