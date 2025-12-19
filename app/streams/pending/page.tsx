'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'
import StreamCostModal from '@/components/StreamCostModal'
import ApproveStreamButton from '@/components/ApproveStreamButton'

export default function PendingStreamsPage() {
  const [pendingStreams, setPendingStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStream, setSelectedStream] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/streams/pending')
      const data = await res.json()
      setPendingStreams(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching pending streams:', error)
      setPendingStreams([])
    } finally {
      setLoading(false)
    }
  }

  const handleCostClick = (stream: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedStream(stream)
    setIsModalOpen(true)
  }

  const handleUpdate = () => {
    fetchData()
    setIsModalOpen(false)
    setSelectedStream(null)
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
                      <button
                        onClick={(e) => handleCostClick(stream, e)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        title="Maliyet Bilgileri"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <ApproveStreamButton streamId={stream.id} onUpdate={fetchData} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

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
      </div>
    </Layout>
  )
}

