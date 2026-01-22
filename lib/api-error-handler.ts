import { NextResponse } from "next/server";

export interface ApiError {
  ok: false;
  error: string;
  details?: string;
  code?: string;
}

export function handleApiError(
  error: unknown,
  context: string
): NextResponse<ApiError> {
  console.error(`❌ API Error in ${context}:`, error);

  if (error instanceof Error) {
    console.error("   Message:", error.message);

    // Prisma specific errors
    if (error.message.includes("P2002")) {
      return NextResponse.json(
        {
          ok: false,
          error: "Bu kayıt zaten mevcut",
          details: error.message,
          code: "DUPLICATE_ENTRY",
        },
        { status: 409 }
      );
    }

    if (error.message.includes("P2025")) {
      return NextResponse.json(
        {
          ok: false,
          error: "Kayıt bulunamadı",
          details: error.message,
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Connection errors
    if (
      error.message.includes("connect") ||
      error.message.includes("timeout") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Veritabanı bağlantı hatası",
          details: error.message,
          code: "DB_CONNECTION_ERROR",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Sunucu hatası",
        details: error.message,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Bilinmeyen hata",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  );
}

