'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus, Calendar, Clock, DollarSign, User, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

  // Tarih formatlama yardımcı fonksiyonu
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Süre formatlama (saat cinsinden)
  const formatDuration = (hours: number) => {
    if (!hours || hours === 0) return '0 saat'
    return `${hours} saat`
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
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yayıncı / Platform
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Süre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maliyet
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {streams.map((stream) => (
                    <tr key={stream.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                             {stream.streamer?.profilePhoto ? (
                                <img src={stream.streamer.profilePhoto} alt="" className="h-10 w-10 rounded-full object-cover"/>
                             ) : (
                                <User className="h-5 w-5 text-gray-500" />
                             )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {stream.streamer?.name || 'Bilinmeyen Yayıncı'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              {stream.platform || 'Platform Yok'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(stream.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDuration(stream.duration)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                          {stream.streamerEarning > 0 ? (
                            <span className="text-red-600">
                              {stream.streamerEarning.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                          ) : (
                            <span className="text-gray-400">Maliyet girilmemiş</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={(e) => handleCostClick(stream, e)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            title="Maliyet Bilgileri"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <Link 
                            href={`/streams/${stream.id}`}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
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