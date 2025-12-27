import { NextRequest } from 'next/server'
import { handleLogin } from '@/lib/auth-unified'

/**
 * Team member login endpoint
 * Unified authentication sistemi kullanıyor
 */
export async function POST(request: NextRequest) {
  return handleLogin(request, 'team')
}

