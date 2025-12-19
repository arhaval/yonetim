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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yayıncı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maç Bilgisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Firma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Süre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maliyet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gelir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {streams.map((stream) => (
                    <tr key={stream.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(stream.date), 'dd MMM yyyy', { locale: tr })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {stream.streamer?.profilePhoto ? (
                            <img
                              className="h-10 w-10 rounded-full mr-3"
                              src={stream.streamer.profilePhoto}
                              alt={stream.streamer.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mr-3">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {stream.streamer?.name || 'Bilinmeyen Yayıncı'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={stream.matchInfo || ''}>
                          {stream.matchInfo || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stream.teamName ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {stream.teamName}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {stream.duration} saat
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stream.streamerEarning > 0 ? (
                          <span className="text-sm font-bold text-red-600">
                            {stream.streamerEarning.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Girilmemiş</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stream.totalRevenue > 0 ? (
                          <span className="text-sm font-semibold text-green-600">
                            {stream.totalRevenue.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleCostClick(stream, e)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            title="Maliyet Bilgileri"
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Maliyet
                          </button>
                          <Link
                            href={`/streams/${stream.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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