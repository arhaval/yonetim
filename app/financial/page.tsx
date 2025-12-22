'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus, Trash2, DollarSign, Video } from 'lucide-react'
import { format, parse, startOfMonth } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { useState, useEffect } from 'react'

type FilterType = 'monthly' | 'total'
type CategoryFilter = 'all' | 'stream' | 'team' | 'content' | 'sponsor' | 'other'

// Kategori isimlerini Türkçe'ye çevir
const categoryLabels: Record<string, string> = {
  'sponsorship': 'Sponsorluk',
  'sponsorluk': 'Sponsorluk',
  'content': 'İçerik',
  'içerik': 'İçerik',
  'stream': 'Yayın',
  'yayın': 'Yayın',
  'merchandise': 'Ürün Satışı',
  'ürün': 'Ürün Satışı',
  'donation': 'Bağış',
  'bağış': 'Bağış',
  'other': 'Diğer',
  'diğer': 'Diğer',
  'salary': 'Maaş',
  'maaş': 'Maaş',
  'equipment': 'Ekipman',
  'ekipman': 'Ekipman',
  'marketing': 'Pazarlama',
  'pazarlama': 'Pazarlama',
  'office': 'Ofis Giderleri',
  'ofis': 'Ofis Giderleri',
}

const getCategoryLabel = (category: string): string => {
  if (!category) return 'Diğer'
  return categoryLabels[category.toLowerCase()] || category
}

