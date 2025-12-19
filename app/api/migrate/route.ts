import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Veritabanı migration endpoint'i (sadece admin)
export async function POST(request: NextRequest) {
  try {
    // Bu endpoint'i sadece admin kullanabilir
    const authHeader = request.headers.get("authorization");
    const secretToken = process.env.MIGRATION_SECRET || "arhaval-migration-2024";

    if (authHeader !== `Bearer ${secretToken}`) {
      return NextResponse.json(
        {
          error: "Yetkisiz erişim",
          hint: "Authorization header'ında Bearer token göndermelisiniz. Örnek: Authorization: Bearer arhaval-migration-2024",
        },
        { status: 401 }
      );
    }

    // IBAN kolonlarını ekle (eğer yoksa)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "ContentCreator"
        ADD COLUMN IF NOT EXISTS "iban" TEXT;
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "VoiceActor"
        ADD COLUMN IF NOT EXISTS "iban" TEXT;
      `);

      return NextResponse.json({
        message: "Migration başarıyla tamamlandı",
        success: true,
      });
    } catch (error: any) {
      if (
        error.message?.includes("already exists") ||
        error.message?.includes("duplicate")
      ) {
        return NextResponse.json({
          message: "Kolonlar zaten mevcut",
          success: true,
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: error.message || "Migration başarısız" },
      { status: 500 }
    );
  }
}
