import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { Calendar, Users, Video, DollarSign, CheckCircle2, Instagram, Youtube, Twitter, Twitch, Music, Target, BarChart3, AlertCircle, CreditCard } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering - build sırasında database'e bağlanma
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getStats() {
  try {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const previousMonthStart = startOfMonth(subMonths(new Date(), 1))
    const previousMonthEnd = endOfMonth(subMonths(new Date(), 1))
    
    const [
      totalStreamers,
      activeStreamers,
      totalContent,
      totalRevenue,
      monthlyRevenue,
      totalExpense,
      monthlyExpense,
      totalStreamCosts,
      monthlyStreamCosts,
      // Önceki ay verileri
      previousMonthRevenue,
      previousMonthExpense,
      previousMonthStreamCosts,
      previousMonthStreamCount,
      previousMonthContentCount,
      previousMonthActiveStreamers,
    ] = await Promise.all([
      prisma.streamer.count().catch(() => 0),
      prisma.streamer.count({ where: { isActive: true } }).catch(() => 0),
      prisma.content.count().catch(() => 0),
      prisma.financialRecord.aggregate({
        where: { type: 'income' },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: null } })),
      prisma.financialRecord.aggregate({
        where: {
          type: 'income',
          date: { gte: monthStart },
        },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: null } })),
      prisma.financialRecord.aggregate({
        where: { type: 'expense' },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: null } })),
      prisma.financialRecord.aggregate({
        where: {
          type: 'expense',
          date: { gte: monthStart },
        },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: null } })),
      prisma.stream.aggregate({
        _sum: { cost: true },
      }).catch(() => ({ _sum: { cost: null } })),
      prisma.stream.aggregate({
        where: {
          date: { gte: monthStart },
        },
        _sum: { cost: true },
      }).catch(() => ({ _sum: { cost: null } })),
      // Önceki ay verileri
      prisma.financialRecord.aggregate({
        where: {
          type: 'income',
          date: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: null } })),
      prisma.financialRecord.aggregate({
        where: {
          type: 'expense',
          date: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: null } })),
      prisma.stream.aggregate({
        where: {
          date: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
        _sum: { cost: true },
      }).catch(() => ({ _sum: { cost: null } })),
      prisma.stream.count({
        where: {
          date: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      }).catch(() => 0),
      prisma.content.count({
        where: {
          publishDate: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      }).catch(() => 0),
      prisma.streamer.count({
        where: {
          isActive: true,
          createdAt: {
            lte: previousMonthEnd,
          },
        },
      }).catch(() => 0),
    ])

  // Ödeme istatistikleri - hata yönetimi ile
  let unpaidStreams = { _sum: { streamerEarning: null as number | null } }
  let paidStreams = { _sum: { streamerEarning: null as number | null } }
  
  try {
    [unpaidStreams, paidStreams] = await Promise.all([
      prisma.stream.aggregate({
        where: { paymentStatus: 'pending' },
        _sum: { streamerEarning: true },
      }),
      prisma.stream.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { streamerEarning: true },
      }),
    ])
  } catch (error: any) {
    // Eğer paymentStatus alanı henüz tanınmıyorsa, varsayılan değerler kullan
    if (error.message?.includes('paymentStatus') || error.message?.includes('Unknown argument')) {
      console.warn('PaymentStatus alanı henüz tanınmıyor. Varsayılan değerler kullanılıyor.')
      unpaidStreams = { _sum: { streamerEarning: null } }
      paidStreams = { _sum: { streamerEarning: null } }
    } else {
      throw error
    }
  }

    let unpaidPayments = { _sum: { amount: null as number | null } }
    let paidPayments = { _sum: { amount: null as number | null } }
    
    try {
      [unpaidPayments, paidPayments] = await Promise.all([
        prisma.payment.aggregate({
          where: { paidAt: null },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { paidAt: { not: null } },
          _sum: { amount: true },
        }),
      ])
    } catch (error) {
      console.error('Error fetching payments:', error)
      unpaidPayments = { _sum: { amount: null } }
      paidPayments = { _sum: { amount: null } }
    }

    // Ödeme hesaplamaları
    const totalUnpaid = (unpaidStreams._sum.streamerEarning || 0) + (unpaidPayments._sum.amount || 0)
    const totalPaid = (paidStreams._sum.streamerEarning || 0) + (paidPayments._sum.amount || 0)
    const totalDue = totalUnpaid + totalPaid

    return {
      totalStreamers,
      activeStreamers,
      totalContent,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      totalExpense: (totalExpense._sum.amount || 0) + (totalStreamCosts._sum.cost || 0),
      monthlyExpense: (monthlyExpense._sum.amount || 0) + (monthlyStreamCosts._sum.cost || 0),
      totalStreamCosts: totalStreamCosts._sum.cost || 0,
      monthlyStreamCosts: monthlyStreamCosts._sum.cost || 0,
      // Önceki ay verileri
      previousMonthRevenue: previousMonthRevenue._sum.amount || 0,
      previousMonthExpense: previousMonthExpense._sum.amount || 0,
      previousMonthStreamCosts: previousMonthStreamCosts._sum.cost || 0,
      previousMonthStreamCount,
      previousMonthContentCount,
      previousMonthActiveStreamers,
      // Ödeme istatistikleri
      totalUnpaid,
      totalPaid,
      totalDue,
    }
  } catch (error) {
    console.error('Error in getStats:', error)
    // Varsayılan değerler döndür
    return {
      totalStreamers: 0,
      activeStreamers: 0,
      totalContent: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalExpense: 0,
      monthlyExpense: 0,
      totalStreamCosts: 0,
      monthlyStreamCosts: 0,
      previousMonthRevenue: 0,
      previousMonthExpense: 0,
      previousMonthStreamCosts: 0,
      previousMonthStreamCount: 0,
      previousMonthContentCount: 0,
      previousMonthActiveStreamers: 0,
      totalUnpaid: 0,
      totalPaid: 0,
      totalDue: 0,
    }
  }
}

