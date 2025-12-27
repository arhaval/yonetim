import { randomBytes } from 'crypto'
import { v4 as uuidv4 } from 'uuid'

/**
 * Güvenli, tahmin edilemez token üretir
 * Format: uuid-randomString (örn: "550e8400-e29b-41d4-a716-446655440000-aB3dEf9GhIjKlMnOpQrStUvWx")
 */
export function generateEditPackToken(): string {
  // UUID v4 oluştur
  const uuid = uuidv4()
  
  // 24-32 karakter arası rastgele string oluştur (base64url benzeri, güvenli karakterler)
  const randomLength = 24 + Math.floor(Math.random() * 9) // 24-32 arası
  const randomString = randomBytes(randomLength)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, randomLength)
  
  return `${uuid}-${randomString}`
}

