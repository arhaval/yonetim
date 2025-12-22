'use client'

import { useState, useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, LogOut, User, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getNavByRole, NavSection } from '@/config/nav'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type UserRole = 'admin' | 'streamer' | 'creator' | 'voiceActor' | 'team'

interface AppShellProps {
  children: ReactNode
  role: UserRole
  user?: {
    id: string
    name?: string
    email?: string
    profilePhoto?: string
  }
  onLogout?: () => void
}

const authEndpoints: Record<UserRole, string> = {
  admin: '/api/auth/me',
  streamer: '/api/streamer-auth/me',
  creator: '/api/creator-auth/me',
  voiceActor: '/api/voice-actor-auth/me',
  team: '/api/team-auth/me',
}

const logoutEndpoints: Record<UserRole, string> = {
  admin: '/api/auth/logout',
  streamer: '/api/streamer-auth/logout',
  creator: '/api/creator-auth/logout',
  voiceActor: '/api/voice-actor-auth/logout',
  team: '/api/team-auth/logout',
}

const loginRoutes: Record<UserRole, string> = {
  admin: '/admin-login',
  streamer: '/streamer-login',
  creator: '/creator-login',
  voiceActor: '/voice-actor-login',
  team: '/team-login',
}

export function AppShell({ children, role, user: initialUser, onLogout }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(initialUser)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navSections = getNavByRole(role)

  useEffect(() => {
    // Fetch user if not provided
    if (!user) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      fetch(authEndpoints[role], { signal: controller.signal })
        .then(res => {
          clearTimeout(timeoutId)
          if (!res.ok) return { [role === 'admin' ? 'user' : role]: null }
          return res.json()
        })
        .then(data => {
          const userData = data.user || data.streamer || data.creator || data.voiceActor || data.teamMember
          if (!userData) {
            router.push(loginRoutes[role])
            return
          }
          setUser(userData)
        })
        .catch(error => {
          clearTimeout(timeoutId)
          if (error.name !== 'AbortError') {
            console.error('Error fetching user:', error)
          }
          router.push(loginRoutes[role])
        })
    }
  }, [role, user, router])

  const handleLogout = async () => {
    try {
      await fetch(logoutEndpoints[role], { method: 'POST' })
      if (onLogout) {
        onLogout()
      }
      router.push(loginRoutes[role])
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      router.push(loginRoutes[role])
    }
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle>Menü</SheetTitle>
                </SheetHeader>
                <SidebarContent
                  navSections={navSections}
                  isActive={isActive}
                  onLinkClick={() => setMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <img 
                  src="/arhaval-logo.png?v=5" 
                  alt="Logo" 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<span class="text-white text-xs font-bold">A</span>'
                    }
                  }}
                />
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Arhaval</span>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            'hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-40',
            'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800'
          )}
        >
          <div className="flex flex-col flex-1 min-h-0">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <img 
                  src="/arhaval-logo.png?v=5" 
                  alt="Logo" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<span class="text-white text-xs font-bold">A</span>'
                    }
                  }}
                />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-slate-100">Arhaval</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <SidebarContent navSections={navSections} isActive={isActive} />
            </nav>

            {/* User Section */}
            {user && (
              <div className="border-t border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {user.name || 'Kullanıcı'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış Yap
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          {/* Desktop Topbar */}
          <div className="hidden lg:block sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {user.name || 'Kullanıcı'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

function SidebarContent({
  navSections,
  isActive,
  onLinkClick,
}: {
  navSections: NavSection[]
  isActive: (href: string) => boolean
  onLinkClick?: () => void
}) {
  return (
    <div className="space-y-6">
      {navSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.title && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {section.title}
            </h3>
          )}
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className={cn('h-5 w-5', active ? 'text-blue-600 dark:text-blue-400' : '')} />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="h-4 w-4" />}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

