/**
 * PDF için Türkçe karakterleri ASCII karakterlere çevirir
 * Helvetica font'u Türkçe karakterleri desteklemediği için bu fonksiyon kullanılmalı
 */
export function removeTurkishChars(text: string): string {
  if (!text) return text
  
  return text
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
}

