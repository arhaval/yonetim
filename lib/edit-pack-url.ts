/**
 * Edit Pack URL oluşturma utility fonksiyonu
 * Hem client hem server tarafında çalışır
 */

/**
 * Edit Pack URL'i oluşturur
 * @param token - Edit pack token (32+ karakter)
 * @returns Edit pack URL'i veya null (token geçersizse)
 */
export function createEditPackUrl(token: string | null | undefined): string | null {
  // Token kontrolü - boş, undefined veya geçersiz token'lar için null döndür
  if (!token || typeof token !== 'string' || token.trim() === '' || token === '#') {
    return null
  }

  // Base URL belirleme
  let baseUrl: string

  // Client tarafında (browser)
  if (typeof window !== 'undefined') {
    baseUrl = window.location.origin
  }
  // Server tarafında
  else {
    // Önce NEXT_PUBLIC_BASE_URL kontrol et
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    }
    // Vercel URL'i kontrol et
    else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    }
    // Fallback
    else {
      baseUrl = 'https://yonetim.arhaval.com'
    }
  }

  return `${baseUrl}/edit-pack/${token}`
}

