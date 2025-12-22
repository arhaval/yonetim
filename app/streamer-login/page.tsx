'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginLayout } from '@/components/shared/LoginLayout'

export default function StreamerLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (email: string, password: string) => {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/streamer-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Giriş başarısız')
        setLoading(false)
        return
      }

      router.push('/streamer-dashboard')
      router.refresh()
    } catch (err) {
      setError('Bir hata oluştu')
      setLoading(false)
    }
  }

  return (
    <LoginLayout
      title="Yayıncı Girişi"
      description="Yayınlarınızı ekleyin ve ödemelerinizi görüntüleyin"
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
    />
  )
}
