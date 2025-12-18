'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Sadece hamitkulya3@icloud.com ile giriş yapılabilir
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#1e293b' }}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 space-y-8">
          {/* Logo & Header */}
          <div className="text-center">
            <div className="mx-auto w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl mb-6 bg-white p-4 ring-4 ring-indigo-100">
              <Image 
                src="/arhaval-logo.png" 
                alt="Arhaval Logo" 
                width={96}
                height={96}
                className="w-full h-full object-contain"
                priority
                unoptimized
              />
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Admin Girişi
            </h2>
            <p className="mt-2 text-base text-gray-500">
              
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
                  Admin Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input w-full"
                  placeholder="admin@example.com"
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
                'Admin Girişi Yap'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

