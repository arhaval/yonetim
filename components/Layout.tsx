'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Home, Users, Video, DollarSign, UserCheck, BarChart3, LogOut, Share2, Menu, X, ChevronRight, Mic, FileText, UserCircle, CheckCircle } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Yayınlar', href: '/streams', icon: Video },
  { name: 'İçerikler', href: '/content', icon: Video },
  { name: 'Seslendirme Metinleri', href: '/voiceover-scripts', icon: FileText },
  { name: 'Ödeme Onay', href: '/payment-approval', icon: CheckCircle },
  { name: 'Finansal', href: '/financial', icon: DollarSign },
  { name: 'Ekip', href: '/team', icon: UserCheck },
  { name: 'Yapılacaklar', href: '/todos', icon: FileText },
  { name: 'Sosyal Medya', href: '/social-media', icon: Share2 },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    // Optimized fetch with cache and shorter timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 saniye timeout (optimized)
    
    // Use cache for better performance
    fetch('/api/auth/me', { 
      signal: controller.signal,
      cache: 'default', // Browser cache
      next: { revalidate: 60 } // Revalidate every 60 seconds
    })
      .then(res => {
        clearTimeout(timeoutId)
        if (!res.ok) {
          return { user: null }
        }
        return res.json()
      })
      .then(data => setUser(data.user))
      .catch(error => {
        clearTimeout(timeoutId)
        if (error.name !== 'AbortError') {
          // Silent fail for better UX
          setUser(null)
        }
      })
  }, [])

  useEffect(() => {
    // Desktop'ta sidebar varsayılan olarak açık
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])

  // Pathname değiştiğinde navigation state'ini sıfırla
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex bg-gradient-bg">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out ${
          sidebarOpen && mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          !sidebarOpen ? 'lg:w-28' : 'lg:w-72'
        } w-72 shadow-xl-enhanced border-r border-slate-700/30`}
        style={{ 
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Header - Enhanced */}
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 transition-all duration-300 ${!sidebarOpen && 'lg:justify-center'}`}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-glow flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden p-2.5 relative ring-2 ring-blue-400/30">
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
                        target.parentElement.innerHTML = '<span class="text-white font-bold text-xl">A</span>'
                        target.parentElement.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      }
                    }}
                  />
                </div>
                {sidebarOpen && (
                  <div className="lg:block hidden">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                      Arhaval
                    </h1>
                    <p className="text-sm text-slate-400 font-medium">Denetim Merkezi</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(!sidebarOpen)
                  setMobileMenuOpen(false)
                }}
                className="lg:flex hidden items-center justify-center w-8 h-8 rounded-xl bg-slate-700/60 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-slate-700/60 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation - Enhanced */}
          <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    if (!isActive) {
                      setIsNavigating(true)
                    }
                  }}
                  className={`group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-glow scale-[1.02]'
                      : 'text-gray-400 hover:bg-slate-700/60 hover:text-white hover:scale-[1.01]'
                  } ${isNavigating && !isActive ? 'opacity-70' : ''}`}
                  style={isActive ? { 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)'
                  } : {}}
                >
                  <div className={`flex items-center w-full ${!sidebarOpen && 'lg:justify-center lg:w-full'}`}>
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-white group-hover:scale-110'}`} />
                    {sidebarOpen && (
                      <span className={`ml-3 font-semibold text-base transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-300'}`}>{item.name}</span>
                    )}
                    {isActive && sidebarOpen && (
                      <ChevronRight className="w-4 h-4 ml-auto animate-pulse" />
                    )}
                  </div>
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800/95 backdrop-blur-md text-white text-xs font-semibold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl-enhanced border border-slate-700/50 z-50">
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800/95" />
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section - Enhanced */}
          <div className="p-6 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent">
            {user && (
              <div className={`flex items-center mb-4 ${!sidebarOpen && 'lg:justify-center'}`}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-glow ring-2 ring-blue-400/30">
                  <span className="text-white text-lg font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                {sidebarOpen && (
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-base font-bold text-white truncate">{user.name}</p>
                    <p className="text-sm text-slate-400 font-medium truncate">Yönetici</p>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-xl text-white text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                !sidebarOpen && 'lg:px-3'
              }`}
              style={{ 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="ml-2">Çıkış Yap</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation Loading Indicator - Minimal */}
        {isNavigating && (
          <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-200">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse transition-all duration-200" style={{ width: '40%' }} />
          </div>
        )}

        {/* Top Bar - Enhanced */}
        <header className="sticky top-0 z-30 glass-effect border-b border-gray-200/50 shadow-medium">
          <div className="px-6 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between h-20">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-1 lg:ml-0 ml-4">
                <h2 className="text-2xl font-bold gradient-text">
                  {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                {/* Logo - Sağ tarafta */}
                <div className="hidden sm:flex items-center">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-all duration-200">
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
                </div>
                {user && (
                  <div className="hidden sm:flex items-center space-x-3 px-4 py-2 rounded-xl border-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-md ring-2 ring-blue-400/30">
                      <span className="text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-base font-bold text-gray-800">{user.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Enhanced */}
        <main className="flex-1 overflow-y-auto bg-gradient-bg">
          <div className="max-w-7xl mx-auto py-8 px-6 sm:px-8 lg:px-10">
            <div className="fade-in scale-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
