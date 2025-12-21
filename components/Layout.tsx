'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Home, Users, Video, DollarSign, UserCheck, BarChart3, LogOut, Share2, Menu, X, ChevronRight, Mic, FileText, UserCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Yayıncılar', href: '/streamers', icon: Users },
  { name: 'Yayınlar', href: '/streams', icon: Video },
  { name: 'Onay Bekleyen Yayınlar', href: '/streams/pending', icon: Video },
  { name: 'İçerikler', href: '/content', icon: Video },
  { name: 'İçerik Üreticileri', href: '/content-creators', icon: UserCircle },
  { name: 'Seslendirme Metinleri', href: '/voiceover-scripts', icon: FileText },
  { name: 'Ödemeler', href: '/payments', icon: DollarSign },
  { name: 'Finansal', href: '/financial', icon: DollarSign },
  { name: 'Ekip', href: '/team', icon: UserCheck },
  { name: 'Raporlar', href: '/reports', icon: BarChart3 },
  { name: 'Sosyal Medya', href: '/social-media', icon: Share2 },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Timeout ile fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 saniye timeout
    
    fetch('/api/auth/me', { signal: controller.signal })
      .then(res => {
        clearTimeout(timeoutId)
        if (!res.ok) {
          console.error('Failed to fetch user:', res.status)
          return { user: null }
        }
        return res.json()
      })
      .then(data => setUser(data.user))
      .catch(error => {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          console.warn('User fetch timeout')
        } else {
          console.error('Error fetching user:', error)
        }
        setUser(null)
      })
  }, [])

  useEffect(() => {
    // Desktop'ta sidebar varsayılan olarak açık
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f8fafc' }}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out ${
          sidebarOpen && mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          !sidebarOpen ? 'lg:w-28' : 'lg:w-72'
        } w-72 shadow-2xl border-r border-slate-700/20`}
        style={{ backgroundColor: '#1e293b' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Header - Büyütülmüş */}
          <div className="p-5 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 transition-all duration-300 ${!sidebarOpen && 'lg:justify-center'}`}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 bg-white overflow-hidden p-2 relative">
                  <Image
                    src="/arhaval-logo.svg"
                    alt="Arhaval Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                    priority
                    unoptimized={true}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<span class="text-white font-bold text-lg">A</span>'
                        target.parentElement.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      }
                    }}
                  />
                </div>
                {sidebarOpen && (
                  <div className="lg:block hidden">
                    <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                      Arhaval
                    </h1>
                    <p className="text-sm text-slate-400">Denetim Merkezi</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(!sidebarOpen)
                  setMobileMenuOpen(false)
                }}
                className="lg:flex hidden items-center justify-center w-7 h-7 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                {sidebarOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation - Büyütülmüş */}
          <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group relative flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                  style={isActive ? { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' } : {}}
                >
                  <div className={`flex items-center ${!sidebarOpen && 'lg:justify-center lg:w-full'}`}>
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    {sidebarOpen && (
                      <span className="ml-3 font-medium text-base">{item.name}</span>
                    )}
                    {isActive && sidebarOpen && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </div>
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg border border-slate-700 z-50">
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section - Büyütülmüş */}
          <div className="p-5 border-t border-slate-700/50">
            {user && (
              <div className={`flex items-center ${!sidebarOpen && 'lg:justify-center'}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white text-base font-medium">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                {sidebarOpen && (
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-base font-medium text-white truncate">{user.name}</p>
                    <p className="text-sm text-slate-400 truncate">Yönetici</p>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`mt-4 w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-white text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                !sidebarOpen && 'lg:px-2'
              }`}
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}
            >
              <LogOut className="w-4 h-4" />
              {sidebarOpen && <span className="ml-2">Çıkış Yap</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar - Büyütülmüş */}
        <header className="sticky top-0 z-30 backdrop-blur-lg border-b shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#1e293b' + '20' }}>
          <div className="px-5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-1 lg:ml-0 ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                {/* Logo - Sağ tarafta */}
                <div className="hidden sm:flex items-center">
                  <Image
                    src="/arhaval-logo.svg"
                    alt="Arhaval Logo"
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                    priority
                    unoptimized={true}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
                {user && (
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md border" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6' + '40' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-base font-medium text-gray-700">{user.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Büyütülmüş */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#f8fafc' }}>
          <div className="max-w-7xl mx-auto py-6 px-5 sm:px-6 lg:px-8">
            <div className="fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
