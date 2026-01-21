// Client-side cache utility
// Performans için API sonuçlarını cache'ler

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class ClientCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  
  set<T>(key: string, data: T, expiresIn: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    })
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    const now = Date.now()
    const age = now - entry.timestamp
    
    if (age > entry.expiresIn) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }
  
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const now = Date.now()
    const age = now - entry.timestamp
    
    if (age > entry.expiresIn) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
}

export const clientCache = new ClientCache()

// Fetch with cache wrapper
export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit,
  cacheTime: number = 30000
): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options || {})}`
  
  // Check cache first
  const cached = clientCache.get<T>(cacheKey)
  if (cached) {
    console.log(`[Cache HIT] ${url}`)
    return cached
  }
  
  console.log(`[Cache MISS] ${url}`)
  
  // Fetch from API
  const response = await fetch(url, options)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const data = await response.json()
  
  // Store in cache
  clientCache.set(cacheKey, data, cacheTime)
  
  return data
}

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(later, wait)
  }
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

