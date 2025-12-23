'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, Video, UserCircle, Mic, Shield, Users } from 'lucide-react'

type UserType = 'admin' | 'streamer' | 'creator' | 'voiceActor' | 'team' | null

export default function LoginPage() {
  const router = useRouter()
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const userTypes = [
    {
      id: 'admin' as UserType,
      label: 'Admin',
      icon: Shield,
      color: 'indigo',
      description: 'Sistem yönetimi',
      apiEndpoint: '/api/auth/login',
      redirectTo: '/',
    },
    {
      id: 'streamer' as UserType,
      label: 'Yayıncı',
      icon: Video,
      color: 'blue',
      description: 'Yayınlar ve ödemeler',
      apiEndpoint: '/api/streamer-auth/login',
      redirectTo: '/streamer-dashboard',
    },
    {
      id: 'creator' as UserType,
      label: 'İçerik Üreticisi',
      icon: UserCircle,
      color: 'purple',
      description: 'Metin gönderimi',
      apiEndpoint: '/api/creator-auth/login',
      redirectTo: '/creator-dashboard',
    },
    {
      id: 'voiceActor' as UserType,
      label: 'Seslendirmen',
      icon: Mic,
      color: 'pink',
      description: 'Seslendirme işleri',
      apiEndpoint: '/api/voice-actor-auth/login',
      redirectTo: '/voice-actor-dashboard',
    },
    {
      id: 'team' as UserType,
      label: 'Ekip Üyesi',
      icon: Users,
      color: 'teal',
      description: 'Ödemeler ve görevler',
      apiEndpoint: '/api/team-auth/login',
      redirectTo: '/team-dashboard',
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedUserType) {
      setError('Lütfen bir kullanıcı tipi seçin')
      return
    }

    setLoading(true)

    try {
      const userTypeConfig = userTypes.find(ut => ut.id === selectedUserType)
      if (!userTypeConfig) {
        setError('Geçersiz kullanıcı tipi')
        setLoading(false)
        return
      }

      // Admin email kontrolü
      if (selectedUserType === 'admin') {
        if (email.toLowerCase().trim() !== 'hamitkulya3@icloud.com') {
          setError('Geçersiz admin email adresi')
          setLoading(false)
          return
        }
      }

      const res = await fetch(userTypeConfig.apiEndpoint, {
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

      router.push(userTypeConfig.redirectTo)
      router.refresh()
    } catch (err) {
      setError('Bir hata oluştu')
      setLoading(false)
    }
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-500',
        text: 'text-indigo-600',
        hover: 'hover:bg-indigo-100',
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-100',
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-500',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-100',
      },
      pink: {
        bg: 'bg-pink-50',
        border: 'border-pink-500',
        text: 'text-pink-600',
        hover: 'hover:bg-pink-100',
      },
      teal: {
        bg: 'bg-teal-50',
        border: 'border-teal-500',
        text: 'text-teal-600',
        hover: 'hover:bg-teal-100',
      },
    }
    return colors[color] || colors.indigo
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 mb-4 flex items-center justify-center bg-white rounded-lg p-2 shadow-sm">
              <img 
                src="/arhaval-logo.png?v=2" 
                alt="Arhaval Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Arhaval Denetim Merkezi
            </h2>
            <p className="text-sm text-gray-500">
              Giriş yapmak için hesap tipinizi seçin
            </p>
          </div>

          {/* Kullanıcı Tipi Seçimi */}
          {!selectedUserType ? (
            <div className="space-y-3 mb-6">
              {userTypes.map((userType) => {
                const Icon = userType.icon
                const colors = getColorClasses(userType.color)
                return (
                  <button
                    key={userType.id}
                    onClick={() => setSelectedUserType(userType.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${colors.bg} ${colors.border} ${colors.hover} hover:shadow-md`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${colors.text}`}>{userType.label}</p>
                        <p className="text-xs text-gray-500">{userType.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <>
              {/* Seçilen Tip Gösterimi */}
              <div className="mb-6">
                {(() => {
                  const selectedConfig = userTypes.find(ut => ut.id === selectedUserType)
                  if (!selectedConfig) return null
                  const Icon = selectedConfig.icon
                  const colors = getColorClasses(selectedConfig.color)
                  return (
                    <div className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colors.bg}`}>
                            <Icon className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <div>
                            <p className={`font-semibold ${colors.text}`}>{selectedConfig.label}</p>
                            <p className="text-xs text-gray-500">{selectedConfig.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedUserType(null)
                            setEmail('')
                            setPassword('')
                            setError('')
                          }}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          Değiştir
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <span className="font-medium text-sm">{error}</span>
                  </div>
                )}
                
                <div className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Şifre
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Giriş yapılıyor...
                    </span>
                  ) : (
                    'Giriş Yap'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
