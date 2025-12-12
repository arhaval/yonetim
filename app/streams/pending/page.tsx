import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { Check, X, DollarSign } from 'lucide-react'
import StreamCostModal from '@/components/StreamCostModal'
import ApproveStreamButton from '@/components/ApproveStreamButton'

export default async function PendingStreamsPage() {
  // Prisma Client güncellenene kadar geçici çözüm
  let pendingStreams: any[] = []
  try {
    pendingStreams = await prisma.stream.findMany({
      where: { status: 'pending' },
      include: {
        streamer: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error: any) {
    // Eğer status alanı henüz tanınmıyorsa, tüm yayınları göster
    if (error.message?.includes('status')) {
      console.warn('Status alanı henüz tanınmıyor. Tüm yayınlar gösteriliyor.')
      pendingStreams = await prisma.stream.findMany({
        include: {
          streamer: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10, // Son 10 yayını göster
      })
    } else {
      throw error
    }
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Onay Bekleyen Yayınlar</h1>
            <p className="mt-2 text-sm text-gray-600">
              Yayıncıların eklediği yayınları onaylayın ve maliyet bilgilerini girin
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/streams"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Tüm Yayınlar
            </Link>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {pendingStreams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">Onay bekleyen yayın bulunmuyor</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {pendingStreams.map((stream) => (
                <li key={stream.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {stream.matchInfo || 'Yayın'}
                          </p>
                          <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              <span className="font-medium">Yayıncı:</span>{' '}
                              <Link
                                href={`/streamers/${stream.streamerId}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {stream.streamer.name}
                              </Link>
                            </span>
                            <span>
                              <span className="font-medium">Tarih:</span>{' '}
                              {format(new Date(stream.date), 'dd MMMM yyyy', { locale: tr })}
                            </span>
                            <span>
                              <span className="font-medium">Süre:</span> {stream.duration} saat
                            </span>
                            {stream.teamName && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {stream.teamName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApproveStreamButton streamId={stream.id} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}

