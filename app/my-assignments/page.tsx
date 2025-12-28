'use client'

import Layout from '@/components/Layout'
import VoiceoverInbox from '@/components/VoiceoverInbox'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyAssignmentsPage() {
  const router = useRouter()
  const [voiceActorId, setVoiceActorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/voice-actor-auth/me', { cache: 'no-store' })
        const data = await res.json()

        if (!data.voiceActor) {
          router.push('/voice-actor-login')
          return
        }

        setVoiceActorId(data.voiceActor.id)
      } catch (error) {
        router.push('/voice-actor-login')
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

  if (!voiceActorId) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bekleyen Seslendirmelerim</h1>
          <p className="mt-2 text-sm text-gray-600">
            Size atanan seslendirme metinlerini görüntüleyin ve yönetin
          </p>
        </div>
        <VoiceoverInbox
          initialFilters={{ voiceActorId }}
          showBulkActions={false}
          title="Atanan Metinler"
        />
      </div>
    </Layout>
  )
}

