import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import DeleteStreamButton from '@/components/DeleteStreamButton'

export default async function StreamDetailPage({
  params,
}: {
  params: { id: string }
}) {
  let stream = null
  
  try {
    stream = await prisma.stream.findUnique({
      where: { id: params.id },
      include: {
        streamer: true,
      },
    }).catch(() => null)

    if (!stream) {
      notFound()
    }
  } catch (error) {
    console.error('Error fetching stream:', error)
    notFound()
  }

  const teams = stream.teams ? JSON.parse(stream.teams) : []

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/streamers/${stream.streamerId}`}
                className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
              >
                ← {stream.streamer.name} profiline dön
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Yayın Detayları</h1>
            </div>
            <DeleteStreamButton streamId={stream.id} streamerId={stream.streamerId} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500">Tarih</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {format(new Date(stream.date), 'dd MMMM yyyy', { locale: tr })}
                </dd>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500">Süre</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {stream.duration} saat
                </dd>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500">Maliyet</dt>
                <dd className="mt-1 text-lg font-semibold text-red-600">
                  {stream.cost.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </dd>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <dt className="text-sm font-medium text-gray-500">Saatlik Maliyet</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {stream.duration > 0
                    ? (stream.cost / stream.duration).toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })
                    : '0 ₺'}
                  /saat
                </dd>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Yayıncı</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Link
                    href={`/streamers/${stream.streamerId}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {stream.streamer.name}
                  </Link>
                </dd>
              </div>

              {stream.matchInfo && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Maç</dt>
                  <dd className="mt-1 text-sm text-gray-900">{stream.matchInfo}</dd>
                </div>
              )}

              {teams.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Firmalar</dt>
                  <dd className="mt-1">
                    <div className="flex flex-wrap gap-2">
                      {teams.map((team: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {team}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}

              {stream.notes && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Notlar</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {stream.notes}
                  </dd>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
