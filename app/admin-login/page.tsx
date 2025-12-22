'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginLayout } from '@/components/shared/LoginLayout'

export default function AdminLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (email: string, password: string) => {
    setError('')
    setLoading(true)

    // Admin email kontrolü
    if (email.toLowerCase().trim() !== 'hamitkulya3@icloud.com') {
      setError('Geçersiz admin email adresi')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
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

      router.push('/')
      router.refresh()
    } catch (err) {
      setError('Bir hata oluştu')
      setLoading(false)
    }
  }

  return (
    <LoginLayout
      title="Admin Girişi"
      description="Sistem yönetimi paneline erişim"
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
    />
  )
}