function calculateChange(current: number, previous: number): { value: number; isPositive: boolean; absoluteChange: number } {
  if (previous === 0) {
    return { value: current > 0 ? 100 : 0, isPositive: current > 0, absoluteChange: current }
  }
  const change = ((current - previous) / previous) * 100
  const absoluteChange = current - previous
  return { value: Math.abs(change), isPositive: change >= 0, absoluteChange }
}

export default async function DashboardPage() {
  // Hata yönetimi ile stats çek
  let stats: any
  try {
    stats = await getStats()
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    // Varsayılan değerler
    stats = {
      totalStreamers: 0,
      activeStreamers: 0,
      totalContent: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalExpense: 0,
      monthlyExpense: 0,
      totalStreamCosts: 0,
      monthlyStreamCosts: 0,
      previousMonthRevenue: 0,
      previousMonthExpense: 0,
      previousMonthStreamCosts: 0,
      previousMonthStreamCount: 0,
      previousMonthContentCount: 0,
      previousMonthActiveStreamers: 0,
      totalUnpaid: 0,
      totalPaid: 0,
      totalDue: 0,
    }
  }

  // Prisma Client güncellenene kadar geçici çözüm
  let recentStreams: any[] = []
  try {
    recentStreams = await prisma.stream.findMany({
      where: { status: 'approved' }, // Sadece onaylanmış yayınları göster
      take: 5,
      orderBy: { date: 'asc' },
      include: { streamer: true },
    })
  } catch (error: any) {
    // Eğer status alanı henüz tanınmıyorsa, tüm yayınları göster
    if (error.message?.includes('status') || error.message?.includes('Unknown argument')) {
      console.warn('Status alanı henüz tanınmıyor. Tüm yayınlar gösteriliyor.')
      try {
        recentStreams = await prisma.stream.findMany({
          take: 5,
          orderBy: { date: 'asc' },
          include: { streamer: true },
        })
      } catch (e) {
        console.error('Error fetching streams:', e)
        recentStreams = []
      }
    } else {
      console.error('Error fetching streams:', error)
      recentStreams = []
    }
  }
  
  let recentContent: any[] = []
  try {
    recentContent = await prisma.content.findMany({
      take: 5,
      orderBy: { publishDate: 'asc' },
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    recentContent = []
  }

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: tr })
  const currentMonthKey = format(new Date(), 'yyyy-MM')
  const previousMonthKey = format(subMonths(new Date(), 1), 'yyyy-MM')
  
  // Sosyal medya istatistiklerini çek
  let currentSocialMedia: any[] = []
  let previousSocialMedia: any[] = []
  
  try {
    [currentSocialMedia, previousSocialMedia] = await Promise.all([
      prisma.socialMediaStats.findMany({
        where: { month: currentMonthKey },
        orderBy: { platform: 'asc' },
      }),
      prisma.socialMediaStats.findMany({
        where: { month: previousMonthKey },
        orderBy: { platform: 'asc' },
      }),
    ])
  } catch (error) {
    console.error('Social media stats not available yet. Please run: npx prisma generate')
    // Model henüz generate edilmemiş, boş array döndür
  }

  const socialMediaPlatforms = [
    { name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500' },
    { name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
    { name: 'X', icon: Twitter, color: 'from-gray-800 to-gray-900' },
    { name: 'Twitch', icon: Twitch, color: 'from-purple-500 to-purple-600' },
    { name: 'TikTok', icon: Music, color: 'from-black to-gray-800' },
  ]

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl p-8 md:p-12 text-white" style={{ background: 'linear-gradient(135deg, #252a34 0%, #08d9d6 50%, #ff2e63 100%)' }}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Arhaval Denetim Merkezi
              </h1>
              <p className="text-lg md:text-xl text-blue-100 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {currentMonth} - Genel Bakış ve İstatistikler
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-32 h-32 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 shadow-xl">
              <span className="text-6xl font-bold">A</span>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(8, 217, 214, 0.1) 0%, rgba(255, 46, 99, 0.1) 100%)' }}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)' }}>
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stats.totalStreamers}</p>
                  <p className="text-sm text-gray-500 mt-1">Toplam Yayıncı</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(8, 217, 214, 0.1) 0%, rgba(255, 46, 99, 0.1) 100%)' }}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)' }}>
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stats.activeStreamers}</p>
                  <p className="text-sm text-gray-500 mt-1">Aktif Yayıncı</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(8, 217, 214, 0.1) 0%, rgba(255, 46, 99, 0.1) 100%)' }}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)' }}>
                  <Video className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{stats.totalContent}</p>
                  <p className="text-sm text-gray-500 mt-1">Toplam İçerik</p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.monthlyRevenue.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Aylık Gelir</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview - Sadeleştirilmiş */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
            stats.monthlyRevenue - stats.monthlyExpense >= 0 ? 'border-green-500' : 'border-red-500'
          } hover:shadow-xl transition-all`}>
            <p className="text-sm font-medium text-gray-500 mb-2">Aylık Net Gelir</p>
            <p className={`text-3xl font-bold ${
              stats.monthlyRevenue - stats.monthlyExpense >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {(stats.monthlyRevenue - stats.monthlyExpense).toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all">
            <p className="text-sm font-medium text-gray-500 mb-2">Aylık Gider</p>
            <p className="text-3xl font-bold text-orange-600">
              {stats.monthlyExpense.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        {/* Ödeme Özeti */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
              Ödeme Özeti
            </h2>
            <Link
              href="/payments"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Detaylı Görüntüle →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl p-6 border" style={{ background: 'linear-gradient(135deg, rgba(8, 217, 214, 0.1) 0%, rgba(255, 46, 99, 0.1) 100%)', borderColor: '#08d9d6' + '40' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)' }}>
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Toplam Borç</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalDue.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xs text-gray-500 mt-2">Yayıncılara ödenecek toplam tutar</p>
            </div>

            <div className="rounded-xl p-6 border" style={{ background: 'linear-gradient(135deg, rgba(8, 217, 214, 0.1) 0%, rgba(255, 46, 99, 0.1) 100%)', borderColor: '#08d9d6' + '40' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)' }}>
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ödenen</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalPaid.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xs text-gray-500 mt-2">Toplam ödenen tutar</p>
            </div>

            <div className="rounded-xl p-6 border" style={{ background: 'linear-gradient(135deg, rgba(255, 46, 99, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)', borderColor: '#ff2e63' + '40' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #ff2e63 0%, #e91e63 100%)' }}>
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ödenmemiş</p>
              <p className="text-2xl font-bold" style={{ color: '#ff2e63' }}>
                {stats.totalUnpaid.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-xs text-gray-500 mt-2">Bekleyen ödeme tutarı</p>
            </div>
          </div>
          
          {/* Ödeme İlerleme Çubuğu */}
          {stats.totalDue > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ödeme İlerlemesi</span>
                <span className="text-sm font-semibold text-gray-900">
                  {((stats.totalPaid / stats.totalDue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${(stats.totalPaid / stats.totalDue) * 100}%`,
                    background: 'linear-gradient(135deg, #08d9d6 0%, #06b8b5 100%)'
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Ödenen: {stats.totalPaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</span>
                <span>Kalan: {stats.totalUnpaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sosyal Medya Takibi - Sadeleştirilmiş */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-indigo-600" />
              Sosyal Medya
            </h2>
            <Link
              href="/social-media"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Güncelle →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {socialMediaPlatforms.map((platform) => {
              const Icon = platform.icon
              const currentStat = currentSocialMedia.find(s => s.platform === platform.name)
              const current = currentStat?.followerCount || 0

              return (
                <div
                  key={platform.name}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{platform.name}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {current.toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/streams"
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-indigo-300 transition-all group"
          >
            <Video className="w-8 h-8 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">Yayınlar</p>
            <p className="text-sm text-gray-500 mt-1">Yönet</p>
          </Link>
          <Link
            href="/content"
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-purple-300 transition-all group"
          >
            <Video className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">İçerikler</p>
            <p className="text-sm text-gray-500 mt-1">Takip Et</p>
          </Link>
          <Link
            href="/payments"
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-green-300 transition-all group"
          >
            <DollarSign className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">Ödemeler</p>
            <p className="text-sm text-gray-500 mt-1">Yönet</p>
          </Link>
          <Link
            href="/reports"
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-amber-300 transition-all group"
          >
            <BarChart3 className="w-8 h-8 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">Raporlar</p>
            <p className="text-sm text-gray-500 mt-1">İncele</p>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
