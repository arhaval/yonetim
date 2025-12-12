'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { format, parse, addMonths, subMonths } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { Save, Instagram, Youtube, Twitter, Twitch, Music } from 'lucide-react'

const platforms = [
  { name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500' },
  { name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
  { name: 'X', icon: Twitter, color: 'from-gray-800 to-gray-900' },
  { name: 'Twitch', icon: Twitch, color: 'from-purple-500 to-purple-600' },
  { name: 'TikTok', icon: Music, color: 'from-black to-gray-800' },
]

export default function SocialMediaPage() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<Record<string, { followerCount: number; target: number | null }>>({})
  const [previousStats, setPreviousStats] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/social-media?month=${selectedMonth}`)
      const data = await response.json()

      const currentStats: Record<string, { followerCount: number; target: number | null }> = {}
      platforms.forEach((platform) => {
        const stat = data.currentMonth.find((s: any) => s.platform === platform.name)
        currentStats[platform.name] = {
          followerCount: stat?.followerCount || 0,
          target: stat?.target || null,
        }
      })
      setStats(currentStats)

      const prevStats: Record<string, number> = {}
      platforms.forEach((platform) => {
        const stat = data.previousMonth.find((s: any) => s.platform === platform.name)
        prevStats[platform.name] = stat?.followerCount || 0
      })
      setPreviousStats(prevStats)
    } catch (error) {
      console.error('Error fetching social media stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const statsToSave = platforms.map((platform) => ({
        month: selectedMonth,
        platform: platform.name,
        followerCount: stats[platform.name]?.followerCount || 0,
        target: stats[platform.name]?.target || null,
      }))

      await fetch('/api/social-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: statsToSave }),
      })

      alert('Sosyal medya istatistikleri kaydedildi!')
      // Verileri yeniden yükle
      await fetchData()
    } catch (error) {
      alert('Hata: İstatistikler kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const initializeMonth = async (month: string) => {
    try {
      const response = await fetch('/api/social-media/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
      })

      if (response.ok) {
        alert('Başlangıç değerleri eklendi!')
        await fetchData()
      } else {
        alert('Hata: Başlangıç değerleri eklenemedi')
      }
    } catch (error) {
      alert('Hata: Başlangıç değerleri eklenemedi')
    }
  }

  const copyFromPreviousMonth = async (month: string) => {
    if (!confirm('Önceki ayın verilerini bu aya kopyalamak istediğinizden emin misiniz? Mevcut veriler güncellenecektir.')) {
      return
    }

    try {
      const response = await fetch('/api/social-media/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMonth: month }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Önceki ayın verileri kopyalandı!')
        await fetchData()
      } else {
        alert(data.error || 'Hata: Veriler kopyalanamadı')
      }
    } catch (error) {
      alert('Hata: Veriler kopyalanamadı')
    }
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: current > 0, absoluteChange: current }
    const change = ((current - previous) / previous) * 100
    const absoluteChange = current - previous
    return { value: Math.abs(change), isPositive: change >= 0, absoluteChange }
  }

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = subMonths(now, i)
      const value = format(date, 'yyyy-MM')
      const label = format(date, 'MMMM yyyy', { locale: tr })
      options.push({ value, label })
    }
    return options
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Sosyal Medya Takibi
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Her ay için sosyal medya takipçi sayılarını güncelleyin
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {getMonthOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => copyFromPreviousMonth(selectedMonth)}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm mr-2"
            >
              Önceki Aydan Kopyala
            </button>
            <button
              onClick={() => initializeMonth(selectedMonth)}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all text-sm mr-2"
            >
              Başlangıç Değerleri
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon
            const current = stats[platform.name]?.followerCount || 0
            const previous = previousStats[platform.name] || 0
            const target = stats[platform.name]?.target || null
            const change = calculateChange(current, previous)
            const progress = target ? Math.min((current / target) * 100, 100) : 0

            return (
              <div
                key={platform.name}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {current.toLocaleString('tr-TR')}
                    </p>
                    {previous > 0 && change.absoluteChange !== 0 && (
                      <div className="flex items-center justify-end gap-1">
                        <span className={`text-sm font-bold ${
                          change.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {change.isPositive ? '↑' : '↓'}
                        </span>
                        <span className={`text-sm font-bold ${
                          change.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {change.isPositive ? '+' : ''}{change.absoluteChange.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Takipçi Sayısı
                  </label>
                  <input
                    type="number"
                    value={current}
                    onChange={(e) => {
                      setStats({
                        ...stats,
                        [platform.name]: {
                          ...stats[platform.name],
                          followerCount: parseInt(e.target.value) || 0,
                        },
                      })
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                  />
                  {previous > 0 && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Önceki ay: {previous.toLocaleString('tr-TR')}</span>
                      {change.absoluteChange !== 0 && (
                        <span className={`font-semibold ${
                          change.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {change.isPositive ? '↑' : '↓'} {change.isPositive ? '+' : ''}{change.absoluteChange.toLocaleString('tr-TR')} 
                          <span className="ml-1 text-gray-500">
                            ({change.isPositive ? '+' : ''}{change.value.toFixed(1)}%)
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hedef (Opsiyonel)
                  </label>
                  <input
                    type="number"
                    value={target || ''}
                    onChange={(e) => {
                      setStats({
                        ...stats,
                        [platform.name]: {
                          ...stats[platform.name],
                          target: e.target.value ? parseInt(e.target.value) : null,
                        },
                      })
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Hedef belirle"
                  />
                </div>

                {target && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>İlerleme</span>
                      <span>%{progress.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 bg-gradient-to-r ${platform.color} rounded-full transition-all`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {previous > 0 && (
                  <p className="text-xs text-gray-500 mt-3">
                    Önceki ay: {previous.toLocaleString('tr-TR')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

