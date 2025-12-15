'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreatorLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/creator-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Giriş başarısız')
        
        // Email kontrolü yap
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

      // Başarılı giriş
      router.push('/creator-dashboard')
      router.refresh()
    } catch (err) {
      setError('Bir hata oluştu')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#eaeaea' }}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold" style={{ background: 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            İçerik Üreticisi Girişi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            İçeriklerinizi eklemek için giriş yapın
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
              {debugInfo && (
                <div className="mt-3 p-3 bg-gray-100 rounded text-xs text-gray-700">
                  <p className="font-semibold mb-2">Debug Bilgisi:</p>
                  <p>Email bulundu: {debugInfo.found ? 'Evet' : 'Hayır'}</p>
                  {debugInfo.found && debugInfo.creator && (
                    <>
                      <p>İsim: {debugInfo.creator.name}</p>
                      <p>Aktif: {debugInfo.creator.isActive ? 'Evet' : 'Hayır'}</p>
                      <p>Şifre var: {debugInfo.creator.hasPassword ? 'Evet' : 'Hayır'}</p>
                    </>
                  )}
                  {debugInfo.allCreators && debugInfo.allCreators.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Veritabanındaki tüm içerik üreticileri:</p>
                      <ul className="list-disc list-inside mt-1">
                        {debugInfo.allCreators.map((c: any, i: number) => (
                          <li key={i}>{c.email} - {c.name} {c.hasPassword ? '(şifre var)' : '(şifre yok)'}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email adresiniz"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Şifreniz"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #06b8b5 0%, #e91e63 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)'}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
          <div className="text-center mt-2">
            <button
              type="button"
              onClick={async () => {
                if (!email || !password) {
                  alert('Lütfen email ve şifre girin')
                  return
                }
                try {
                  const res = await fetch('/api/creator-auth/test-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                  })
                  const data = await res.json()
                  console.log('Test Login Result:', data)
                  alert(JSON.stringify(data, null, 2))
                } catch (err) {
                  console.error('Test failed:', err)
                  alert('Test hatası: ' + err)
                }
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Test Et (Debug)
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Admin girişi için tıklayın
          </Link>
        </div>
      </div>
    </div>
  )
}



