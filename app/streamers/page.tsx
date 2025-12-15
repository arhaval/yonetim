'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus, ExternalLink, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DeleteButton from '@/components/DeleteButton'

export default function StreamersPage() {
  const router = useRouter()
  const [streamers, setStreamers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/streamers')
      const data = await res.json()
      setStreamers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching streamers:', error)
      // DÜZELTME BURADA YAPILDI
      setStreamers([])
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Yayıncılar
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Tüm yayıncıları görüntüleyin ve yönetin
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/streamers/new"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Yayıncı
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="divide-y divide-gray-200">
            {streamers.map((streamer) => (
              <div key={streamer.id} className="relative group">
                <Link
                  href={`/streamers/${streamer.id}`}
                  className="block hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                >
                  <div className="px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {streamer.profilePhoto ? (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                            <img
                              src={streamer.profilePhoto}
                              alt={streamer.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-xl">
                              {streamer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {streamer.name}
                            </p>
                            {!streamer.isActive && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Pasif
                              </span>
                            )}
                          </div>
                          {streamer.channelUrl && (
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <a
                                href={streamer.channelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
                              >
                                <span>Kanal</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {streamer._count?.streams || 0} yayın
                          </p>
                          <p className="text-xs text-gray-500">
                            {streamer._count?.externalStreams || 0} dış yayın
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-indigo-600">
                            {(streamer.hourlyRate || 0).toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            })}
                          </p>
                          <p className="text-xs text-gray-500">saat başı</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Silme Butonu */}
                <div className="absolute top-4 right-4 z-10">
                  <DeleteButton
                    id={streamer.id}
                    type="streamer"
                    onDelete={fetchData}
                    compact={true}
                  />
                </div>
              </div>
            ))}
          </div>
          {streamers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Users className="w-10 h-10 text-indigo-600" />
              </div>
              <p className="text-sm text-gray-500 mb-4">Henüz yayıncı eklenmemiş</p>
              <Link
                href="/streamers/new"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                İlk yayıncıyı ekle
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}