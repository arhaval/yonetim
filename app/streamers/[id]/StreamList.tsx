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
      <div className="flow-root">
        <ul className="-my-5 divide-y divide-gray-200">
          {streams.length > 0 ? (
            streams.map((stream) => (
              <li key={stream.id} className="py-4">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/streams/${stream.id}`}
                    className="flex-1 block hover:bg-gray-50 -mx-4 px-4 py-2 rounded"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(stream.date), 'dd MMM yyyy', {
                              locale: tr,
                            })}
                          </p>
                          {stream.totalRevenue === 0 && stream.streamerEarning === 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              Maliyet Bekleniyor
                            </span>
                          )}
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Süre:</span>{' '}
                            <span className="font-medium">{stream.duration} saat</span>
                          </div>
                          {stream.teamName && (
                            <div>
                              <span className="text-gray-500">Firma:</span>{' '}
                              <span className="font-medium text-blue-600">
                                {stream.teamName}
                              </span>
                            </div>
                          )}
                          {stream.matchInfo && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Maç:</span>{' '}
                              <span className="font-medium">{stream.matchInfo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        {stream.streamerEarning > 0 ? (
                          <p className="text-sm font-medium text-red-600">
                            {stream.streamerEarning.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            })}
                            <span className="text-xs text-gray-500 block mt-1">Gider</span>
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-gray-400">
                            Maliyet girilmemiş
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Detay →</p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleCostClick(stream, e)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              </li>
            ))
          ) : (
            <li className="py-4">
              <p className="text-sm text-gray-500 text-center">
                Henüz yayın eklenmemiş.
              </p>
            </li>
          )}
        </ul>
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

