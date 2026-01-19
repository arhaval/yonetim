'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { CheckCircle, Clock, DollarSign, User, FileText, AlertCircle, CreditCard, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface ContentRegistry {
  id: string
  title: string
  status: string
  voicePrice: number | null
  editPrice: number | null
  voicePaid: boolean
  editPaid: boolean
  voiceLink: string | null
  editLink: string | null
  scriptText: string | null
  creator: { id: string; name: string } | null
  voiceActor: { id: string; name: string } | null
  streamer: { id: string; name: string } | null
  editor: { id: string; name: string } | null
  createdAt: string
}

export default function PaymentApprovalPage() {
  const [registries, setRegistries] = useState<ContentRegistry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ContentRegistry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [voicePrice, setVoicePrice] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // REVIEW durumundaki içerikleri getir (admin onayı bekleyenler)
      const res = await fetch('/api/content-registry?status=REVIEW')
      if (res.ok) {
        const data = await res.json()
        setRegistries(data.registries || [])
      }
    } catch (err) {
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  // Ücret gir ve onayla
  const handleApprove = async () => {
    if (!selectedItem) return

    const vPrice = parseFloat(voicePrice) || 0
    const ePrice = parseFloat(editPrice) || 0

    if (vPrice <= 0 && ePrice <= 0) {
      toast.error('En az bir ücret girmelisiniz')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/content-registry/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voicePrice: vPrice > 0 ? vPrice : null,
          editPrice: ePrice > 0 ? ePrice : null,
          status: 'PUBLISHED', // Onaylandı
        }),
      })

      if (res.ok) {
        toast.success('İçerik onaylandı! Ödemeler "Ödeme Bekleyenler" listesine eklendi.')
        setShowModal(false)
        setSelectedItem(null)
        setVoicePrice('')
        setEditPrice('')
        fetchData()
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
            <h1 className="text-3xl font-bold text-gray-900">Ödeme Onayı</h1>
            <p className="text-gray-600 mt-1">Tamamlanan içerikleri onaylayın ve ücretleri belirleyin</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{registries.length} içerik onay bekliyor</span>
          </div>
        </div>

        {/* Onay Bekleyen İçerikler */}
        {registries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tüm içerikler onaylandı!</h3>
            <p className="text-gray-600">Şu anda onay bekleyen içerik bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {registries.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-indigo-200 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      {item.creator && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          Metin: {item.creator.name}
                        </span>
                      )}
                      {(item.voiceActor || item.streamer) && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Ses: {item.voiceActor?.name || item.streamer?.name}
                        </span>
                      )}
                      {item.editor && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Kurgu: {item.editor.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      {item.voiceLink && (
                        <a
                          href={item.voiceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ses Dosyası
                        </a>
                      )}
                      {item.editLink && (
                        <a
                          href={item.editLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Kurgu Dosyası
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setVoicePrice(item.voicePrice?.toString() || '')
                      setEditPrice(item.editPrice?.toString() || '')
                      setShowModal(true)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    Onayla & Ücret Gir
                  </button>
                        </div>
                      </div>
                  ))}
                </div>
              )}

        {/* Ödeme Onay Modal */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full">
              <div className="p-6 border-b flex items-center justify-between">
                      <div>
                  <h3 className="text-xl font-bold text-gray-900">Ödeme Onayı</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedItem.title}</p>
                      </div>
                        <button
                          onClick={() => {
                    setShowModal(false)
                    setSelectedItem(null)
                          }}
                  className="text-gray-400 hover:text-gray-600"
                        >
                  <X className="w-6 h-6" />
                        </button>
                      </div>
              <div className="p-6 space-y-4">
                {/* Seslendirmen Ücreti */}
                {(selectedItem.voiceActor || selectedItem.streamer) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seslendirme Ücreti ({selectedItem.voiceActor?.name || selectedItem.streamer?.name})
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={voicePrice}
                        onChange={(e) => setVoicePrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">TL</span>
                    </div>
                  </div>
                )}

                {/* Editör Ücreti */}
                {selectedItem.editor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kurgu Ücreti ({selectedItem.editor.name})
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">TL</span>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Önemli:</p>
                      <p>Ücretler onaylandıktan sonra "Ödeme Bekleyenler" listesine eklenecek. Ödeme yapıldığında finansal kayıtlara düşecektir.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedItem(null)
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    İptal
                        </button>
                      <button
                        onClick={handleApprove}
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Onaylanıyor...' : 'Onayla'}
                      </button>
                    </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
