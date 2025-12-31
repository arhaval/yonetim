import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { Calendar, Users, Video, DollarSign, CheckCircle2, Instagram, Youtube, Twitter, Twitch, Music, Target, BarChart3, AlertCircle, CreditCard, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import DashboardPDFExport from '@/components/DashboardPDFExport'

// Dashboard cache optimizasyonu - 120 saniye cache (agresif)
export const revalidate = 120 // 120 saniye cache - maksimum performans için

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

  // Bekleyen ödemeler ve bugün yapılacaklar için veriler
  let pendingPayments: any[] = []
  let pendingScripts: any[] = []
  let todayStreams: any[] = []
  
  try {
    // Bekleyen ödemeler (pending status)
    pendingPayments = await prisma.stream.findMany({
      where: { paymentStatus: 'pending' },
      take: 5,
      orderBy: { date: 'asc' }, // Eski → Yeni sıralama
      include: { streamer: { select: { id: true, name: true } } },
    }).catch(() => [])
    
    // Bekleyen script onayları
    pendingScripts = await prisma.voiceoverScript.findMany({
      where: { status: { in: ['WAITING_VOICE', 'VOICE_UPLOADED'] } },
      take: 5,
      orderBy: { createdAt: 'asc' }, // Eski → Yeni sıralama
      include: { 
        creator: { select: { id: true, name: true } },
        voiceActor: { select: { id: true, name: true } },
      },
    }).catch(() => [])
    
    // Bugünkü yayınlar
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    todayStreams = await prisma.stream.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      take: 5,
      orderBy: { date: 'asc' },
      include: { streamer: { select: { id: true, name: true } } },
    }).catch(() => [])
  } catch (error) {
    console.error('Error fetching dashboard widgets:', error)
  }

  // Son yayınlar ve içerikler - PARALEL ÇEKİLİYOR
  let recentStreams: any[] = []
  let recentContent: any[] = []
  
  try {
    [recentStreams, recentContent] = await Promise.all([
      // Son yayınlar (streamer bilgileriyle birlikte)
      prisma.stream.findMany({
        take: 5,
        orderBy: { date: 'asc' },
        include: { streamer: { select: { id: true, name: true } } },
      }).catch(() => []),
      
      // Son içerikler
      prisma.content.findMany({
        take: 5,
        orderBy: { publishDate: 'asc' },
        select: {
          id: true,
          title: true,
          type: true,
          platform: true,
          url: true,
          publishDate: true,
          views: true,
          likes: true,
        },
      }).catch(() => []),
    ])
  } catch (error) {
    console.error('Error fetching recent data:', error)
  }

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: tr })
  const currentMonthKey = format(new Date(), 'yyyy-MM')
  const previousMonthKey = format(subMonths(new Date(), 1), 'yyyy-MM')
  
  // Sosyal medya istatistiklerini çek
  let currentSocialMedia: any[] = []
  let previousSocialMedia: any[] = []
  
  try {
    const results = await Promise.all([
      prisma.socialMediaStats.findMany({
        where: { month: currentMonthKey },
        orderBy: { platform: 'asc' },
      }).catch(() => []),
      prisma.socialMediaStats.findMany({
        where: { month: previousMonthKey },
        orderBy: { platform: 'asc' },
      }).catch(() => []),
    ])
    currentSocialMedia = Array.isArray(results[0]) ? results[0] : []
    previousSocialMedia = Array.isArray(results[1]) ? results[1] : []
  } catch (error) {
    console.error('Social media stats not available yet. Please run: npx prisma generate')
    // Model henüz generate edilmemiş, boş array döndür
    currentSocialMedia = []
    previousSocialMedia = []
  }
  
  // Güvenlik kontrolü - her zaman array olduğundan emin ol
  if (!Array.isArray(currentSocialMedia)) {
    currentSocialMedia = []
  }
  if (!Array.isArray(previousSocialMedia)) {
    previousSocialMedia = []
  }
  if (!Array.isArray(recentStreams)) {
    recentStreams = []
  }
  if (!Array.isArray(recentContent)) {
    recentContent = []
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
      <div className="space-y-6">
        {/* Hero Section - Sadeleştirilmiş */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Arhaval Denetim Merkezi
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {currentMonth} - Genel Bakış
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats - Büyütülmüş */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStreamers}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Yayıncı</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeStreamers}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aktif Yayıncı</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalContent}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam İçerik</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.monthlyRevenue.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aylık Gelir</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview - Büyütülmüş */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border-l-4 ${
            stats.monthlyRevenue - stats.monthlyExpense >= 0 ? 'border-green-500' : 'border-red-500'
          } hover:shadow-lg transition-all border-gray-200 dark:border-slate-700`}>
            <p className="text-base font-medium text-gray-500 dark:text-gray-400 mb-3">Aylık Net Gelir</p>
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-all border-gray-200 dark:border-slate-700">
            <p className="text-base font-medium text-gray-500 dark:text-gray-400 mb-3">Aylık Gider</p>
            <p className="text-3xl font-bold text-orange-600">
              {stats.monthlyExpense.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>

        {/* Ödeme Özeti - Büyütülmüş */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-indigo-600" />
              Ödeme Özeti
            </h2>
            <Link
              href="/payments"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-base"
            >
              Detaylı Görüntüle →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-xl p-5 border border-gray-200" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400 mb-2">Toplam Borç</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalDue.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>

            <div className="rounded-xl p-5 border border-gray-200" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-base font-medium text-gray-600 mb-2">Ödenen</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalPaid.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>

            <div className="rounded-xl p-5 border border-gray-200" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-base font-medium text-gray-600 mb-2">Ödenmemiş</p>
              <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                {stats.totalUnpaid.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
          
          {/* Ödeme İlerleme Çubuğu */}
          {stats.totalDue > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-medium text-gray-700">Ödeme İlerlemesi</span>
                <span className="text-base font-semibold text-gray-900">
                  {((stats.totalPaid / stats.totalDue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${(stats.totalPaid / stats.totalDue) * 100}%`,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>Ödenen: {stats.totalPaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</span>
                <span>Kalan: {stats.totalUnpaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sosyal Medya Takibi - Büyütülmüş */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="w-6 h-6 mr-2 text-indigo-600" />
              Sosyal Medya
            </h2>
            <Link
              href="/social-media"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-base"
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
                  className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{platform.name}</p>
                    <p className="text-base font-bold text-gray-900">
                      {current.toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hızlı Erişim Butonları - Büyük ve Göze Çarpan */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hızlı İşlemler</h2>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">PDF Rapor:</label>
              <select
                id="month-select"
                defaultValue={format(new Date(), 'yyyy-MM')}
                className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)
                  const value = format(date, 'yyyy-MM')
                  const label = format(date, 'MMMM yyyy', { locale: tr })
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                })}
              </select>
              <DashboardPDFExport />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/payment-approval"
              prefetch={true}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                {pendingPayments.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {pendingPayments.length}
                  </span>
                )}
              </div>
              <p className="font-semibold text-base text-gray-900 dark:text-white">Ödeme Yap</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bekleyen ödemeler</p>
            </Link>
            <Link
              href="/financial"
              prefetch={true}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="font-semibold text-base text-gray-900 dark:text-white">Finansal Kayıt</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gelir/Gider ekle</p>
            </Link>
            <Link
              href="/voiceover-scripts"
              prefetch={true}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                {pendingScripts.length > 0 && (
                  <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {pendingScripts.length}
                  </span>
                )}
              </div>
              <p className="font-semibold text-base text-gray-900 dark:text-white">Script Onayla</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bekleyen scriptler</p>
            </Link>
            <Link
              href="/streams"
              prefetch={true}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                {todayStreams.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {todayStreams.length}
                  </span>
                )}
              </div>
              <p className="font-semibold text-base text-gray-900 dark:text-white">Yayınlar</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bugün {todayStreams.length} yayın</p>
            </Link>
          </div>
        </div>

        {/* Dashboard Widget'ları - Bekleyen İşlemler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bekleyen Ödemeler Widget */}
          {pendingPayments.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                  Bekleyen Ödemeler
                </h3>
                <Link
                  href="/payment-approval"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Tümünü Gör →
                </Link>
              </div>
              <div className="space-y-3">
                {pendingPayments.slice(0, 3).map((stream: any) => (
                  <div key={stream.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stream.streamer?.name || 'Bilinmeyen'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(stream.date), 'dd MMM yyyy', { locale: tr })}
                      </p>
                    </div>
                    <p className="font-bold text-red-600">
                      {stream.streamerEarning?.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bekleyen Script Onayları Widget */}
          {pendingScripts.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-500" />
                  Bekleyen Script Onayları
                </h3>
                <Link
                  href="/voiceover-scripts"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Tümünü Gör →
                </Link>
              </div>
              <div className="space-y-3">
                {pendingScripts.slice(0, 3).map((script: any) => (
                  <div key={script.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{script.title || 'Başlıksız'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {script.creator?.name || 'Bilinmeyen'} → {script.voiceActor?.name || 'Bilinmeyen'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      script.status === 'VOICE_UPLOADED' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {script.status === 'VOICE_UPLOADED' ? 'Admin Onayı Bekliyor' : 'Creator Onayı Bekliyor'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bugünkü Yayınlar Widget */}
          {todayStreams.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                  Bugünkü Yayınlar
                </h3>
                <Link
                  href="/streams"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Tümünü Gör →
                </Link>
              </div>
              <div className="space-y-3">
                {todayStreams.slice(0, 3).map((stream: any) => (
                  <div key={stream.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stream.streamer?.name || 'Bilinmeyen'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stream.matchInfo || 'Yayın'} - {stream.duration || 0} dk
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stream.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {stream.paymentStatus === 'paid' ? 'Ödendi' : 'Bekliyor'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Links - Büyütülmüş */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <Link
            href="/streams"
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all group"
          >
            <Video className="w-7 h-7 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-base text-gray-900">Yayınlar</p>
            <p className="text-sm text-gray-500 mt-1.5">Yönet</p>
          </Link>
          <Link
            href="/content"
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-purple-300 transition-all group"
          >
            <Video className="w-7 h-7 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-base text-gray-900">İçerikler</p>
            <p className="text-sm text-gray-500 mt-1.5">Takip Et</p>
          </Link>
          <Link
            href="/payments"
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all group"
          >
            <DollarSign className="w-7 h-7 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-base text-gray-900">Ödemeler</p>
            <p className="text-sm text-gray-500 mt-1.5">Yönet</p>
          </Link>
          <Link
            href="/reports"
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg hover:border-amber-300 transition-all group"
          >
            <BarChart3 className="w-7 h-7 text-amber-600 mb-4 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-base text-gray-900">Raporlar</p>
            <p className="text-sm text-gray-500 mt-1.5">İncele</p>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
