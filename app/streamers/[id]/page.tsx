import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, ExternalLink, CreditCard, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import StreamList from './StreamList'
import PaymentCards from './PaymentCards'

export default async function StreamerDetailPage({
  params,
}: {
  params: { id: string }
}) {
  let streamer = null
  let totalStreams = 0
  let totalExternalStreams = 0
  let totalCost = { _sum: { cost: null as number | null } }
  
  try {
    streamer = await prisma.streamer.findUnique({
      where: { id: params.id },
      include: {
        streams: {
          orderBy: { date: 'asc' },
        },
        externalStreams: {
          take: 10,
          orderBy: { date: 'asc' },
        },
        payments: {
          orderBy: { paidAt: 'asc' },
        },
        teamRates: true,
      },
    })

    if (!streamer) {
      notFound()
    }

    totalStreams = await prisma.stream.count({
      where: { streamerId: streamer.id },
    }).catch(() => 0)
    
    totalExternalStreams = await prisma.externalStream.count({
      where: { streamerId: streamer.id },
    }).catch(() => 0)
    
    totalCost = await prisma.stream.aggregate({
      where: { streamerId: streamer.id },
      _sum: { cost: true },
    }).catch(() => ({ _sum: { cost: null } }))
  } catch (error) {
    console.error('Error fetching streamer:', error)
    notFound()
  }

  // Takım bazlı kazanç hesaplamaları
  const teamEarnings = await prisma.stream.groupBy({
    by: ['teamName'],
    where: {
      streamerId: streamer.id,
      teamName: { not: null },
    },
    _sum: {
      streamerEarning: true,
      totalRevenue: true,
    },
    _count: {
      id: true,
    },
  }).catch(() => [])

  const totalStreamerEarning = await prisma.stream.aggregate({
    where: { streamerId: streamer.id },
    _sum: { streamerEarning: true },
  }).catch(() => ({ _sum: { streamerEarning: null } }))

  // Ödenmemiş paraları hesapla
  const unpaidStreams = await prisma.stream.aggregate({
    where: {
      streamerId: streamer.id,
      paymentStatus: 'pending',
    },
    _sum: { streamerEarning: true },
  }).catch(() => ({ _sum: { streamerEarning: null } }))

  const unpaidPayments = await prisma.payment.aggregate({
    where: {
      streamerId: streamer.id,
      paidAt: null,
    },
    _sum: { amount: true },
  }).catch(() => ({ _sum: { amount: null } }))

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
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {streamer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {streamer.name}
                </h1>
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
          <PaymentCards
            totalEarning={totalStreamerEarning._sum.streamerEarning || 0}
            totalUnpaid={totalUnpaid}
            payments={streamer.payments}
            streams={streamer.streams}
          />
        </div>

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
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Tüm Yayınlar ({streamer.streams.length})
                </h3>
                <Link
                  href="/streams/new"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Yeni Yayın Ekle
                </Link>
              </div>
              <StreamList streams={streamer.streams} streamerId={streamer.id} />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Dış Yayınlar (Başka Firmalar)
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {streamer.externalStreams.map((ext) => (
                    <li key={ext.id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {ext.teamName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(ext.date), 'dd MMM yyyy', {
                              locale: tr,
                            })}{' '}
                            - {ext.duration} dakika
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {ext.payment.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {streamer.externalStreams.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Henüz dış yayın eklenmemiş
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

