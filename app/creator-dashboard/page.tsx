'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, DollarSign, CheckCircle2, Clock, FileText, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { AppShell } from '@/components/shared/AppShell'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function CreatorDashboardPage() {
  const router = useRouter()
  const [creator, setCreator] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/creator-auth/me')
      const data = await res.json()

      if (!data.creator) {
        router.push('/creator-login')
        return
      }

      setCreator(data.creator)
      loadContents(data.creator.id)
    } catch (error) {
      router.push('/creator-login')
    }
  }

  const loadContents = async (creatorId: string) => {
    try {
      const res = await fetch('/api/creator/content')
      const data = await res.json()
      if (res.ok) {
        setContents(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading contents:', error)
      setContents([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppShell role="creator" user={creator}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AppShell>
    )
  }

  const completedContents = contents.filter((c: any) => c.status === 'COMPLETED' || c.status === 'PUBLISHED').length
  const pendingContents = contents.filter((c: any) => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length
  const paidEarnings = contents
    .filter((c: any) => c.creatorPaid)
    .reduce((sum: number, c: any) => sum + (c.creatorEarning || 0), 0)
  const totalEarnings = paidEarnings // Sadece ödenenler
  const pendingEarnings = contents
    .filter((c: any) => !c.creatorPaid)
    .reduce((sum: number, c: any) => sum + (c.creatorEarning || 0), 0)

  return (
    <AppShell role="creator" user={creator}>
      <PageHeader
        title={`Hoş geldiniz, ${creator.name}`}
        description="İçerik ve kazanç bilgilerinizi buradan takip edebilirsiniz"
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
          title="Tamamlanan İçerik"
          value={completedContents.toString()}
          icon={FileText}
        />
      </div>

      {/* Son İçerikler */}
      <Card>
        <CardHeader>
          <CardTitle>Son İçeriklerim</CardTitle>
        </CardHeader>
        <CardContent>
          {contents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz içerik kaydı bulunmuyor</p>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Platform</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Durum</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Kazanç</th>
                  </tr>
                </thead>
                <tbody>
                  {contents.slice(0, 10).map((content: any) => (
                    <tr key={content.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(content.publishDate || content.createdAt), 'dd MMM yyyy', { locale: tr })}
                      </td>
                      <td className="py-3 px-4 text-sm">{content.title || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        {content.platform === 'YOUTUBE' ? '📺 YouTube' : 
                         content.platform === 'INSTAGRAM' ? '📷 Instagram' :
                         content.platform === 'TIKTOK' ? '🎵 TikTok' :
                         content.platform === 'TWITTER' ? '🐦 Twitter' : content.platform}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            content.status === 'COMPLETED' || content.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : content.status === 'PENDING' || content.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {content.status === 'COMPLETED' ? 'Tamamlandı' :
                           content.status === 'PUBLISHED' ? 'Yayınlandı' :
                           content.status === 'PENDING' ? 'Beklemede' :
                           content.status === 'IN_PROGRESS' ? 'Devam Ediyor' : content.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium">
                        {content.creatorEarning ? `₺${content.creatorEarning.toFixed(2)}` : '-'}
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
      {contents.filter((c: any) => c.creatorPaid).length > 0 && (
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
                    <th className="text-left py-3 px-4 font-medium text-gray-700">İçerik</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Tutar</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {contents
                    .filter((c: any) => c.creatorPaid)
                    .slice(0, 10)
                    .map((content: any) => (
                      <tr key={content.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(content.publishDate || content.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="py-3 px-4 text-sm">{content.title || '-'}</td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                          ₺{content.creatorEarning.toFixed(2)}
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
