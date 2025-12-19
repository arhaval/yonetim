'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, LogOut, Calendar, Clock, Building2, Trophy, DollarSign, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

export default function StreamerDashboardPage() {
  const router = useRouter()
  const [streamer, setStreamer] = useState<any>(null)
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
      router.push('/streamer-login')
    }
  }

  const loadStreams = async (streamerId: string) => {
    try {
      const res = await fetch(`/api/streamer/streams?streamerId=${streamerId}`)
      const data = await res.json()
      if (res.ok) {
        setStreams(data)
      }
    } catch (error) {
      console.error('Error loading streams:', error)
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

  const handleLogout = async () => {
    await fetch('/api/streamer-auth/logout', { method: 'POST' })
    router.push('/streamer-login')
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!streamer) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 bg-white overflow-hidden p-2">
                <img 
                  src="/arhaval-logo.png" 
                  alt="Arhaval Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<span class="text-gray-900 font-bold text-xl">A</span>'
                      target.parentElement.style.background = 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)'
                    }
                  }}
                />
              </div>
              {streamer.profilePhoto ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-2 ring-indigo-200">
                  <img
                    src={streamer.profilePhoto}
                    alt={streamer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-indigo-200">
                  <span className="text-white font-bold text-2xl">
                    {streamer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {streamer.name}
                </h1>
                <p className="mt-1 text-gray-600">Yayınlarınızı buradan ekleyebilirsiniz</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Ödeme Özeti */}
        {paymentInfo && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                Ödeme Özeti
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Toplam Alacak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paymentInfo.totalDue.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Toplam ödenecek tutar</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ödenen</p>
                <p className="text-2xl font-bold text-green-600">
                  {paymentInfo.totalPaid.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Toplam ödenen tutar</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ödenmemiş</p>
                <p className="text-2xl font-bold text-red-600">
                  {paymentInfo.totalUnpaid.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-2">Bekleyen ödeme tutarı</p>
              </div>
            </div>
            
            {/* Ödeme İlerleme Çubuğu */}
            {paymentInfo.totalDue > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Ödeme İlerlemesi</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {((paymentInfo.totalPaid / paymentInfo.totalDue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${(paymentInfo.totalPaid / paymentInfo.totalDue) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Ödenen: {paymentInfo.totalPaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</span>
                  <span>Kalan: {paymentInfo.totalUnpaid.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Stream Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Yayın Ekle
            </button>
          </div>
        )}

        {/* Add Stream Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni Yayın Ekle</h2>
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
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      date: new Date().toISOString().split('T')[0],
                      matchInfo: '',
                      duration: '',
                      teamName: '',
                    })
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                Ödeme Geçmişi
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold text-gray-900">
                              {payment.description || `${payment.period} ayı ödemesi`}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Ödendi
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {format(new Date(payment.paidAt), 'dd MMMM yyyy', { locale: tr })}
                            </span>
                            {payment.period && (
                              <>
                                <span>•</span>
                                <span>Dönem: {payment.period}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
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
          </div>
        )}

        {/* Streams List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Video className="w-6 h-6 mr-2 text-indigo-600" />
              Yayınlarım ({streams.length})
            </h2>
          </div>
          <div className="p-6">
            {streams.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Henüz yayın eklenmemiş</p>
                <p className="text-sm text-gray-400">Yukarıdaki "Yeni Yayın Ekle" butonuna tıklayarak ilk yayınınızı ekleyebilirsiniz</p>
              </div>
            ) : (
              <div className="space-y-4">
                {streams.map((stream) => (
                  <div
                    key={stream.id}
                    className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-5 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Başlık ve Durum */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {stream.matchInfo || 'Yayın'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {stream.status === 'pending' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  ⏳ Onay Bekleniyor
                                </span>
                              )}
                              {stream.status === 'approved' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                  ✅ Onaylandı
                                </span>
                              )}
                              {(!stream.status || stream.status === null) && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                                  📋 İşleniyor
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Detaylar */}
                        <div className="ml-14 space-y-2">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center font-medium">
                              <Calendar className="w-4 h-4 mr-1.5" />
                              {format(new Date(stream.date), 'dd MMMM yyyy', { locale: tr })}
                            </span>
                            <span className="flex items-center font-medium">
                              <Clock className="w-4 h-4 mr-1.5" />
                              {stream.duration} saat
                            </span>
                            {stream.teamName && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                {stream.teamName}
                              </span>
                            )}
                          </div>

                          {/* Ödeme Bilgisi */}
                          {stream.status === 'approved' && stream.streamerEarning > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Ödeme Tutarı:</span>
                                <span className="text-lg font-bold text-green-600">
                                  {stream.streamerEarning.toLocaleString('tr-TR', {
                                    style: 'currency',
                                    currency: 'TRY',
                                    maximumFractionDigits: 0,
                                  })}
                                </span>
                              </div>
                            </div>
                          )}
                          {stream.status === 'approved' && stream.streamerEarning === 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-orange-600 font-medium">Maliyet henüz girilmemiş</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

