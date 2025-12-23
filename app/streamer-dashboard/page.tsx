'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, Clock, Building2, Trophy, DollarSign, CheckCircle2, AlertCircle, CreditCard, Video } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { AppShell } from '@/components/shared/AppShell'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { TableSkeleton, StatCardSkeleton } from '@/components/shared/LoadingSkeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StreamerDashboardPage() {
  const router = useRouter()
  const [streamer, setStreamer] = useState<any>(null)
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    matchInfo: '',
    duration: '',
    teamName: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/streamer-auth/me')
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
      const res = await fetch(`/api/streamer/streams?streamerId=${streamerId}`)
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
      const res = await fetch('/api/streamer/payments')
      const data = await res.json()
      if (res.ok) {
        setPaymentInfo(data)
        setPaymentHistory(data.paymentHistory || [])
      }
    } catch (error) {
      console.error('Error loading payment info:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/streamer/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration) || 1,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Yayın başarıyla eklendi!')
        setShowForm(false)
        setFormData({
          date: new Date().toISOString().split('T')[0],
          matchInfo: '',
          duration: '',
          teamName: '',
        })
        if (streamer) {
          loadStreams(streamer.id)
        }
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AppShell role="streamer" user={streamer}>
        <div className="space-y-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <TableSkeleton rows={5} cols={6} />
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
          onRetry={checkAuth}
        />
      </AppShell>
    )
  }

  if (!streamer) {
    return null
  }

  return (
    <AppShell role="streamer" user={streamer}>
      <PageHeader
        title={`Hoş geldiniz, ${streamer.name}`}
        description="Yayınlarınızı ekleyin ve ödemelerinizi görüntüleyin"
        rightActions={
          !showForm ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Yayın Ekle
            </Button>
          ) : undefined
        }
      />

      {/* Ödeme Özeti */}
      {paymentInfo && (
        <div className="space-y-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Ödeme Özeti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  title="Toplam Alacak"
                  value={paymentInfo.totalDue.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                  description="Toplam ödenecek tutar"
                  icon={DollarSign}
                  iconClassName="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
                <StatCard
                  title="Ödenen"
                  value={paymentInfo.totalPaid.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                  description="Toplam ödenen tutar"
                  icon={CheckCircle2}
                  iconClassName="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                />
                <StatCard
                  title="Ödenmemiş"
                  value={paymentInfo.totalUnpaid.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                  description="Bekleyen ödeme tutarı"
                  icon={AlertCircle}
                  iconClassName="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                />
              </div>
              
              {/* Ödeme İlerleme Çubuğu */}
              {paymentInfo.totalDue > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Ödeme İlerlemesi</span>
                    <span className="text-sm font-semibold">
                      {((paymentInfo.totalPaid / paymentInfo.totalDue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${(paymentInfo.totalPaid / paymentInfo.totalDue) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>Ödenen: {paymentInfo.totalPaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</span>
                    <span>Kalan: {paymentInfo.totalUnpaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

        {/* Add Stream Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Yeni Yayın Ekle</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Tarih *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Saat (Süre) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Örn: 3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Saat cinsinden (örn: 3 saat)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Trophy className="w-4 h-4 inline mr-2" />
                    Maç İsmi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.matchInfo}
                    onChange={(e) => setFormData({ ...formData, matchInfo: e.target.value })}
                    placeholder="Örn: Sangal vs Eternal Fire"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Firma *
                  </label>
                  <select
                    required
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Sangal">Sangal</option>
                    <option value="Eternal Fire">Eternal Fire</option>
                    <option value="Arhaval">Arhaval</option>
                  </select>
                </div>
              </div>

                <div className="flex items-center justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setFormData({
                        date: new Date().toISOString().split('T')[0],
                        matchInfo: '',
                        duration: '',
                        teamName: '',
                      })
                    }}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Ödeme Geçmişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-200">
                {paymentHistory.map((payment: any) => (
                  <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {payment.status === 'paid' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : payment.status === 'unpaid' ? (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-lg font-semibold text-gray-900">
                                {payment.title || payment.description || (payment.period ? `${payment.period} ayı ödemesi` : 'Ödeme')}
                              </p>
                              {payment.source && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  payment.source === 'payout' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {payment.source === 'payout' ? 'Manuel Ödeme' : 'İş Ödemesi'}
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : payment.status === 'unpaid'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status === 'paid' ? 'Ödendi' : payment.status === 'unpaid' ? 'Ödenmedi' : 'Kısmen Ödendi'}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {format(new Date(payment.date || payment.paidAt || payment.createdAt), 'dd MMMM yyyy', { locale: tr })}
                              </span>
                              {payment.period && (
                                <>
                                  <span>•</span>
                                  <span>Dönem: {payment.period}</span>
                                </>
                              )}
                              {payment.description && payment.source !== 'payout' && (
                                <>
                                  <span>•</span>
                                  <span>{payment.description}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          payment.status === 'paid' 
                            ? 'text-green-600' 
                            : payment.status === 'unpaid'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}>
                          {payment.amount.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Streams List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="w-6 h-6 mr-2" />
              Yayınlarım ({streams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {streams.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Henüz yayın eklenmemiş</p>
                <p className="text-sm text-gray-400">Yukarıdaki "Yeni Yayın Ekle" butonuna tıklayarak ilk yayınınızı ekleyebilirsiniz</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Maç Bilgisi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Firma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Süre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ödeme Tutarı
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {streams.map((stream) => (
                      <tr key={stream.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(stream.date), 'dd MMM yyyy', { locale: tr })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={stream.matchInfo || ''}>
                            {stream.matchInfo || 'Yayın'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {stream.teamName ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {stream.teamName}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {stream.duration} saat
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {stream.status === 'approved' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Onaylandı
                            </span>
                          )}
                          {(!stream.status || stream.status === null) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              📋 İşleniyor
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {stream.status === 'approved' && stream.streamerEarning > 0 ? (
                            <span className="text-sm font-bold text-green-600">
                              {stream.streamerEarning.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          ) : stream.status === 'approved' ? (
                            <span className="text-xs text-orange-600 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Maliyet girilmemiş
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
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
    </AppShell>
  )
}

