'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { format, differenceInDays, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { Save, Instagram, Youtube, Twitter, Twitch, Music, Table2, Grid, TrendingUp, TrendingDown, AlertCircle, Clock } from 'lucide-react'

const platforms = [
  { name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500' },
  { name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
  { name: 'X', icon: Twitter, color: 'from-gray-800 to-gray-900' },
  { name: 'Twitch', icon: Twitch, color: 'from-purple-500 to-purple-600' },
  { name: 'TikTok', icon: Music, color: 'from-black to-gray-800' },
]

type ViewType = 'cards' | 'table'

export default function SocialMediaPage() {
  const [viewType, setViewType] = useState<ViewType>('cards')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<Record<string, { followerCount: number; target: number | null }>>({})
  const [previousStats, setPreviousStats] = useState<Record<string, number>>({})
  const [allHistory, setAllHistory] = useState<any[]>([])
  const [inputValues, setInputValues] = useState<Record<string, number>>({})
  const [platformLastDates, setPlatformLastDates] = useState<Record<string, { lastEntry: string | null; previousEntry: string | null }>>({})

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (viewType === 'table') {
      fetchHistory()
    } else {
      fetchData()
    }
  }, [viewType])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Son kayıtları getir (her platform için en son girilen değer)
      const response = await fetch('/api/social-media?latest=true')
      const data = await response.json()

      const currentStats: Record<string, { followerCount: number; target: number | null }> = {}
      platforms.forEach((platform) => {
        const stat = data.latestStats?.find((s: any) => s.platform === platform.name)
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

      // Önceki kayıtları getir (karşılaştırma için)
      const prevStats: Record<string, number> = {}
      platforms.forEach((platform) => {
        const stat = data.previousStats?.find((s: any) => s.platform === platform.name)
        prevStats[platform.name] = stat?.followerCount || 0
      })
      setPreviousStats(prevStats)
      
      // Platform son girilen tarihleri
      if (data.platformLastDates) {
        const dates: Record<string, { lastEntry: string | null; previousEntry: string | null }> = {}
        Object.keys(data.platformLastDates).forEach(platform => {
          dates[platform] = {
            lastEntry: data.platformLastDates[platform].lastEntry || null,
            previousEntry: data.platformLastDates[platform].previousEntry || null,
          }
        })
        setPlatformLastDates(dates)
      }
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
      
      // Platform son girilen tarihleri
      if (data.platformLastDates) {
        const dates: Record<string, { lastEntry: string | null; previousEntry: string | null }> = {}
        Object.keys(data.platformLastDates).forEach(platform => {
          dates[platform] = {
            lastEntry: data.platformLastDates[platform].lastEntry || null,
            previousEntry: data.platformLastDates[platform].previousEntry || null,
          }
        })
        setPlatformLastDates(dates)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }
  
  // Tarih farkını hesapla ve formatla
  const getDaysSinceLastEntry = (platform: string): number | null => {
    const lastEntry = platformLastDates[platform]?.lastEntry
    if (!lastEntry) return null
    return differenceInDays(new Date(), new Date(lastEntry))
  }
  
  // Tarih farkını göster (örn: "25 gün önce")
  const getLastEntryText = (platform: string): string | null => {
    const lastEntry = platformLastDates[platform]?.lastEntry
    if (!lastEntry) return null
    try {
      return formatDistanceToNow(new Date(lastEntry), { 
        addSuffix: true, 
        locale: tr 
      })
    } catch {
      return null
    }
  }
  
  // 25 gün geçmişse bildirim göster
  const shouldShowReminder = (platform: string): boolean => {
    const daysSince = getDaysSinceLastEntry(platform)
    return daysSince !== null && daysSince >= 25
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const statsToSave = platforms.map((platform) => ({
        platform: platform.name,
        followerCount: inputValues[platform.name] || stats[platform.name]?.followerCount || 0,
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

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: current > 0, absoluteChange: current }
    const change = ((current - previous) / previous) * 100
    const absoluteChange = current - previous
    return { value: Math.abs(change), isPositive: change >= 0, absoluteChange }
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
        // Tarihe göre sırala (en eski en üstte)
        const dateA = new Date(a.createdAt || a.updatedAt)
        const dateB = new Date(b.createdAt || b.updatedAt)
        return dateA.getTime() - dateB.getTime()
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sosyal Medya Takibi
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Sosyal medya takipçi sayılarını güncelleyin ve takip edin
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2">
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
                  className={`bg-white rounded-2xl shadow-xl p-6 border transition-all relative ${
                    shouldShowReminder(platform.name) 
                      ? 'border-orange-300 bg-orange-50/30' 
                      : 'border-gray-100'
                  } hover:shadow-2xl`}
                >
                  {/* Bildirim Badge */}
                  {shouldShowReminder(platform.name) && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-orange-100 border border-orange-300 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-semibold text-orange-700">
                        {getDaysSinceLastEntry(platform.name)} gün geçti
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {inputValue.toLocaleString('tr-TR')}
                        {previous > 0 && change.absoluteChange !== 0 && (
                          <span className={`ml-2 text-lg font-semibold ${
                            change.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ({change.isPositive ? '+' : ''}{change.absoluteChange.toLocaleString('tr-TR')})
                          </span>
                        )}
                      </p>
                      {previous > 0 && change.absoluteChange !== 0 && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {change.isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-xs font-medium ${
                            change.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {change.isPositive ? '+' : ''}{change.value.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Son Girilen Tarih Bilgisi */}
                  {getLastEntryText(platform.name) && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Son giriş: {getLastEntryText(platform.name)}</span>
                    </div>
                  )}

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
                    <th className="px-6 py-4 text-left text-sm font-semibold sticky left-0 bg-gradient-to-r from-blue-600 to-blue-500 z-10">
                      Tarih
                    </th>
                    {platforms.map((platform) => (
                      <th key={platform.name} className="px-6 py-4 text-center text-sm font-semibold">
                        <div className="flex flex-col items-center gap-1">
                          <span>{platform.name}</span>
                          <span className="text-xs font-normal opacity-90">Takipçi</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    // Tüm kayıtları tarihe göre grupla (aynı tarihte girilen kayıtlar aynı satırda)
                    const dateGroups: Record<string, any[]> = {}
                    
                    allHistory.forEach((stat: any) => {
                      // Kayıt tarihini al (createdAt veya updatedAt)
                      const recordDate = stat.createdAt || stat.updatedAt
                      if (!recordDate) return
                      
                      // Tarihi formatla (24.12.2025 gibi)
                      const dateKey = format(new Date(recordDate), 'dd.MM.yyyy')
                      
                      if (!dateGroups[dateKey]) {
                        dateGroups[dateKey] = []
                      }
                      dateGroups[dateKey].push(stat)
                    })
                    
                    // Tarihleri sırala (en eski en üstte)
                    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
                      const dateA = new Date(a.split('.').reverse().join('-'))
                      const dateB = new Date(b.split('.').reverse().join('-'))
                      return dateA.getTime() - dateB.getTime()
                    })

                    return sortedDates.map((dateKey, dateIndex) => {
                      const dateStats = dateGroups[dateKey]
                      
                      return (
                        <tr key={dateKey} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-200">
                            <div className="flex flex-col">
                              <span className="font-semibold text-base">
                                {dateKey}
                              </span>
                              <span className="text-xs text-gray-500 mt-0.5">
                                {format(new Date(dateKey.split('.').reverse().join('-')), 'EEEE', { locale: tr })}
                              </span>
                            </div>
                          </td>
                          {platforms.map((platform) => {
                            const stat = dateStats.find((s: any) => s.platform === platform.name)
                            const value = stat?.followerCount || 0
                            
                            // Önceki tarihi bul (bir önceki satır)
                            const prevDateIndex = dateIndex - 1
                            const prevDateKey = prevDateIndex >= 0 ? sortedDates[prevDateIndex] : null
                            const prevStat = prevDateKey 
                              ? dateGroups[prevDateKey]?.find((s: any) => s.platform === platform.name)
                              : null
                            const prevValue = prevStat?.followerCount || 0
                            const change = calculateChange(value, prevValue)
                            
                            return (
                              <td key={platform.name} className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base font-bold text-gray-900">
                                      {value > 0 ? value.toLocaleString('tr-TR') : '-'}
                                    </span>
                                    {prevValue > 0 && change.absoluteChange !== 0 && (
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        change.isPositive 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        {change.isPositive ? '+' : ''}{change.absoluteChange.toLocaleString('tr-TR')}
                                      </span>
                                    )}
                                  </div>
                                  {prevValue > 0 && change.absoluteChange !== 0 && (
                                    <div className={`text-xs font-medium flex items-center gap-1 ${
                                      change.isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {change.isPositive ? (
                                        <TrendingUp className="w-4 h-4" />
                                      ) : (
                                        <TrendingDown className="w-4 h-4" />
                                      )}
                                      <span className="font-semibold">
                                        {change.isPositive ? '+' : ''}{change.value.toFixed(1)}%
                                      </span>
                                    </div>
                                  )}
                                  {prevValue === 0 && value > 0 && (
                                    <span className="text-xs text-gray-400 italic">İlk kayıt</span>
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
