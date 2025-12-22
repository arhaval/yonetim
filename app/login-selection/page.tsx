'use client'

import Link from 'next/link'
import { Video, Mic, FileText, Users, Shield, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const roles = [
  {
    id: 'admin',
    title: 'Admin',
    description: 'Sistem yönetimi ve tüm panellere erişim',
    href: '/admin-login',
    icon: Shield,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    darkBgGradient: 'from-purple-950/20 to-pink-950/20',
  },
  {
    id: 'streamer',
    title: 'Yayıncı',
    description: 'Yayınlarınızı ekleyin ve ödemelerinizi görüntüleyin',
    href: '/streamer-login',
    icon: Video,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    darkBgGradient: 'from-blue-950/20 to-cyan-950/20',
  },
  {
    id: 'creator',
    title: 'İçerik Üreticisi',
    description: 'Metinlerinizi gönderin ve takip edin',
    href: '/creator-login',
    icon: FileText,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50',
    darkBgGradient: 'from-green-950/20 to-emerald-950/20',
  },
  {
    id: 'voiceActor',
    title: 'Seslendirmen',
    description: 'Gelen işleri görüntüleyin ve teslim edin',
    href: '/voice-actor-login',
    icon: Mic,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-50 to-red-50',
    darkBgGradient: 'from-orange-950/20 to-red-950/20',
  },
  {
    id: 'team',
    title: 'Ekip Üyesi',
    description: 'Ödemelerinizi ve görevlerinizi görüntüleyin',
    href: '/team-login',
    icon: Users,
    gradient: 'from-indigo-500 to-purple-500',
    bgGradient: 'from-indigo-50 to-purple-50',
    darkBgGradient: 'from-indigo-950/20 to-purple-950/20',
  },
]

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-subtle dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="mx-auto w-28 h-28 mb-8 flex items-center justify-center bg-card rounded-3xl shadow-large border border-border p-5">
            <img 
              src="/arhaval-logo.png?v=5" 
              alt="Arhaval Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                if (target.parentElement) {
                  target.parentElement.innerHTML = '<span class="text-foreground font-bold text-4xl">A</span>'
                }
              }}
            />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-4">
            Arhaval Denetim Merkezi
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hesap türünüzü seçerek giriş yapın
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <Link key={role.id} href={role.href}>
                <Card className="group h-full card-hover border-border cursor-pointer">
                  <CardContent className="p-8">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 shadow-medium group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                      {role.description}
                    </p>
                    <div className="flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      <span>Giriş Yap</span>
                      <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-base text-muted-foreground">
            Sorun mu yaşıyorsunuz?{' '}
            <a href="#" className="text-primary font-semibold hover:underline transition-colors">
              Destek alın
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
