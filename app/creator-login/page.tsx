'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginLayout } from '@/components/shared/LoginLayout'

export default function CreatorLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleSubmit = async (email: string, password: string) => {
    setError('')
    setLoading(true)
    setDebugInfo(null)

    try {
      const res = await fetch('/api/creator-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Giriş başarısız')
        
        // Email kontrolü yap (debug için)
        try {
          const checkRes = await fetch('/api/creator-auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
          const checkData = await checkRes.json()
          setDebugInfo(checkData)
        } catch (err) {
          console.error('Debug check failed:', err)
        }
        
        setLoading(false)
        return
      }

      router.push('/creator-dashboard')
      router.refresh()
    } catch (err) {
      setError('Bir hata oluştu')
      setLoading(false)
    }
  }

  return (
    <LoginLayout
      title="İçerik Üreticisi Girişi"
      description="Metinlerinizi gönderin ve takip edin"
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
      debugInfo={debugInfo}
      showDebugButton={process.env.NODE_ENV === 'development'}
    />
  )
}
