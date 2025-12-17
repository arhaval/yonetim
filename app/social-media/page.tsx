'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { format, subMonths, subWeeks, getWeek, getYear } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { Save, Instagram, Youtube, Twitter, Twitch, Music, Table2, Grid, TrendingUp, TrendingDown } from 'lucide-react'

const platforms = [
  { name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500' },
  { name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
  { name: 'X', icon: Twitter, color: 'from-gray-800 to-gray-900' },
  { name: 'Twitch', icon: Twitch, color: 'from-purple-500 to-purple-600' },
  { name: 'TikTok', icon: Music, color: 'from-black to-gray-800' },
]

// Hafta formatını oluştur (2024-W01 gibi)
function getWeekString(date: Date): string {
  const year = getYear(date)
  const week = getWeek(date, { weekStartsOn: 1 })
  return `${year}-W${week.toString().padStart(2, '0')}`
}

type PeriodType = 'month' | 'week'
type ViewType = 'cards' | 'table'

export default function SocialMediaPage() {
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), 'yyyy-MM'))
  const [viewType, setViewType] = useState<ViewType>('cards')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<Record<string, { followerCount: number; target: number | null }>>({})
  const [previousStats, setPreviousStats] = useState<Record<string, number>>({})
  const [allHistory, setAllHistory] = useState<any[]>([])
  const [inputValues, setInputValues] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchData()
  }, [periodType, selectedPeriod])

  useEffect(() => {
    if (viewType === 'table') {
      fetchHistory()
    }
  }, [viewType])

  const fetchData = async () => {
    setLoading(true)
    try {
      const periodParam = periodType === 'week' ? `week=${selectedPeriod}` : `month=${selectedPeriod}`
      const response = await fetch(`/api/social-media?periodType=${periodType}&${periodParam}`)
      const data = await response.json()

      const currentStats: Record<string, { followerCount: number; target: number | null }> = {}
      platforms.forEach((platform) => {
        const stat = data.currentPeriod?.find((s: any) => s.platform === platform.name)
        currentStats[platform.name] = {
          followerCount: stat?.followerCount || 0,
          target: stat?.target || null,
        }
      })
      setStats(currentStats)
      setInputValues(
        platforms.reduce((acc, p) => {
          acc[p.name] = currentStats[p.name]?.followerCount || 0
          return acc
        }, {} as Record<string, number>)
      )

      const prevStats: Record<string, number> = {}
      platforms.forEach((platform) => {
        const stat = data.previousPeriod?.find((s: any) => s.platform === platform.name)
        prevStats[platform.name] = stat?.followerCount || 0
      })
      setPreviousStats(prevStats)
    } catch (error) {
      console.error('Error fetching social media stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/social-media?allHistory=true')
      const data = await response.json()
      setAllHistory(data.allStats || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const statsToSave = platforms.map((platform) => ({
        month: periodType === 'month' ? selectedPeriod : null,
        week: periodType === 'week' ? selectedPeriod : null,
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
      await fetchData()
      if (viewType === 'table') {
        await fetchHistory()
      }
    } catch (error) {
      alert('Hata: İstatistikler kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const initializePeriod = async () => {
    try {
      const response = await fetch('/api/social-media/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: periodType === 'month' ? selectedPeriod : null, week: periodType === 'week' ? selectedPeriod : null }),
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

  const copyFromPreviousPeriod = async () => {
    if (!confirm(`Önceki ${periodType === 'month' ? 'ayın' : 'haftanın'} verilerini bu ${periodType === 'month' ? 'aya' : 'haftaya'} kopyalamak istediğinizden emin misiniz? Mevcut veriler güncellenecektir.`)) {
      return
    }

    try {
      const response = await fetch('/api/social-media/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetMonth: periodType === 'month' ? selectedPeriod : null,
          targetWeek: periodType === 'week' ? selectedPeriod : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Önceki dönemin verileri kopyalandı!')
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

  const getPeriodOptions = () => {
    const options = []
    const now = new Date()
    
    if (periodType === 'month') {
      for (let i = 0; i < 12; i++) {
        const date = subMonths(now, i)
        const value = format(date, 'yyyy-MM')
        const label = format(date, 'MMMM yyyy', { locale: tr })
        options.push({ value, label })
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const date = subWeeks(now, i)
        const value = getWeekString(date)
        const weekNum = getWeek(date, { weekStartsOn: 1 })
        const label = `${getYear(date)} - Hafta ${weekNum}`
        options.push({ value, label })
      }
    }
    return options
  }

  const handleInputChange = (platform: string, value: string) => {
    const numValue = parseInt(value) || 0
    setInputValues({ ...inputValues, [platform]: numValue })
    
    const previous = previousStats[platform] || 0
    const change = calculateChange(numValue, previous)
    
    setStats({
      ...stats,
      [platform]: {
        ...stats[platform],
        followerCount: numValue,
      },
    })
  }

  const getHistoryForPlatform = (platform: string) => {
    return allHistory
      .filter((stat: any) => stat.platform === platform)
      .sort((a: any, b: any) => {
        // Önce month'a göre, sonra week'e göre sırala
        if (a.month && b.month) {
          return b.month.localeCompare(a.month)
        }
        if (a.week && b.week) {
          return b.week.localeCompare(a.week)
        }
        return 0
      })
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Sosyal Medya Takibi
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {periodType === 'month' ? 'Aylık' : 'Haftalık'} sosyal medya takipçi sayılarını güncelleyin ve takip edin
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPeriodType('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  periodType === 'month'
                    ? 'bg-white shadow text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Aylık
              </button>
              <button
                onClick={() => {
                  setPeriodType('week')
                  setSelectedPeriod(getWeekString(new Date()))
                }}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  periodType === 'week'
                    ? 'bg-white shadow text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Haftalık
              </button>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {getPeriodOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewType('cards')}
                className={`p-2 rounded transition-all ${
                  viewType === 'cards'
                    ? 'bg-white shadow text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Kart Görünümü"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setViewType('table')
                  fetchHistory()
                }}
                className={`p-2 rounded transition-all ${
                  viewType === 'table'
                    ? 'bg-white shadow text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Tablo Görünümü"
              >
                <Table2 className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={copyFromPreviousPeriod}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
            >
              Önceki Dönemden Kopyala
            </button>
            <button
              onClick={initializePeriod}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all text-sm"
            >
              Başlangıç Değerleri
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>

        {viewType === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => {
              const Icon = platform.icon
              const current = stats[platform.name]?.followerCount || 0
              const inputValue = inputValues[platform.name] ?? current
              const previous = previousStats[platform.name] || 0
              const target = stats[platform.name]?.target || null
              const change = calculateChange(inputValue, previous)
              const progress = target ? Math.min((inputValue / target) * 100, 100) : 0

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
                        {inputValue.toLocaleString('tr-TR')}
                      </p>
                      {previous > 0 && change.absoluteChange !== 0 && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {change.isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
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
                    <div className="relative">
                      <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => handleInputChange(platform.name, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                      {previous > 0 && inputValue !== previous && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {change.isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                    {previous > 0 && (
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Önceki {periodType === 'month' ? 'ay' : 'hafta'}: {previous.toLocaleString('tr-TR')}
                        </span>
                        {change.absoluteChange !== 0 && (
                          <span className={`font-semibold flex items-center gap-1 ${
                            change.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {change.isPositive ? '+' : ''}{change.absoluteChange.toLocaleString('tr-TR')} 
                            <span className="text-gray-500">
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
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Platform</th>
                    {platforms.map((platform) => (
                      <th key={platform.name} className="px-6 py-4 text-center text-sm font-semibold">
                        {platform.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    // Tüm unique period'ları bul (month veya week)
                    const allPeriods = Array.from(
                      new Set(
                        allHistory.map((stat: any) => stat.month || stat.week).filter(Boolean)
                      )
                    ).sort((a: any, b: any) => b.localeCompare(a))

                    return allPeriods.map((period: string) => {
                      const periodStats = allHistory.filter(
                        (stat: any) => (stat.month || stat.week) === period
                      )
                      
                      return (
                        <tr key={period} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {period.includes('W') 
                              ? `Hafta ${period.split('-W')[1]} - ${period.split('-W')[0]}`
                              : format(new Date(period + '-01'), 'MMMM yyyy', { locale: tr })
                            }
                          </td>
                          {platforms.map((platform) => {
                            const stat = periodStats.find((s: any) => s.platform === platform.name)
                            const value = stat?.followerCount || 0
                            
                            // Önceki dönemi bul
                            const prevPeriodIndex = allPeriods.indexOf(period) + 1
                            const prevPeriod = allPeriods[prevPeriodIndex]
                            const prevStat = prevPeriod 
                              ? allHistory.find(
                                  (s: any) => 
                                    (s.month || s.week) === prevPeriod && 
                                    s.platform === platform.name
                                )
                              : null
                            const prevValue = prevStat?.followerCount || 0
                            const change = calculateChange(value, prevValue)
                            
                            return (
                              <td key={platform.name} className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {value.toLocaleString('tr-TR')}
                                  </span>
                                  {prevValue > 0 && change.absoluteChange !== 0 && (
                                    <span className={`text-xs font-medium flex items-center gap-1 mt-1 ${
                                      change.isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {change.isPositive ? (
                                        <TrendingUp className="w-3 h-3" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3" />
                                      )}
                                      {change.isPositive ? '+' : ''}{change.absoluteChange.toLocaleString('tr-TR')}
                                      <span className="text-gray-500">
                                        ({change.isPositive ? '+' : ''}{change.value.toFixed(1)}%)
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
