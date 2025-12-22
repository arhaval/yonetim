'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { DollarSign, Users, Video, CheckCircle, Clock, Calendar, X, Mic } from 'lucide-react'

type PaymentTab = 'streamers' | 'team' | 'voice-actors'

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<PaymentTab>('streamers')
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [streamerPayments, setStreamerPayments] = useState<any[]>([])
  const [teamPayments, setTeamPayments] = useState<any[]>([])
  const [voiceActorPayments, setVoiceActorPayments] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [activeTab, selectedMonth])

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = format(date, 'yyyy-MM')
      const label = format(date, 'MMMM yyyy', { locale: tr })
      options.push({ value, label })
    }
    return options
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        month: selectedMonth,
      })

      if (activeTab === 'streamers') {
        const res = await fetch(`/api/payments/streamers?${params}`)
        const data = await res.json()
        setStreamerPayments(data)
      } else if (activeTab === 'team') {
        const res = await fetch(`/api/payments/team?${params}`)
        const data = await res.json()
        setTeamPayments(data)
      } else {
        const res = await fetch(`/api/payments/voice-actors?${params}`)
        const data = await res.json()
        setVoiceActorPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNote, setPaymentNote] = useState('')
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const handleOpenPaymentModal = (payment: any, type: 'streamers' | 'team' | 'voice-actors') => {
    setSelectedPayment({ ...payment, paymentType: type })
    setPaymentAmount(payment.pendingAmount > 0 ? payment.pendingAmount.toString() : payment.amount.toString())
    setPaymentNote('')
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'))
    setShowPaymentModal(true)
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedPayment(null)
    setPaymentAmount('')
    setPaymentNote('')
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'))
  }

  const handleMakePayment = async () => {
    if (!selectedPayment) return

    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0) {
      alert('Geçerli bir tutar girin')
      return
    }

    if (selectedPayment.paymentType === 'streamers') {
      if (amount > selectedPayment.pendingAmount) {
        alert(`Ödeme tutarı bekleyen tutardan (${selectedPayment.pendingAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}) fazla olamaz`)
        return
      }
    } else if (selectedPayment.paymentType === 'voice-actors') {
      if (amount > selectedPayment.pendingAmount) {
        alert(`Ödeme tutarı bekleyen tutardan (${selectedPayment.pendingAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}) fazla olamaz`)
        return
      }
    } else {
      if (amount > selectedPayment.amount) {
        alert(`Ödeme tutarı toplam tutardan (${selectedPayment.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}) fazla olamaz`)
        return
      }
    }

    if (!confirm(`${amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} tutarında ödeme yapılacak. Devam etmek istiyor musunuz?`)) {
      return
    }

    try {
      const res = await fetch('/api/payments/make', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedPayment.paymentType,
          month: selectedMonth,
          streamerId: selectedPayment.paymentType === 'streamers' ? selectedPayment.streamerId : undefined,
          teamPaymentId: selectedPayment.paymentType === 'team' ? selectedPayment.id : undefined,
          voiceActorId: selectedPayment.paymentType === 'voice-actors' ? selectedPayment.id : undefined,
          amount: amount,
          note: paymentNote,
          paidAt: paymentDate,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Ödeme başarıyla yapıldı!')
        handleClosePaymentModal()
        fetchData()
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const handleBulkPayment = async (type: 'streamers' | 'team', items: any[]) => {
    if (!confirm(`${items.length} öğe için toplu ödeme yapılacak. Devam etmek istiyor musunuz?`)) {
      return
    }

    try {
      const res = await fetch('/api/payments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          month: selectedMonth,
          items: items.map(item => ({
            id: item.id || item.streamerId,
            amount: item.pendingAmount || item.amount,
          })),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Toplu ödeme başarıyla yapıldı!')
        fetchData()
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const totalPendingStreamers = streamerPayments
    .filter(p => p.pendingAmount > 0)
    .reduce((sum, p) => sum + p.pendingAmount, 0)

  const totalPendingTeam = teamPayments
    .filter(p => !p.paidAt)
    .reduce((sum, p) => sum + p.amount, 0)
  
  const totalPaidTeam = teamPayments
    .filter(p => p.paidAt)
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPendingVoiceActors = voiceActorPayments
    .filter(p => p.pendingAmount > 0)
    .reduce((sum, p) => sum + p.pendingAmount, 0)

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Ödeme Yönetimi
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Yayıncı ve ekip üyeleri ödemelerini yönetin
          </p>
        </div>

        {/* Month Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Ay Seçin
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {getMonthOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('streamers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'streamers'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Video className="w-4 h-4 inline mr-2" />
                Yayıncılar
                {totalPendingStreamers > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    {totalPendingStreamers.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'team'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Ekip Üyeleri
                {totalPendingTeam > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    Bekleyen: {totalPendingTeam.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                )}
                {totalPaidTeam > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Ödendi: {totalPaidTeam.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('voice-actors')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'voice-actors'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Mic className="w-4 h-4 inline mr-2" />
                Seslendirmenler
                {totalPendingVoiceActors > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    {totalPendingVoiceActors.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        ) : activeTab === 'streamers' ? (
          <div className="space-y-4">
            {streamerPayments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Bu ay için yayın bulunamadı</p>
              </div>
            ) : (
              <>
                {streamerPayments.map((payment) => (
                  <div
                    key={payment.streamerId}
                    className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {payment.streamerName}
                          </h3>
                          {payment.pendingAmount > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Ödeme Bekliyor
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ödendi
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600">Toplam Yayın</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {payment.totalStreams}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Toplam Tutar</p>
                            <p className="text-lg font-semibold text-indigo-600">
                              {payment.totalAmount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Ödenen</p>
                            <p className="text-lg font-semibold text-green-600">
                              {payment.paidAmount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Bekleyen</p>
                            <p className="text-lg font-semibold text-red-600">
                              {payment.pendingAmount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </p>
                          </div>
                        </div>
                        {/* Detaylı Yayın Listesi */}
                        {payment.streams && payment.streams.length > 0 && (
                          <div className="mt-6 border-t pt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Onaylanmış Yayınlar</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b border-border bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Tarih</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Süre</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Takım</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Maç</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Tutar</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Durum</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {payment.streams.map((stream: any) => (
                                    <tr key={stream.id} className="border-b border-border transition-colors hover:bg-muted/50">
                                      <td className="p-4 align-middle text-sm text-foreground">
                                        {format(new Date(stream.date), 'dd MMM yyyy', { locale: tr })}
                                      </td>
                                      <td className="p-4 align-middle text-sm text-muted-foreground">
                                        {stream.duration} saat
                                      </td>
                                      <td className="p-4 align-middle text-sm text-muted-foreground">
                                        {stream.teamName || '-'}
                                      </td>
                                      <td className="p-4 align-middle text-sm text-muted-foreground">
                                        {stream.matchInfo || '-'}
                                      </td>
                                      <td className="p-4 align-middle text-sm font-semibold text-primary">
                                        {stream.streamerEarning.toLocaleString('tr-TR', {
                                          style: 'currency',
                                          currency: 'TRY',
                                        })}
                                      </td>
                                      <td className="p-4 align-middle">
                                        {stream.paymentStatus === 'paid' ? (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            <CheckCircle className="w-3 h-3 mr-1.5" />
                                            Ödendi
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                            <Clock className="w-3 h-3 mr-1.5" />
                                            Bekliyor
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                      {payment.pendingAmount > 0 && (
                        <div className="ml-6">
                          <button
                            onClick={() => handleOpenPaymentModal(payment, 'streamers')}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                          >
                            <DollarSign className="w-5 h-5 inline mr-2" />
                            Ödeme Yap
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {streamerPayments.filter(p => p.pendingAmount > 0).length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => handleBulkPayment('streamers', streamerPayments.filter(p => p.pendingAmount > 0))}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                    >
                      <DollarSign className="w-5 h-5 inline mr-2" />
                      Tüm Bekleyen Ödemeleri Yap ({streamerPayments.filter(p => p.pendingAmount > 0).length} kişi)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : activeTab === 'team' ? (
          <div className="space-y-4">
            {teamPayments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Bu ay için ödeme bulunamadı</p>
              </div>
            ) : (
              <>
                {teamPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {payment.teamMemberName}
                          </h3>
                          {payment.paidAt ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ödendi
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Ödeme Bekliyor
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600">Ödeme Tipi</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {payment.type}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tutar</p>
                            <p className="text-lg font-semibold text-indigo-600">
                              {payment.amount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </p>
                          </div>
                          {payment.paidAt && (
                            <div>
                              <p className="text-sm text-gray-600">Ödeme Tarihi</p>
                              <p className="text-lg font-semibold text-green-600">
                                {format(new Date(payment.paidAt), 'dd MMMM yyyy', { locale: tr })}
                              </p>
                            </div>
                          )}
                        </div>
                        {/* Detaylı Görev Listesi */}
                        {payment.tasks && payment.tasks.length > 0 && (
                          <div className="mt-6 border-t pt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Tamamlanmış Görevler</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b border-border bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Görev</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Açıklama</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Öncelik</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Tamamlanma</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {payment.tasks.map((task: any) => (
                                    <tr key={task.id} className="border-b border-border transition-colors hover:bg-muted/50">
                                      <td className="p-4 align-middle text-sm font-medium text-foreground">
                                        {task.title}
                                      </td>
                                      <td className="p-4 align-middle text-sm text-muted-foreground">
                                        {task.description || '-'}
                                      </td>
                                      <td className="p-4 align-middle">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                          task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                          {task.priority === 'high' ? 'Yüksek' :
                                           task.priority === 'medium' ? 'Orta' : 'Düşük'}
                                        </span>
                                      </td>
                                      <td className="p-4 align-middle text-sm text-muted-foreground">
                                        {task.completedAt ? format(new Date(task.completedAt), 'dd MMM yyyy', { locale: tr }) : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                      {!payment.paidAt && (
                        <div className="ml-6">
                          <button
                            onClick={() => handleOpenPaymentModal(payment, 'team')}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                          >
                            <DollarSign className="w-5 h-5 inline mr-2" />
                            Ödeme Yap
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {teamPayments.some(p => !p.paidAt) && (
                  <div className="mt-6">
                    <button
                      onClick={() => handleBulkPayment('team', teamPayments.filter(p => !p.paidAt))}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                    >
                      <DollarSign className="w-5 h-5 inline mr-2" />
                      Tüm Bekleyen Ödemeleri Yap ({teamPayments.filter(p => !p.paidAt).length} ödeme)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : activeTab === 'voice-actors' ? (
          <div className="space-y-4">
            {voiceActorPayments.filter(p => p.pendingAmount > 0).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Bu ay için ödenmemiş ödeme bulunamadı</p>
              </div>
            ) : (
              <>
                {voiceActorPayments.filter(p => p.pendingAmount > 0).map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {payment.profilePhoto ? (
                            <img
                              src={payment.profilePhoto}
                              alt={payment.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                              <Mic className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {payment.name}
                          </h3>
                          {payment.pendingAmount > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Ödeme Bekliyor
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ödendi
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600">Toplam Metin</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {payment.totalCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Bekleyen</p>
                            <p className="text-lg font-semibold text-yellow-600">
                              {payment.pendingCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Ödenmemiş Tutar</p>
                            <p className="text-lg font-semibold text-red-600">
                              {payment.pendingAmount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Ödenen Tutar</p>
                            <p className="text-lg font-semibold text-green-600">
                              {payment.paidAmount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </p>
                          </div>
                        </div>
                        {/* Detaylı Metin Listesi */}
                        {payment.scripts && payment.scripts.length > 0 && (
                          <div className="mt-6 border-t pt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Onaylanmış Metinler</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b border-border bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Başlık</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Oluşturulma</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Tutar</th>
                                    <th className="h-12 px-4 text-left align-middle font-semibold text-sm text-muted-foreground">Durum</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {payment.scripts.map((script: any) => (
                                    <tr key={script.id} className="border-b border-border transition-colors hover:bg-muted/50">
                                      <td className="p-4 align-middle text-sm text-foreground">
                                        {script.title}
                                      </td>
                                      <td className="p-4 align-middle text-sm text-muted-foreground">
                                        {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                                      </td>
                                      <td className="p-4 align-middle text-sm font-semibold text-primary">
                                        {script.price.toLocaleString('tr-TR', {
                                          style: 'currency',
                                          currency: 'TRY',
                                        })}
                                      </td>
                                      <td className="p-4 align-middle">
                                        {script.status === 'paid' ? (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            <CheckCircle className="w-3 h-3 mr-1.5" />
                                            Ödendi
                                          </span>
                                        ) : script.status === 'approved' ? (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                            <Clock className="w-3 h-3 mr-1.5" />
                                            Bekliyor
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                                            Beklemede
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                      {payment.pendingAmount > 0 && (
                        <div className="ml-6">
                          <button
                            onClick={() => handleOpenPaymentModal(payment, 'voice-actors')}
                            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200"
                          >
                            <DollarSign className="w-5 h-5 inline mr-2" />
                            Ödeme Yap
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : null}

        {/* Payment Modal */}
        {showPaymentModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Ödeme Yap</h2>
                  <button
                    onClick={handleClosePaymentModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Kişi</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedPayment.streamerName || selectedPayment.teamMemberName || selectedPayment.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Toplam Borç</p>
                    <p className="text-lg font-semibold text-red-600">
                      {(selectedPayment.pendingAmount || selectedPayment.amount).toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </p>
                  </div>

                  {selectedPayment.paymentType === 'streamers' && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Ödenen</p>
                      <p className="text-lg font-semibold text-green-600">
                        {selectedPayment.paidAmount.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ödeme Tutarı (₺) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedPayment.pendingAmount || selectedPayment.amount}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Maksimum: {(selectedPayment.pendingAmount || selectedPayment.amount).toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Ödeme Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Not (Opsiyonel)
                    </label>
                    <textarea
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      rows={3}
                      placeholder="Ödeme notu..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                      onClick={handleClosePaymentModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleMakePayment}
                      disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ödeme Yap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

