'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus, Calendar, Clock, DollarSign, User, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import DeleteButton from '@/components/DeleteButton'
import StreamCostModal from '@/components/StreamCostModal'

export default function StreamsPage() {
  const router = useRouter()
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStream, setSelectedStream] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/streams')
      const data = await res.json()
      setStreams(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching streams:', error)
      setStreams([])
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
        <div className="space-y-6">
          <p>Yükleniyor...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Yayınlar
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gerçekleşen yayınların listesi ve detayları
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/streams/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Yayın Ekle
            </Link>
          </div>
        </div>

        {streams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz kayıtlı yayın yok
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              İlk yayını ekleyerek takibe başlayın
            </p>
            <Link
              href="/streams/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yayın Ekle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {streams.map((stream) => (
              <div
                key={stream.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="p-5">
                  {/* Yayıncı Bilgisi */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                      {stream.streamer?.profilePhoto ? (
                        <img
                          src={stream.streamer.profilePhoto}
                          alt={stream.streamer.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {stream.streamer?.name || 'Bilinmeyen Yayıncı'}
                      </p>
                      {stream.teamName && (
                        <p className="text-xs text-blue-600 font-medium">{stream.teamName}</p>
                      )}
                    </div>
                  </div>

                  {/* Maç Bilgisi */}
                  {stream.matchInfo && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {stream.matchInfo}
                      </p>
                    </div>
                  )}

                  {/* Tarih ve Süre */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(stream.date).toISOString().split('T')[0], 'dd MMM yyyy', { locale: tr })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {stream.duration} saat
                    </div>
                  </div>

                  {/* Maliyet */}
                  <div className="border-t pt-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Maliyet:</span>
                      {stream.streamerEarning > 0 ? (
                        <span className="text-base font-bold text-red-600">
                          {stream.streamerEarning.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Girilmemiş</span>
                      )}
                    </div>
                    {stream.totalRevenue > 0 && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">Gelir:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {stream.totalRevenue.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* İşlem Butonları */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <button
                      onClick={(e) => handleCostClick(stream, e)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      title="Maliyet Bilgileri"
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Maliyet
                    </button>
                    <Link
                      href={`/streams/${stream.id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-indigo-300 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Detay
                    </Link>
                    <DeleteButton
                      id={stream.id}
                      type="stream"
                      onDelete={fetchData}
                      compact={true}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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