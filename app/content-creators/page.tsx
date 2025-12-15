'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus, ExternalLink, User, Mail, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DeleteButton from '@/components/DeleteButton'

export default function ContentCreatorsPage() {
  const router = useRouter()
  const [creators, setCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/content-creators')
      const data = await res.json()
      setCreators(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching content creators:', error)
      // DÜZELTME BURADA YAPILDI
      setCreators([])
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
              İçerik Üreticileri
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Tüm içerik üreticilerini görüntüleyin ve yönetin
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/content-creators/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni İçerik Üreticisi
            </Link>
          </div>
        </div>

        {creators.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz içerik üreticisi yok
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              İlk içerik üreticisini ekleyerek başlayın
            </p>
            <Link
              href="/content-creators/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              İçerik Üreticisi Ekle
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Tüm İçerik Üreticileri ({creators.length})
              </h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {creators.map((creator) => (
                <li key={creator.id} className="relative group">
                  <Link
                    href={`/content-creators/${creator.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {creator.profilePhoto ? (
                            <img
                              src={creator.profilePhoto}
                              alt={creator.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User className="w-6 h-6 text-indigo-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {creator.name}
                              </p>
                              {!creator.isActive && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Pasif
                                </span>
                              )}
                              {creator.email && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Giriş Aktif
                                </span>
                              )}
                              {!creator.password && creator.email && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Şifre Yok
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              {creator.email && (
                                <span className="flex items-center">
                                  <Mail className="w-4 h-4 mr-1" />
                                  {creator.email}
                                </span>
                              )}
                              {creator.platform && (
                                <span>{creator.platform}</span>
                              )}
                              {creator.channelUrl && (
                                <a
                                  href={creator.channelUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
                                >
                                  <span>Kanal</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 ml-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {creator._count?.contents || 0} içerik
                            </p>
                            <p className="text-xs text-gray-500">
                              {creator._count?.scripts || 0} metin
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {/* Silme Butonu */}
                  <div className="absolute top-4 right-4 z-10">
                    <DeleteButton
                      id={creator.id}
                      type="content-creator"
                      onDelete={fetchData}
                      compact={true}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  )
}