// Basit rate limiting için in-memory store
// Production'da Redis kullanılabilir

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Eski kayıtları temizle (memory leak önleme)
// Serverless ortamda setInterval kullanılmaz, her istekte temizlik yapılır
function cleanup() {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key]
    }
  })
}

export function rateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 dakika
): { allowed: boolean; remaining: number; resetTime: number } {
  // Eski kayıtları temizle
  cleanup()
  
  const now = Date.now()
  const key = identifier

  // Store'da yoksa veya süresi dolmuşsa yeni kayıt oluştur
  if (!store[key] || now > store[key].resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: store[key].resetTime,
    }
  }

  // Limit aşılmış mı kontrol et
  if (store[key].count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    }
  }

  // Sayacı artır
  store[key].count++
  return {
    allowed: true,
    remaining: maxRequests - store[key].count,
    resetTime: store[key].resetTime,
  }
}
