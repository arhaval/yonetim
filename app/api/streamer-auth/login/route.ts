import { NextRequest } from 'next/server'
import { handleLogin } from '@/lib/auth-unified'

/**
 * Streamer login endpoint
 * Unified authentication sistemi kullanıyor
 */
export async function POST(request: NextRequest) {
  return handleLogin(request, 'streamer')
}


