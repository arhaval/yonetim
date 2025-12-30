'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { format, parse } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { Video, DollarSign, TrendingUp } from 'lucide-react'
import ExportPDFButton from './ExportPDFButton'

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    streamCount: 0,
    externalStreamCount: 0,
    contentCount: 0,
    income: 0,
    expense: 0,
    streamCost: 0,
    totalStreamerPayments: 0,
    totalVoiceActorPayments: 0,
  })
  const [contentStats, setContentStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalSaves: 0,
    totalEngagement: 0,
  })
  const [streamerPayments, setStreamerPayments] = useState<any[]>([])
  const [voiceActorPayments, setVoiceActorPayments] = useState<any[]>([])
  const [allContentsDetailed, setAllContentsDetailed] = useState<any[]>([])
  const [allStreams, setAllStreams] = useState<any[]>([])
  
  // Stats'ın her zaman geçerli olduğundan emin ol
  const safeStats = stats || {
    streamCount: 0,
    externalStreamCount: 0,
    contentCount: 0,
    income: 0,
    expense: 0,
    streamCost: 0,
  }
  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        filter: 'monthly', // Her zaman aylık
        month: selectedMonth,
      })

      const response = await fetch(`/api/reports?${params}`, { 
        cache: 'default'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      // Hata kontrolü
      if (data.error || !data.stats) {
        console.error('API Error:', data.error || 'Stats not found')
        setStats({
          streamCount: 0,
          externalStreamCount: 0,
          contentCount: 0,
          income: 0,
          expense: 0,
          streamCost: 0,
          totalStreamerPayments: 0,
          totalVoiceActorPayments: 0,
        })
        return
      }

      // Stats'ı güvenli bir şekilde set et
      setStats({
        streamCount: data.stats?.streamCount || 0,
        externalStreamCount: data.stats?.externalStreamCount || 0,
        contentCount: data.stats?.contentCount || 0,
        income: data.stats?.income || 0,
        expense: data.stats?.expense || 0,
        streamCost: data.stats?.streamCost || 0,
        totalStreamerPayments: data.stats?.totalStreamerPayments || 0,
        totalVoiceActorPayments: data.stats?.totalVoiceActorPayments || 0,
      })
      setContentStats(data.contentStats || {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalSaves: 0,
        totalEngagement: 0,
      })
      setStreamerPayments(data.streamerPayments || [])
      setVoiceActorPayments(data.voiceActorPayments || [])
      setAllContentsDetailed(data.allContentsDetailed || [])
      setAllStreams(data.allStreams || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
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

  const netProfit = (safeStats.income || 0) - (safeStats.expense || 0)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Aylık Rapor</h1>
            <p className="mt-2 text-sm text-gray-600">
              {format(parse(selectedMonth, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: tr })} ayı özet raporu
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">Ay:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {getMonthOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <ExportPDFButton
              filter="monthly"
              selectedMonth={selectedMonth}
              stats={safeStats}
              contentStats={contentStats}
              topStreamers={[]}
              topContentByViews={[]}
              topContent={[]}
              contentByPlatform={[]}
              streamerPayments={streamerPayments}
              voiceActorPayments={voiceActorPayments}
              allContentsDetailed={allContentsDetailed}
              allStreams={allStreams}
            />
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-green-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -mr-16 -mt-16"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Gelir</p>
              <p className="text-3xl font-bold text-green-700">
                {(safeStats.income || 0).toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-red-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full -mr-16 -mt-16"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Gider</p>
              <p className="text-3xl font-bold text-red-700">
                {(safeStats.expense || 0).toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          <div className={`group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
            netProfit >= 0
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
              : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 ${
              netProfit >= 0
                ? 'bg-gradient-to-br from-green-400/20 to-emerald-400/20'
                : 'bg-gradient-to-br from-red-400/20 to-rose-400/20'
            }`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                  netProfit >= 0
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                    : 'bg-gradient-to-br from-red-500 to-rose-500'
                }`}>
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Net Kar</p>
              <p className={`text-3xl font-bold ${
                netProfit >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {netProfit.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -mr-16 -mt-16"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Video className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Yayın Sayısı</p>
              <p className="text-3xl font-bold text-blue-700">{safeStats.streamCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-2">Dış Yayın Sayısı</p>
            <p className="text-3xl font-bold text-gray-900">{safeStats.externalStreamCount || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-2">İçerik Sayısı</p>
            <p className="text-3xl font-bold text-gray-900">{safeStats.contentCount || 0}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
