'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface LoginLayoutProps {
  title: string
  description?: string
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading?: boolean
  error?: string
  showRememberMe?: boolean
  showForgotPassword?: boolean
  debugInfo?: any
  showDebugButton?: boolean
}

export function LoginLayout({
  title,
  description,
  onSubmit,
  isLoading = false,
  error,
  showRememberMe = false,
  showForgotPassword = false,
  debugInfo,
  showDebugButton = false,
}: LoginLayoutProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-3">
              <img 
                src="/arhaval-logo.png?v=5" 
                alt="Arhaval Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<span class="text-slate-900 dark:text-slate-100 font-bold text-2xl">A</span>'
                  }
                }}
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Giriş Yap</CardTitle>
              <CardDescription>
                Hesabınıza erişmek için bilgilerinizi girin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                    {debugInfo && showDebugButton && (
                      <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300">
                        <p className="font-semibold mb-2">Debug Bilgisi:</p>
                        <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Şifre
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {(showRememberMe || showForgotPassword) && (
                  <div className="flex items-center justify-between text-sm">
                    {showRememberMe && (
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span className="text-slate-600 dark:text-slate-400">Beni hatırla</span>
                      </label>
                    )}
                    {showForgotPassword && (
                      <a
                        href="#"
                        className="text-primary hover:underline"
                        onClick={(e) => {
                          e.preventDefault()
                          // TODO: Implement forgot password
                        }}
                      >
                        Şifremi unuttum
                      </a>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Giriş yapılıyor...
                    </>
                  ) : (
                    'Giriş Yap'
                  )}
                </Button>

                {showDebugButton && debugInfo && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 text-xs"
                    onClick={async () => {
                      if (!email || !password) {
                        alert('Lütfen email ve şifre girin')
                        return
                      }
                      try {
                        // This will be handled by parent component
                        console.log('Debug button clicked')
                      } catch (err) {
                        console.error('Debug failed:', err)
                      }
                    }}
                  >
                    Test Et (Debug)
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <a
              href="/login-selection"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:underline"
            >
              ← Farklı bir hesap türü seç
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/[0.05] bg-[size:20px_20px]" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20">
              <img 
                src="/arhaval-logo.png?v=5" 
                alt="Arhaval Logo" 
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<span class="text-white font-bold text-4xl">A</span>'
                  }
                }}
              />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4 text-center">
            Arhaval Denetim Merkezi
          </h2>
          <p className="text-lg text-blue-100 text-center max-w-md">
            Profesyonel içerik ve yayın yönetim platformu
          </p>
        </div>
      </div>
    </div>
  )
}

