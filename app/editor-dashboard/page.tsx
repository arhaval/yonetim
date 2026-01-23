'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, DollarSign, CheckCircle2, Clock, Film, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { AppShell } from '@/components/shared/AppShell'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface Work {
  id: string
  title: string
  editPrice: number
  editPaid: boolean
  status: string
  createdAt: string
}

export default function EditorDashboardPage() {
  const router = useRouter()
  const [editor, setEditor] = useState<any>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)

  const totalEarnings = works.reduce((sum, work) => sum + (work.editPrice || 0), 0)
  const paidEarnings = works.filter(w => w.editPaid).reduce((sum, work) => sum + (work.editPrice || 0), 0)
  const pendingEarnings = totalEarnings - paidEarnings

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/team-auth/me')
      const data = await res.json()

      if (!data.teamMember) {
        router.push('/team-login')
        return
      }

      setEditor(data.teamMember)
      loadWorks(data.teamMember.id)
    } catch (error) {
      toast.error('Oturum bilgileri yüklenemedi')
      router.push('/team-login')
    }
  }

  const loadWorks = async (editorId: string) => {
    try {
      const res = await fetch(`/api/team/${editorId}/tasks`)
      const data = await res.json()
      if (res.ok) {
        setWorks(data)
      }
    } catch (error) {
      console.error('Error loading works:', error)
      toast.error('İş kayıtları yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppShell role="team" user={editor}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AppShell>
    )
  }

  const completedWorks = works.filter((w: any) => w.status === 'COMPLETED' || w.status === 'APPROVED').length
  const pendingWorks = works.filter((w: any) => w.status === 'PENDING' || w.status === 'IN_PROGRESS').length

  return (
    <AppShell role="team" user={editor}>
      <PageHeader
        title={`Hoş geldiniz, ${editor.name}`}
        description="Kurgu ve kazanç bilgilerinizi buradan takip edebilirsiniz"
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
          value={completedWorks.toString()}
          icon={Film}
        />
      </div>

      {/* Son İşler */}
      <Card>
        <CardHeader>
          <CardTitle>Son Kurgularım</CardTitle>
        </CardHeader>
        <CardContent>
          {works.length === 0 ? (
            <div className="text-center py-12">
              <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz iş kaydı bulunmuyor</p>
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
                  {works.slice(0, 10).map((work: any) => (
                    <tr key={work.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(work.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </td>
                      <td className="py-3 px-4 text-sm">{work.title || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            work.status === 'COMPLETED' || work.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : work.status === 'PENDING' || work.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {work.status === 'COMPLETED' ? 'Tamamlandı' :
                           work.status === 'APPROVED' ? 'Onaylandı' :
                           work.status === 'PENDING' ? 'Beklemede' :
                           work.status === 'IN_PROGRESS' ? 'Devam Ediyor' : work.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium">
                        {work.editPrice ? `₺${work.editPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {work.editPaid ? (
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
      {works.filter((w: any) => w.editPaid).length > 0 && (
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
                  {works
                    .filter((w: any) => w.editPaid)
                    .slice(0, 10)
                    .map((work: any) => (
                      <tr key={work.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(work.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="py-3 px-4 text-sm">{work.title || '-'}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                          ₺{work.editPrice.toFixed(2)}
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
