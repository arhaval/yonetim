'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { DollarSign } from 'lucide-react'
import DeleteStreamButton from '@/components/DeleteStreamButton'
import StreamCostModal from '@/components/StreamCostModal'

export default function StreamList({ streams, streamerId }: { streams: any[], streamerId: string }) {
  const [selectedStream, setSelectedStream] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCostClick = (stream: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedStream(stream)
    setIsModalOpen(true)
  }

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
    window.location.reload()
  }

  return (
    <>
      <div className="space-y-3">
        {streams.length > 0 ? (
          streams.map((stream) => (
            <div
              key={stream.id}
              className="bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/streams/${stream.id}`}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Tarih ve Durum */}
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {format(new Date(stream.date), 'dd MMM yyyy', {
                            locale: tr,
                          })}
                        </p>
                        {stream.status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Onay Bekliyor
                          </span>
                        )}
                        {stream.status === 'approved' && stream.streamerEarning === 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            Maliyet Bekleniyor
                          </span>
                        )}
                      </div>

                      {/* Maç Bilgisi */}
                      {stream.matchInfo && (
                        <p className="text-sm text-gray-900 mb-2 line-clamp-1">
                          {stream.matchInfo}
                        </p>
                      )}

                      {/* Detaylar */}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="font-medium">{stream.duration} saat</span>
                        {stream.teamName && (
                          <span className="text-blue-600 font-medium">{stream.teamName}</span>
                        )}
                      </div>
                    </div>

                    {/* Maliyet */}
                    <div className="text-right flex-shrink-0">
                      {stream.streamerEarning > 0 ? (
                        <div>
                          <p className="text-base font-bold text-red-600">
                            {stream.streamerEarning.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            })}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">Gider</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Maliyet girilmemiş</p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* İşlem Butonları */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleCostClick(stream, e)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Maliyet Bilgileri"
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>
                  <DeleteStreamButton
                    streamId={stream.id}
                    streamerId={streamerId}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Henüz yayın eklenmemiş.</p>
          </div>
        )}
      </div>

      {selectedStream && (
        <StreamCostModal
          stream={selectedStream}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedStream(null)
          }}
          onUpdate={handleUpdate}
        />
      )}
    </>
  )
}

