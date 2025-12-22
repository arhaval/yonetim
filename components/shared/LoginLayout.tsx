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
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-subtle dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 mb-6 flex items-center justify-center bg-card rounded-2xl shadow-large border border-border p-4">
              <img 
                src="/arhaval-logo.png?v=5" 
                alt="Arhaval Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<span class="text-foreground font-bold text-3xl">A</span>'
                  }
                }}
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-base text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          <Card className="border-border shadow-large">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Giriş Yap</CardTitle>
              <CardDescription className="text-base">
                Hesabınıza erişmek için bilgilerinizi girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                    {debugInfo && showDebugButton && (
                      <div className="mt-3 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                        <p className="font-semibold mb-2">Debug Bilgisi:</p>
                        <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground">
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
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-foreground">
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
                      className="h-12 pr-12 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
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
                  className="w-full h-12 text-base font-semibold shadow-medium hover:shadow-large"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:24px_24px]" />
        <div className="relative z-10 flex flex-col items-center justify-center p-16 text-white">
          <div className="mb-10">
            <div className="w-36 h-36 mx-auto bg-white/15 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-large">
              <img 
                src="/arhaval-logo.png?v=5" 
                alt="Arhaval Logo" 
                className="w-28 h-28 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<span class="text-white font-bold text-5xl">A</span>'
                  }
                }}
              />
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-6 text-center tracking-tight">
            Arhaval Denetim Merkezi
          </h2>
          <p className="text-xl text-white/90 text-center max-w-md leading-relaxed">
            Profesyonel içerik ve yayın yönetim platformu
          </p>
        </div>
      </div>
    </div>
  )
}