export default function FinancialPage() {
  const [filter, setFilter] = useState<FilterType>('monthly')
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [records, setRecords] = useState<any[]>([])
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    streamCosts: 0,
    monthlyStreamCosts: 0,
  })

  useEffect(() => {
    fetchData()
  }, [filter, selectedMonth])

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

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        filter: filter,
        month: selectedMonth,
      })

      const [recordsRes, streamsRes] = await Promise.all([
        fetch(`/api/financial?${params}`),
        fetch(`/api/streams/list?${params}`),
      ])

      if (!recordsRes.ok || !streamsRes.ok) {
        throw new Error('API error')
      }

      const recordsData = await recordsRes.json()
      const streamsData = await streamsRes.json()

      // Güvenli array kontrolü
      const safeRecords = Array.isArray(recordsData) ? recordsData : []
      const safeStreams = Array.isArray(streamsData) ? streamsData : []

      // İstatistikleri hesapla
      const totalIncome = safeRecords
        .filter((r: any) => r?.type === 'income')
        .reduce((sum: number, r: any) => sum + (r?.amount || 0), 0)

      const totalExpense = safeRecords
        .filter((r: any) => r?.type === 'expense')
        .reduce((sum: number, r: any) => sum + (r?.amount || 0), 0)

      const streamCosts = safeStreams.reduce(
        (sum: number, s: any) => sum + (s?.cost || 0),
        0
      )

      setStats({
        totalIncome,
        totalExpense,
        monthlyIncome: totalIncome,
        monthlyExpense: totalExpense,
        streamCosts,
        monthlyStreamCosts: streamCosts,
      })
      setRecords(safeRecords)
      setStreams(safeStreams)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredRecords = () => {
    let filtered = [...records]

    // Yayın maliyetlerini ekle
    const streamRecords = streams.map((stream) => ({
      id: `stream-${stream.id}`,
      type: 'expense',
      category: 'Yayın Maliyetleri',
      amount: stream.cost || 0,
      description: `Yayın - ${stream.matchInfo || 'Yayın'}`,
      date: stream.date,
      streamer: stream.streamer,
      isStream: true,
    }))

    filtered = [...filtered, ...streamRecords]

    // Kategori filtresi
    if (categoryFilter === 'stream') {
      filtered = filtered.filter(
        (r) => r.category === 'Yayın Maliyetleri' || r.isStream
      )
    } else if (categoryFilter === 'team') {
      filtered = filtered.filter((r) => r.category?.includes('Maaş') || r.category?.includes('Ekip'))
    } else if (categoryFilter === 'content') {
      filtered = filtered.filter((r) => r.category?.includes('İçerik') || r.category?.includes('voiceover') || r.category?.includes('Seslendirme'))
    } else if (categoryFilter === 'sponsor') {
      filtered = filtered.filter((r) => r.category?.includes('Sponsor'))
    }

    // Sıralama (en eski önce)
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return filtered
  }

  const filteredRecords = getFilteredRecords()

  const displayStats = {
    income: filter === 'monthly' ? stats.monthlyIncome : stats.totalIncome,
    expense:
      filter === 'monthly'
        ? stats.monthlyExpense + stats.monthlyStreamCosts
        : stats.totalExpense + stats.streamCosts,
  }

  if (loading) {
    return (
      <Layout>
        <div className="px-4 py-6 sm:px-0">
          <p>Yükleniyor...</p>
        </div>
      </Layout>
    )
  }

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return
    
    try {
      await fetch(`/api/financial/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finansal Yönetim</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gelir ve giderleri takip edin
            </p>
          </div>
          <Link
            href="/financial/new"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Kayıt
          </Link>
        </div>

        {/* Filtreler */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-wrap gap-4">
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
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-gray-700">Kategori:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">Tümü</option>
                <option value="stream">Yayın</option>
                <option value="team">Ekip</option>
                <option value="content">İçerik</option>
                <option value="sponsor">Sponsor</option>
                <option value="other">Diğer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-green-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -mr-16 -mt-16"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                {filter === 'monthly' ? 'Aylık Gelir' : 'Toplam Gelir'}
              </p>
              <p className="text-3xl font-bold text-green-700">
                {displayStats.income.toLocaleString('tr-TR', {
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
              <p className="text-sm font-semibold text-gray-600 mb-2">
                {filter === 'monthly' ? 'Aylık Gider' : 'Toplam Gider'}
              </p>
              <p className="text-3xl font-bold text-red-700">
                {displayStats.expense.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-orange-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full -mr-16 -mt-16"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                  <Video className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                {filter === 'monthly' ? 'Aylık Yayın Maliyeti' : 'Toplam Yayın Maliyeti'}
              </p>
              <p className="text-3xl font-bold text-orange-700">
                {(filter === 'monthly'
                  ? stats.monthlyStreamCosts
                  : stats.streamCosts
                ).toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          <div className={`group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
            displayStats.income - displayStats.expense >= 0
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
              : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 ${
              displayStats.income - displayStats.expense >= 0
                ? 'bg-gradient-to-br from-green-400/20 to-emerald-400/20'
                : 'bg-gradient-to-br from-red-400/20 to-rose-400/20'
            }`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                  displayStats.income - displayStats.expense >= 0
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                    : 'bg-gradient-to-br from-red-500 to-rose-500'
                }`}>
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Net {filter === 'monthly' ? 'Aylık' : 'Toplam'}
              </p>
              <p className={`text-3xl font-bold ${
                displayStats.income - displayStats.expense >= 0
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                {(displayStats.income - displayStats.expense).toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Finansal Kayıtlar</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tür</th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kategori</th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">Açıklama</th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tarih</th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Tutar</th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          record.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.type === 'income' ? '💰 Gelir' : '💸 Gider'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800">
                          {getCategoryLabel(record.category)}
                        </span>
                        {record.streamer && (
                          <span className="text-xs text-gray-600">
                            👤 {record.streamer.name}
                          </span>
                        )}
                        {record.teamMember && (
                          <span className="text-xs text-gray-600">
                            👥 {record.teamMember.name} ({record.teamMember.role})
                          </span>
                        )}
                        {record.voiceActor && (
                          <span className="text-xs text-gray-600">
                            🎤 {record.voiceActor.name}
                          </span>
                        )}
                        {record.contentCreator && (
                          <span className="text-xs text-gray-600">
                            📝 {record.contentCreator.name}
                          </span>
                        )}
                        {record.isPayment && record.paidAt && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 mt-1">
                            ✅ Ödenmiş
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <p className="text-sm font-medium text-gray-900">
                        {record.description || '-'}
                      </p>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <p className="text-xs sm:text-sm text-gray-600">
                        {format(new Date(record.date), 'dd MMM yyyy', {
                          locale: tr,
                        })}
                      </p>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                      <p
                        className={`text-sm sm:text-lg font-bold ${
                          record.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {record.type === 'income' ? '+' : '-'}
                        {record.amount.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
                      </p>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                      {!record.id.startsWith('stream-') && 
                       !record.id.startsWith('payment-') && 
                       !record.id.startsWith('team-payment-') && (
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 font-medium">Henüz kayıt bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
