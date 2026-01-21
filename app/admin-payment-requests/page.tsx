'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Clock, CheckCircle, XCircle, DollarSign, User, FileText, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

interface PaymentRequest {
  id: string
  type: string
  amount: number
  description: string
  status: string
  adminNotes: string | null
  rejectionReason: string | null
  createdAt: string
  approvedAt: string | null
  paidAt: string | null
  attachmentUrl: string | null
  contentCreator: { id: string; name: string } | null
  voiceActor: { id: string; name: string } | null
  streamer: { id: string; name: string } | null
  teamMember: { id: string; name: string; role: string } | null
  content: { id: string; title: string; platform: string } | null
  contentRegistry: { id: string; title: string; platform: string } | null
}

export default function AdminPaymentRequestsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [filter])

  const fetchRequests = async () => {
    try {
      const url = filter === 'all' ? '/api/payment-requests' : `/api/payment-requests?status=${filter}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      toast.error('Talepler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'APPROVED' | 'REJECTED' | 'PAID') => {
    if (!selectedRequest) return

    if (action === 'REJECTED' && !rejectionReason.trim()) {
      toast.error('Lütfen red nedeni girin')
      return
    }

    if (action === 'PAID' && !confirm(`${getRequesterName(selectedRequest)} için ${selectedRequest.amount.toLocaleString('tr-TR')} TL ödeme yapılacak. Onaylıyor musunuz?`)) {
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/payment-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          adminNotes: adminNotes || null,
          rejectionReason: action === 'REJECTED' ? rejectionReason : null,
        }),
      })

      if (res.ok) {
        const actionText = action === 'APPROVED' ? 'onaylandı' : action === 'REJECTED' ? 'reddedildi' : 'ödendi'
        toast.success(`Talep ${actionText}!`)
        setShowModal(false)
        setSelectedRequest(null)
        setAdminNotes('')
        setRejectionReason('')
        fetchRequests()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const getRequesterName = (request: PaymentRequest) => {
    return (
      request.contentCreator?.name ||
      request.voiceActor?.name ||
      request.streamer?.name ||
      request.teamMember?.name ||
      'Bilinmeyen'
    )
  }

  const getRequesterType = (request: PaymentRequest) => {
    if (request.contentCreator) return 'İçerik Üreticisi'
    if (request.voiceActor) return 'Seslendirmen'
    if (request.streamer) return 'Yayıncı'
    if (request.teamMember) return request.teamMember.role === 'editor' ? 'Editör' : 'Ekip Üyesi'
    return 'Bilinmeyen'
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { label: 'Onaylandı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircle },
      PAID: { label: 'Ödendi', color: 'bg-blue-100 text-blue-800', icon: DollarSign },
    }
    const badge = badges[status] || badges.PENDING
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    )
  }

  const getTypeLabel = (type: string) => {
    const types: any = {
      CONTENT: '📝 İçerik Üretimi',
      VOICE: '🎙️ Seslendirme',
      EDIT: '🎬 Kurgu',
      STREAM: '📺 Yayın',
      DESIGN: '🎨 Tasarım',
      MANAGEMENT: '👔 Yönetim',
      OTHER: '📌 Diğer',
    }
    return types[type] || type
  }

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length
  const totalPending = requests
    .filter((r) => r.status === 'PENDING' || r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.amount, 0)

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ödeme Talepleri Yönetimi</h1>
            <p className="text-gray-600 mt-1">Ekip üyelerinin ödeme taleplerini onaylayın</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">Bekleyen Talep</p>
            <p className="text-2xl font-bold text-red-700">{pendingCount}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Talep</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{requests.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bekleyen Tutar</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {totalPending.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bekleyen Onay</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {['PENDING', 'APPROVED', 'PAID', 'REJECTED', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tümü' : status === 'PENDING' ? 'Bekleyenler' : getStatusBadge(status).props.children[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tüm talepler işlendi!</h3>
            <p className="text-gray-600">Şu anda bekleyen talep bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-indigo-200 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {getTypeLabel(request.type)}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">{getRequesterName(request)}</span>
                      <span className="text-sm text-gray-500">({getRequesterType(request)})</span>
                    </div>
                    <p className="text-gray-700 mb-3">{request.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <strong className="text-xl text-gray-900">
                          {request.amount.toLocaleString('tr-TR')} ₺
                        </strong>
                      </span>
                      <span>
                        {format(new Date(request.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </span>
                    </div>
                    {request.content && (
                      <div className="mt-2 text-sm text-gray-600">
                        İlgili Yayın: <strong>{request.content.title}</strong> ({request.content.platform})
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    {request.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowModal(true)
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium whitespace-nowrap"
                        >
                          İncele
                        </button>
                      </>
                    )}
                    {request.status === 'APPROVED' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request)
                          handleAction('PAID')
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium whitespace-nowrap"
                      >
                        Ödeme Yap
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
                <h3 className="text-xl font-bold text-gray-900">Ödeme Talebi Detayı</h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedRequest(null)
                    setAdminNotes('')
                    setRejectionReason('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Talep Eden</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {getRequesterName(selectedRequest)} ({getRequesterType(selectedRequest)})
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">İş Tipi</label>
                  <p className="text-lg font-semibold text-gray-900">{getTypeLabel(selectedRequest.type)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Tutar</label>
                  <p className="text-2xl font-bold text-indigo-600">
                    {selectedRequest.amount.toLocaleString('tr-TR')} ₺
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Açıklama</label>
                  <p className="text-gray-700 mt-1">{selectedRequest.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notu (Opsiyonel)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Talep hakkında notunuz..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {selectedRequest.status === 'PENDING' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Red Nedeni (Red edecekseniz)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Neden reddedildiğini açıklayın..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAction('REJECTED')}
                      disabled={submitting}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                    >
                      {submitting ? 'İşleniyor...' : 'Reddet'}
                    </button>
                    <button
                      onClick={() => handleAction('APPROVED')}
                      disabled={submitting}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                    >
                      {submitting ? 'İşleniyor...' : 'Onayla'}
                    </button>
                    <button
                      onClick={() => handleAction('PAID')}
                      disabled={submitting}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                    >
                      {submitting ? 'İşleniyor...' : 'Onayla ve Öde'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

