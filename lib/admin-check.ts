import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Admin kontrolü yapan helper function
 * Sadece admin role'üne sahip kullanıcıların erişimine izin verir
 */
export async function requireAdmin() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user-id')?.value
  const userRole = cookieStore.get('user-role')?.value

  if (!userId) {
    return NextResponse.json(
      { error: 'Giriş yapmanız gerekmektedir' },
      { status: 401 }
    )
  }

  if (userRole !== 'admin' && userRole !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Bu işlem için admin yetkisi gerekmektedir' },
      { status: 403 }
    )
  }

  return null // Admin ise null döner, hata varsa NextResponse döner
}

