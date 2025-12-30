import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, ExternalLink, CreditCard, AlertCircle, Video, Calendar, Clock, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import StreamList from './StreamList'
import LoginCredentialsForm from '@/components/LoginCredentialsForm'
import DeleteFinancialRecordButton from './DeleteFinancialRecordButton'

// Sayfayı her istekte yenile (finansal kayıtlar için)
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds - performance optimization

export default async function StreamerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }> | { id: string }
  searchParams?: Promise<{ page?: string }> | { page?: string }
}) {
  const { id } = await Promise.resolve(params)
  const resolvedSearchParams = await Promise.resolve(searchParams || {})
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10)
  const recordsPerPage = 20
  const skip = (currentPage - 1) * recordsPerPage
  let streamer = null
  let totalStreams = 0
  let totalExternalStreams = 0
  let totalCost = { _sum: { cost: null as number | null } }
  let teamEarnings: any[] = []
  let totalStreamerEarning = { _sum: { streamerEarning: null as number | null } }
  let unpaidStreams = { _sum: { streamerEarning: null as number | null } }
  let unpaidPayments = { _sum: { amount: null as number | null } }
  let financialRecords: any[] = []
  let payouts: any[] = []
  
  try {
    // Tüm verileri paralel çek - Promise.all ile waterfall sorunu çözüldü
    const [
      streamerData,
      allStreams,
      totalStreamsResult,
      totalExternalStreamsResult,
      totalCostResult,
      teamEarningsResult,
      totalStreamerEarningResult,
      unpaidStreamsResult,
      unpaidPaymentsResult,
      financialRecordsResult,
      payoutsResult,
    ] = await Promise.all([
      // Streamer bilgileri (tüm ilişkilerle birlikte)
      prisma.streamer.findUnique({
        where: { id },
        include: {
          externalStreams: {
            take: 10,
            orderBy: { date: 'asc' },
          },
          payments: {
            orderBy: { paidAt: 'asc' },
          },
          teamRates: true,
        },
      }),
      
      // Tüm yayınlar
      prisma.stream.findMany({
        where: { streamerId: id },
        take: 50,
        orderBy: { date: 'asc' },
      }).catch(() => []),
      
      // Toplam yayın sayısı
      prisma.stream.count({
        where: { streamerId: id },
      }).catch(() => 0),
      
      // Toplam external stream sayısı
      prisma.externalStream.count({
        where: { streamerId: id },
      }).catch(() => 0),
      
      // Toplam maliyet
      prisma.stream.aggregate({
        where: { streamerId: id },
        _sum: { cost: true },
      }).catch(() => ({ _sum: { cost: null } })),
      
      // Takım bazlı kazanç hesaplamaları
      prisma.stream.groupBy({
        by: ['teamName'],
        where: {
          streamerId: id,
          teamName: { not: null },
        },
        _sum: {
          streamerEarning: true,
          totalRevenue: true,
        },
        _count: {
          id: true,
        },
      }).catch(() => []),
      
      // Toplam kazanç
      prisma.stream.aggregate({
        where: { streamerId: id },
        _sum: { streamerEarning: true },
      }).catch(() => ({ _sum: { streamerEarning: null } })),
      
      // Ödenmemiş yayınlar
      prisma.stream.aggregate({
        where: {
          streamerId: id,
          paymentStatus: 'pending',
        },
        _sum: { streamerEarning: true },
      }).catch(() => ({ _sum: { streamerEarning: null } })),
      
      // Ödenmemiş ödemeler
      prisma.payment.aggregate({
        where: {
          streamerId: id,
          paidAt: null,
        },
        _sum: { amount: true },
      }).catch(() => ({ _sum: { amount: null } })),
      
      // Finansal kayıtlar - occurredAt kullan (date deprecated, index optimize edildi)
      prisma.financialRecord.findMany({
        where: { streamerId: id },
        select: {
          id: true,
          type: true,
          amount: true,
          date: true,
          occurredAt: true,
          description: true,
          entryType: true,
          direction: true,
          updatedAt: true,
          createdAt: true,
        },
        orderBy: { occurredAt: 'asc' }, // occurredAt index'li
      }).catch(() => []),
      
      // Payout kayıtları
      prisma.payout.findMany({
        where: {
          recipientType: 'streamer',
          recipientId: id,
        },
        orderBy: { createdAt: 'asc' },
      }).catch(() => []),
    ])

    if (!streamerData) {
      notFound()
    }

    // Streams'i manuel olarak ekle
    streamer = {
      ...streamerData,
      streams: allStreams,
    }

    totalStreams = totalStreamsResult
    totalExternalStreams = totalExternalStreamsResult
    totalCost = totalCostResult
    teamEarnings = teamEarningsResult
    totalStreamerEarning = totalStreamerEarningResult
    unpaidStreams = unpaidStreamsResult
    unpaidPayments = unpaidPaymentsResult
    financialRecords = financialRecordsResult
    payouts = payoutsResult
  } catch (error) {
    console.error('Error fetching streamer:', error)
    notFound()
  }
  
  // Payout'ları FinancialRecord formatına çevir (görünüm için)
  const payoutRecords = payouts.map(payout => ({
    id: `payout-${payout.id}`,
    type: 'expense' as const,
    category: 'Ödeme',
    amount: payout.amount,
    date: payout.paidAt || payout.createdAt,
    description: payout.note || 'Manuel ödeme kaydı',
    entryType: 'payout',
    direction: 'OUT' as const,
  }))
  
  // FinancialRecords ve Payout kayıtlarını birleştir ve sırala
  const allFinancialRecords = [
    ...financialRecords,
    ...payoutRecords.filter(p => !financialRecords.some(fr => fr.relatedPaymentId === p.id.replace('payout-', '')))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Eski → Yeni sıralama
  
  // Toplam kayıt sayısı
  const totalFinancialRecords = allFinancialRecords.length
  const totalPages = Math.ceil(totalFinancialRecords / recordsPerPage)
  
  // Sayfalama için sadece mevcut sayfadaki kayıtları göster
  const paginatedRecords = allFinancialRecords.slice(skip, skip + recordsPerPage)

  const totalUnpaid = (unpaidStreams._sum.streamerEarning || 0) + (unpaidPayments._sum.amount || 0)

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link
            href="/streamers"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Yayıncılara dön
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {streamer.profilePhoto ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={streamer.profilePhoto}
                    alt={streamer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {streamer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {streamer.name}
                </h1>
                {streamer.email && (
                  <div className="mt-2 flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="text-xs text-green-600 font-medium">📧 Email:</span>
                    <p className="text-sm text-gray-900 font-semibold">
                      {streamer.email}
                    </p>
                    <span className="text-xs text-green-600">(Giriş için)</span>
                  </div>
                )}
                {!streamer.email && (
                  <div className="mt-2 flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <span className="text-xs text-yellow-600 font-medium">⚠️ Giriş bilgileri eklenmemiş</span>
                  </div>
                )}
                {streamer.iban && (
                  <div className="mt-3 flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">IBAN</p>
                      <p className="text-sm text-gray-900 font-mono font-semibold">
                        {streamer.iban}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/streamers/${streamer.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Düzenle
              </Link>
              <Link
                href="/streams/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yayın Ekle
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Toplam Yayın
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {totalStreams}
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Dış Yayın
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {totalExternalStreams}
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Ödenen
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {(totalStreamerEarning._sum.streamerEarning || 0).toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Ödenmemiş
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-red-600">
                  {totalUnpaid.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Giriş Bilgileri */}
        <LoginCredentialsForm
          type="streamer"
          id={streamer.id}
          currentEmail={streamer.email}
        />

        {/* Firma Bazlı Kazanç Özeti */}
        {teamEarnings.length > 0 && (
          <div className="mb-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Firma Bazlı Kazanç Özeti
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Firma
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yayın Sayısı
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toplam Gelir
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yayıncının Alacağı
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamEarnings.map((team) => (
                      <tr key={team.teamName}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {team.teamName || 'Belirtilmemiş'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {team._count.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {(team._sum.totalRevenue || 0).toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                          {(team._sum.streamerEarning || 0).toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                            maximumFractionDigits: 0,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {streamer.teamRates && streamer.teamRates.length > 0 && (
          <div className="mb-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Firma Bazlı Ücretler
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Firma Adı
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Saatlik Ücret
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {streamer.teamRates.map((rate) => (
                      <tr key={rate.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rate.teamName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {rate.hourlyRate.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-blue-600" />
                  Yayınlar ({streamer.streams.length})
                </h3>
                <Link
                  href={`/streams/new`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Yeni Ekle
                </Link>
              </div>
            </div>
            <div className="p-6">
              <StreamList streams={streamer.streams} streamerId={streamer.id} />
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                Dış Yayınlar ({streamer.externalStreams.length})
              </h3>
            </div>
            <div className="p-6">
              {streamer.externalStreams.length === 0 ? (
                <div className="text-center py-8">
                  <ExternalLink className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Henüz dış yayın eklenmemiş</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {streamer.externalStreams.map((ext) => (
                    <div
                      key={ext.id}
                      className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {ext.teamName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {format(new Date(ext.date), 'dd MMM yyyy', { locale: tr })}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {ext.duration} dakika
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-green-600">
                            {ext.payment.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Finansal Kayıtlar */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Finansal Kayıtlar ({totalFinancialRecords > 0 ? `${skip + 1}-${Math.min(skip + recordsPerPage, totalFinancialRecords)} / ${totalFinancialRecords}` : 0})
              </h3>
            </div>
            {allFinancialRecords.length > 0 ? (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarih
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Açıklama
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tutar
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(record.date), 'dd MMM yyyy', { locale: tr })}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {record.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {record.description || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold">
                            <span className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                              {record.type === 'income' ? '+' : '-'}
                              {record.amount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              ✅ Ödenmiş
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <DeleteFinancialRecordButton recordId={record.id} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Sayfalama */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Sayfa {currentPage} / {totalPages}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentPage > 1 && (
                        <Link
                          href={`/streamers/${id}?page=${currentPage - 1}`}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Önceki
                        </Link>
                      )}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <Link
                            key={pageNum}
                            href={`/streamers/${id}?page=${pageNum}`}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </Link>
                        )
                      })}
                      {currentPage < totalPages && (
                        <Link
                          href={`/streamers/${id}?page=${currentPage + 1}`}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Sonraki
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Henüz finansal kayıt bulunmuyor</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

