'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Clock, CheckCircle, XCircle, DollarSign, Plus, Trash2 } from 'lucide-react'
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
  content: { id: string; title: string; platform: string } | null
  contentRegistry: { id: string; title: string; platform: string } | null
}

export default function MyPaymentRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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

  const handleDelete = async (id: string) => {
    if (!confirm('Bu talebi silmek istediğinizden emin misiniz?')) return

    try {
      const res = await fetch(`/api/payment-requests/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Talep silindi')
        fetchRequests()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Talep silinemedi')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    }
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

  const totalPending = requests
    .filter((r) => r.status === 'PENDING' || r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.amount, 0)

  const totalPaid = requests
    .filter((r) => r.status === 'PAID')
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
            <h1 className="text-3xl font-bold text-gray-900">Ödeme Taleplerim</h1>
            <p className="text-gray-600 mt-1">Ödeme taleplerinizi görüntüleyin ve yönetin</p>
          </div>
          <button
            onClick={() => router.push('/payment-request/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Yeni Talep
          </button>
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
                <DollarSign className="w-6 h-6 text-indigo-600" />
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
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ödenen Tutar</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {totalPaid.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tümü' : getStatusBadge(status).props.children[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz talep yok</h3>
            <p className="text-gray-600 mb-4">İlk ödeme talebinizi oluşturun</p>
            <button
              onClick={() => router.push('/payment-request/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Yeni Talep Oluştur
            </button>
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
                    <p className="text-gray-700 mb-3">{request.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <strong className="text-lg text-gray-900">
                          {request.amount.toLocaleString('tr-TR')} ₺
                        </strong>
                      </span>
                      <span>
                        Oluşturulma: {format(new Date(request.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </span>
                      {request.paidAt && (
                        <span className="text-green-600 font-medium">
                          Ödendi: {format(new Date(request.paidAt), 'dd MMM yyyy', { locale: tr })}
                        </span>
                      )}
                    </div>
                    {request.adminNotes && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Admin Notu:</strong> {request.adminNotes}
                        </p>
                      </div>
                    )}
                    {request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Red Nedeni:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                  {request.status === 'PENDING' && (
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Talebi Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

