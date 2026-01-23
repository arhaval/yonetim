'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, DollarSign, CheckCircle2, Clock, Mic, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { AppShell } from '@/components/shared/AppShell'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface VoiceoverScript {
  id: string
  title: string
  voicePrice: number
  voicePaid: boolean
  status: string
  createdAt: string
}

export default function VoiceActorDashboardPage() {
  const router = useRouter()
  const [voiceActor, setVoiceActor] = useState<any>(null)
  const [scripts, setScripts] = useState<VoiceoverScript[]>([])
  const [loading, setLoading] = useState(true)

  const totalEarnings = scripts.reduce((sum, script) => sum + (script.voicePrice || 0), 0)
  const paidEarnings = scripts.filter(s => s.voicePaid).reduce((sum, script) => sum + (script.voicePrice || 0), 0)
  const pendingEarnings = totalEarnings - paidEarnings

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/voice-actor-auth/me')
      const data = await res.json()

      if (!data.voiceActor) {
        router.push('/voice-actor-login')
        return
      }

      setVoiceActor(data.voiceActor)
      loadScripts(data.voiceActor.id)
    } catch (error) {
      toast.error('Oturum bilgileri yüklenemedi')
      router.push('/voice-actor-login')
    }
  }

  const loadScripts = async (voiceActorId: string) => {
    try {
      const res = await fetch('/api/voice-actor/scripts')
      const data = await res.json()
      if (res.ok) {
        setScripts(data)
      }
    } catch (error) {
      console.error('Error loading scripts:', error)
      toast.error('Seslendirme kayıtları yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppShell role="voiceActor" user={voiceActor}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AppShell>
    )
  }

  const completedScripts = scripts.filter((s: any) => s.status === 'COMPLETED' || s.status === 'APPROVED').length
  const pendingScripts = scripts.filter((s: any) => s.status === 'PENDING' || s.status === 'IN_PROGRESS').length

  return (
    <AppShell role="voiceActor" user={voiceActor}>
      <PageHeader
        title={`Hoş geldiniz, ${voiceActor.name}`}
        description="Seslendirme ve kazanç bilgilerinizi buradan takip edebilirsiniz"
        rightActions={
          <Button onClick={() => router.push('/request-extra-work')}>
            <Plus className="w-4 h-4 mr-2" />
            İş Talebi Oluştur
          </Button>
        }
      />

      {/* İstatistikler */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Toplam Kazanç"
          value={`₺${totalEarnings.toFixed(2)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Ödenen"
          value={`₺${paidEarnings.toFixed(2)}`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Bekleyen Ödeme"
          value={`₺${pendingEarnings.toFixed(2)}`}
          icon={Clock}
        />
        <StatCard
          title="Tamamlanan İş"
          value={completedScripts.toString()}
          icon={Mic}
        />
      </div>

      {/* Son Seslendirmeler */}
      <Card>
        <CardHeader>
          <CardTitle>Son Seslendirmelerim</CardTitle>
        </CardHeader>
        <CardContent>
          {scripts.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz seslendirme kaydı bulunmuyor</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/request-extra-work')}
              >
                İlk İş Talebini Oluştur
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tarih</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Başlık</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Durum</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Kazanç</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Ödeme</th>
                  </tr>
                </thead>
                <tbody>
                  {scripts.slice(0, 10).map((script: any) => (
                    <tr key={script.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </td>
                      <td className="py-3 px-4 text-sm">{script.title || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            script.status === 'COMPLETED' || script.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : script.status === 'PENDING' || script.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {script.status === 'COMPLETED' ? 'Tamamlandı' :
                           script.status === 'APPROVED' ? 'Onaylandı' :
                           script.status === 'PENDING' ? 'Beklemede' :
                           script.status === 'IN_PROGRESS' ? 'Devam Ediyor' : script.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium">
                        {script.voicePrice ? `₺${script.voicePrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {script.voicePaid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ödendi
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Bekliyor
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ödeme Geçmişi */}
      {scripts.filter((s: any) => s.voicePaid).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ödeme Geçmişi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Tarih</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">İş</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Tutar</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {scripts
                    .filter((s: any) => s.voicePaid)
                    .slice(0, 10)
                    .map((script: any) => (
                      <tr key={script.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="py-3 px-4 text-sm">{script.title || '-'}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                          ₺{script.voicePrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ödendi
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  )
}
