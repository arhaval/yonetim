'use client'

import Layout from '@/components/Layout'
import VoiceoverInbox from '@/components/VoiceoverInbox'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyVoiceoversPage() {
  const router = useRouter()
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

        setCreatorId(data.creator.id)
      } catch (error) {
        router.push('/creator-login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!creatorId) {
    return null
  }

  return (
    <Layout>
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
    </Layout>
  )
}

