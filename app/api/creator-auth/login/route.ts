import { NextRequest } from 'next/server'
import { handleLogin } from '@/lib/auth-unified'

export const dynamic = 'force-dynamic'

/**
 * Content creator login endpoint
 * Unified authentication sistemi kullanıyor
 */
export async function POST(request: NextRequest) {
  return handleLogin(request, 'creator')
}



