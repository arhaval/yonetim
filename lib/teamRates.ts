// Takım bazlı ücret yapısı
// Sangal: 400₺/saat → Yayıncı 300₺, Arhaval 100₺
// Eternal Fire: 500₺/saat → Yayıncı 300₺, Arhaval 200₺
// Arhaval: (kendi yayınları için özel fiyatlandırma olabilir)

export const TEAM_RATES = {
  'Sangal': {
    totalRevenue: 400,      // Takımdan alınan toplam ücret (saatlik)
    streamerEarning: 300,   // Yayıncının alacağı ücret (saatlik)
    arhavalProfit: 100,     // Arhaval'ın karı (saatlik)
  },
  'Eternal Fire': {
    totalRevenue: 500,      // Takımdan alınan toplam ücret (saatlik)
    streamerEarning: 300,   // Yayıncının alacağı ücret (saatlik)
    arhavalProfit: 200,     // Arhaval'ın karı (saatlik)
  },
  'Arhaval': {
    totalRevenue: 0,        // Kendi yayınları için özel fiyatlandırma
    streamerEarning: 300,   // Yayıncının alacağı ücret (saatlik)
    arhavalProfit: 0,       // Kendi yayınları için özel hesaplama
  },
} as const

export type TeamName = keyof typeof TEAM_RATES

export function calculateStreamEarnings(teamName: TeamName, duration: number) {
  const rates = TEAM_RATES[teamName]
  return {
    totalRevenue: rates.totalRevenue * duration,
    streamerEarning: rates.streamerEarning * duration,
    arhavalProfit: rates.arhavalProfit * duration,
  }
}



















