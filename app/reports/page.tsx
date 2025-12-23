'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { Video, DollarSign, TrendingUp, Eye, Heart, MessageCircle, Share2, Users, BarChart3, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import ExportPDFButton from './ExportPDFButton'

type FilterType = 'monthly' | 'total'
type TabType = 'overview' | 'streams' | 'content'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [filter, setFilter] = useState<FilterType>('monthly')
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    streamCount: 0,
    externalStreamCount: 0,
    contentCount: 0,
    income: 0,
    expense: 0,
    streamCost: 0,
  })
  
  // Stats'ın her zaman geçerli olduğundan emin ol
  const safeStats = stats || {
    streamCount: 0,
    externalStreamCount: 0,
    contentCount: 0,
    income: 0,
    expense: 0,
    streamCost: 0,
  }
  const [contentStats, setContentStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalSaves: 0,
    totalEngagement: 0,
  })
  const [topStreamers, setTopStreamers] = useState<any[]>([])
  const [topContent, setTopContent] = useState<any[]>([])
  const [topContentByViews, setTopContentByViews] = useState<any[]>([])
  const [contentByPlatform, setContentByPlatform] = useState<any[]>([])
  const [contentByType, setContentByType] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [filter, selectedMonth])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        filter: filter,
        month: selectedMonth,
      })

      const response = await fetch(`/api/reports?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      // Hata kontrolü
      if (data.error || !data.stats) {
        console.error('API Error:', data.error || 'Stats not found')
        // Varsayılan değerlerle devam et
        setStats({
          streamCount: 0,
          externalStreamCount: 0,
          contentCount: 0,
          income: 0,
          expense: 0,
          streamCost: 0,
        })
        setContentStats({
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalSaves: 0,
          totalEngagement: 0,
        })
        setTopStreamers([])
        setTopContent([])
        setTopContentByViews([])
        setContentByPlatform([])
        setContentByType([])
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
      })
      setContentStats(data.contentStats || {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalSaves: 0,
        totalEngagement: 0,
      })
      setTopStreamers(data.topStreamers || [])
      setTopContent(data.topContent || [])
      setTopContentByViews(data.topContentByViews || [])
      setContentByPlatform(data.contentByPlatform || [])
      setContentByType(data.contentByType || [])
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
            <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
            <p className="mt-2 text-sm text-gray-600">
              Detaylı istatistikler ve analizler
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">Filtre:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="monthly">Aylık</option>
                <option value="total">Toplam</option>
              </select>
            </div>
            {filter === 'monthly' && (
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
            )}
            <ExportPDFButton
              filter={filter}
              selectedMonth={selectedMonth}
              stats={safeStats}
              contentStats={contentStats}
              topStreamers={topStreamers}
              topContentByViews={topContentByViews}
              topContent={topContent}
              contentByPlatform={contentByPlatform}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-100">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('streams')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === 'streams'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Yayınlar
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === 'content'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              İçerikler
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Financial Summary */}
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-indigo-600" />
                  En Aktif Yayıncılar
                </h3>
                <div className="space-y-3">
                  {topStreamers.slice(0, 5).map((streamer, index) => (
                    <div key={streamer.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{streamer.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{streamer.streamCount}</p>
                        <p className="text-xs text-gray-500">yayın</p>
                      </div>
                    </div>
                  ))}
                  {topStreamers.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Veri bulunamadı</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-purple-600" />
                  En Çok Görüntülenen İçerikler
                </h3>
                <div className="space-y-3">
                  {topContentByViews.slice(0, 5).map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                            {index + 1}
                          </div>
                          <p className="font-semibold text-gray-900 truncate">{content.title}</p>
                        </div>
                        <p className="text-xs text-gray-500">{content.platform} - {content.type}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-bold text-purple-600">{content.views.toLocaleString('tr-TR')}</p>
                        <p className="text-xs text-gray-500">görüntülenme</p>
                      </div>
                    </div>
                  ))}
                  {topContentByViews.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Veri bulunamadı</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streams Tab */}
        {activeTab === 'streams' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Toplam Yayın</p>
                <p className="text-3xl font-bold text-gray-900">{safeStats.streamCount || 0}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Dış Yayın</p>
                <p className="text-3xl font-bold text-gray-900">{safeStats.externalStreamCount || 0}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Yayın Maliyeti</p>
                <p className="text-3xl font-bold text-red-600">
                  {(safeStats.streamCost || 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                En Aktif Yayıncılar
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Yayıncı</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Yayın Sayısı</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topStreamers.map((streamer) => (
                      <tr key={streamer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-900">{streamer.name}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="font-bold text-indigo-600">{streamer.streamCount}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {topStreamers.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">Veri bulunamadı</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2">İçerik Sayısı</p>
                <p className="text-3xl font-bold text-gray-900">{safeStats.contentCount || 0}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Görüntülenme</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(contentStats.totalViews / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Beğeni</p>
                <p className="text-2xl font-bold text-red-600">
                  {(contentStats.totalLikes / 1000).toFixed(1)}K
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Yorum</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {(contentStats.totalComments / 1000).toFixed(1)}K
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-600" />
                  En Çok Beğenilen İçerikler
                </h3>
                <div className="space-y-3">
                  {topContent.slice(0, 5).map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                            {index + 1}
                          </div>
                          <p className="font-semibold text-gray-900 truncate">{content.title}</p>
                        </div>
                        <p className="text-xs text-gray-500">{content.platform} - {content.type}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-bold text-red-600">{content.likes.toLocaleString('tr-TR')}</p>
                        <p className="text-xs text-gray-500">beğeni</p>
                      </div>
                    </div>
                  ))}
                  {topContent.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Veri bulunamadı</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                  Platform Dağılımı
                </h3>
                <div className="space-y-3">
                  {contentByPlatform.map((item, index) => (
                    <div key={item.platform} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <p className="font-semibold text-gray-900">{item.platform}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{item.count}</p>
                        <p className="text-xs text-gray-500">içerik</p>
                      </div>
                    </div>
                  ))}
                  {contentByPlatform.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Veri bulunamadı</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
