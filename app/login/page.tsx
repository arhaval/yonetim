'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#1e293b' }}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 space-y-8">
          {/* Logo & Header */}
          <div className="text-center">
            <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-4 bg-white p-3">
              <img 
                src="/arhaval-logo.png" 
                alt="Arhaval Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback: Eğer logo yüklenemezse profesyonel görünümü göster
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<span class="text-white font-bold text-2xl">A</span>'
                    target.parentElement.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  }
                }}
              />
            </div>
            <h2 className="text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Arhaval Denetim Merkezi
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hesabınıza giriş yapın
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Adresi
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input w-full"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-base py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Diğer Giriş Seçenekleri */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-4">
              Farklı bir hesap türü için giriş yapın:
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/streamer-login"
                className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <span>Yayıncı Girişi</span>
              </Link>
              <Link
                href="/creator-login"
                className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <span>İçerik Üreticisi Girişi</span>
              </Link>
              <Link
                href="/voice-actor-login"
                className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <span>Seslendirmen Girişi</span>
              </Link>
              <Link
                href="/team-login"
                className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <span>Ekip Üyesi Girişi</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





