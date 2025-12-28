'use client'

import VoiceoverInbox from '@/components/VoiceoverInbox'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MyVoiceoversPage() {
  const router = useRouter()
  const [creator, setCreator] = useState<any>(null)
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/creator-auth/me', { cache: 'no-store' })
        const data = await res.json()

        if (!data.creator) {
          router.push('/creator-login')
          return
        }

        setCreator(data.creator)
        setCreatorId(data.creator.id)
      } catch (error) {
        router.push('/creator-login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/creator-auth/logout', { method: 'POST' })
    router.push('/creator-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!creatorId || !creator) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/creator-dashboard"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard'a Dön
              </Link>
              <div className="flex items-center space-x-4 ml-4">
                {creator.profilePhoto ? (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-indigo-200">
                    <img
                      src={creator.profilePhoto}
                      alt={creator.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-indigo-200">
                    <span className="text-white font-bold text-lg">
                      {creator.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {creator.name}
                  </h1>
                  <p className="text-sm text-gray-600">İçerik Üreticisi</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seslendirme Metinlerim</h1>
            <p className="mt-2 text-sm text-gray-600">
              Oluşturduğunuz tüm seslendirme metinlerini görüntüleyin ve yönetin
            </p>
          </div>
          <VoiceoverInbox
            initialFilters={{ creatorId }}
            showBulkActions={false}
            title="Metinlerim"
          />
        </div>
      </div>
    </div>
  )
}

