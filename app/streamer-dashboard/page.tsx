'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, DollarSign, CheckCircle2, Clock, TrendingUp, Calendar, Video } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { AppShell } from '@/components/shared/AppShell'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { TableSkeleton, StatCardSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function StreamerDashboardPage() {
  const router = useRouter()
  const [streamer, setStreamer] = useState<any>(null)
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/streamer-auth/me', { cache: 'default' })
      const data = await res.json()

      if (!data.streamer) {
        router.push('/streamer-login')
        return
      }

      setStreamer(data.streamer)
      loadStreams(data.streamer.id)
      loadPaymentInfo(data.streamer.id)
    } catch (error) {
      setError('Kullanıcı bilgileri yüklenemedi')
      setLoading(false)
    }
  }

  const loadStreams = async (streamerId: string) => {
    try {
      const res = await fetch(`/api/streamer/streams?streamerId=${streamerId}`, { cache: 'default' })
      const data = await res.json()
      if (res.ok) {
        setStreams(data)
      } else {
        setError('Yayınlar yüklenemedi')
      }
    } catch (error) {
      console.error('Error loading streams:', error)
      setError('Yayınlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const loadPaymentInfo = async (streamerId: string) => {
    try {
      const res = await fetch('/api/streamer/payments', { cache: 'default' })
      const data = await res.json()
      if (res.ok) {
        setPaymentInfo(data)
      }
    } catch (error) {
      console.error('Error loading payment info:', error)
    }
  }

  if (loading) {
    return (
      <AppShell role="streamer" user={streamer}>
        <div className="space-y-6">
          <StatCardSkeleton />
          <TableSkeleton />
        </div>
      </AppShell>
    )
  }

  if (error && !streamer) {
    return (
      <AppShell role="streamer">
        <ErrorState
          title="Bir hata oluştu"
          message={error}
          retryLabel="Tekrar Dene"
          onRetry={() => window.location.reload()}
        />
      </AppShell>
    )
  }

  const totalEarnings = paymentInfo?.totalDue || 0
  const paidEarnings = paymentInfo?.totalPaid || 0
  const pendingEarnings = paymentInfo?.totalUnpaid || 0
  const completedStreams = streams.filter((s: any) => s.paymentStatus === 'paid').length
  const pendingStreams = streams.filter((s: any) => s.paymentStatus === 'pending').length

  return (
    <AppShell role="streamer" user={streamer}>
      <PageHeader
        title={`Hoş geldiniz, ${streamer.name}`}
        description="Yayın ve kazanç bilgilerinizi buradan takip edebilirsiniz"
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
          title="Tamamlanan Yayın"
          value={completedStreams.toString()}
          icon={Video}
        />
      </div>

      {/* Son Yayınlar */}
      <Card>
        <CardHeader>
          <CardTitle>Son Yayınlarım</CardTitle>
        </CardHeader>
        <CardContent>
          {streams.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz yayın kaydı bulunmuyor</p>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Maç Bilgisi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Süre</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Durum</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Kazanç</th>
                  </tr>
                </thead>
                <tbody>
                  {streams.slice(0, 10).map((stream: any) => (
                    <tr key={stream.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(stream.date), 'dd MMM yyyy', { locale: tr })}
                      </td>
                      <td className="py-3 px-4 text-sm">{stream.matchInfo || '-'}</td>
                      <td className="py-3 px-4 text-sm">{stream.duration || '-'} saat</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            stream.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : stream.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {stream.paymentStatus === 'paid'
                            ? 'Ödendi'
                            : stream.paymentStatus === 'pending'
                            ? 'Bekliyor'
                            : stream.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium">
                        {stream.streamerEarning ? `₺${stream.streamerEarning.toFixed(2)}` : '-'}
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
      {paymentInfo?.paymentHistory && paymentInfo.paymentHistory.length > 0 && (
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
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Açıklama</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Tutar</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentInfo.paymentHistory.slice(0, 10).map((payment: any) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(payment.date), 'dd MMM yyyy', { locale: tr })}
                      </td>
                      <td className="py-3 px-4 text-sm">{payment.description || '-'}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                        ₺{payment.amount.toFixed(2)}
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
