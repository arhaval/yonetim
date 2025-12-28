'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { LogOut, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type UserRole = 'admin' | 'voice-actor' | 'creator' | null

interface RoleAwareLayoutProps {
  children: React.ReactNode
  backUrl?: string
  backLabel?: string
}

export default function RoleAwareLayout({ children, backUrl, backLabel }: RoleAwareLayoutProps) {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkRole = async () => {
      // Cookie'lerden role'ü kontrol et
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
        return null
      }

      const userId = getCookie('user-id')
      const userRole = getCookie('user-role')
      const voiceActorId = getCookie('voice-actor-id')
      const creatorId = getCookie('creator-id')

      // Admin kontrolü
      if (userId && (userRole === 'admin' || userRole === 'ADMIN')) {
        try {
          const res = await fetch('/api/auth/me', { cache: 'no-store' })
          const data = await res.json()
          if (data.user) {
            setRole('admin')
            setUser(data.user)
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Error fetching admin user:', error)
        }
      }

      // Seslendirmen kontrolü
      if (voiceActorId) {
        try {
          const res = await fetch('/api/voice-actor-auth/me', { cache: 'no-store' })
          const data = await res.json()
          if (data.voiceActor) {
            setRole('voice-actor')
            setUser(data.voiceActor)
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Error fetching voice actor:', error)
        }
      }

      // Creator kontrolü
      if (creatorId) {
        try {
          const res = await fetch('/api/creator-auth/me', { cache: 'no-store' })
          const data = await res.json()
          if (data.creator) {
            setRole('creator')
            setUser(data.creator)
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Error fetching creator:', error)
        }
      }

      setLoading(false)
    }

    checkRole()
  }, [])

  const handleLogout = async () => {
    if (role === 'admin') {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login-selection')
    } else if (role === 'voice-actor') {
      await fetch('/api/voice-actor-auth/logout', { method: 'POST' })
      router.push('/voice-actor-login')
    } else if (role === 'creator') {
      await fetch('/api/creator-auth/logout', { method: 'POST' })
      router.push('/creator-login')
    }
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

  // Admin için Layout component'i kullan
  if (role === 'admin') {
    return <Layout>{children}</Layout>
  }

  // Seslendirmen için özel layout
  if (role === 'voice-actor' && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {backUrl && (
                  <Link
                    href={backUrl}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {backLabel || 'Geri Dön'}
                  </Link>
                )}
                <div className="flex items-center space-x-4 ml-4">
                  {user.profilePhoto ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-pink-200">
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg ring-2 ring-pink-200">
                      <span className="text-white font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase() || 'V'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {user.name}
                    </h1>
                    <p className="text-sm text-gray-600">Seslendirmen</p>
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
          {children}
        </div>
      </div>
    )
  }

  // Creator için özel layout
  if (role === 'creator' && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {backUrl && (
                  <Link
                    href={backUrl}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {backLabel || 'Geri Dön'}
                  </Link>
                )}
                <div className="flex items-center space-x-4 ml-4">
                  {user.profilePhoto ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-indigo-200">
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-indigo-200">
                      <span className="text-white font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {user.name}
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
          {children}
        </div>
      </div>
    )
  }

  // Role bulunamadıysa veya geçersizse
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <p className="text-gray-600">Yetkisiz erişim</p>
      </div>
    </div>
  )
}

