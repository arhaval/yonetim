'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, DollarSign } from 'lucide-react'

export default function ApproveScriptButton({ scriptId, currentStatus, currentPrice }: { scriptId: string, currentStatus: string, currentPrice: number }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [price, setPrice] = useState(currentPrice > 0 ? currentPrice.toString() : '')
  const [submitting, setSubmitting] = useState(false)
  const [showPaidButton, setShowPaidButton] = useState(false)

  // Status mapping - schema'daki enum değerlerini component'teki string'lere çevir
  const normalizedStatus = currentStatus?.toUpperCase() || ''

  const handleApprove = async () => {
    if (!price || parseFloat(price) <= 0) {
      alert('Lütfen geçerli bir ücret girin')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/voiceover-scripts/${scriptId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(price) }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Metin başarıyla onaylandı ve ücret kaydedildi!')
        setShowModal(false)
        setShowPaidButton(true)
        // Server component'i yeniden render et (state güncellemesi için)
        router.refresh()
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkAsPaid = async () => {
    if (!confirm('Bu metin ödendi olarak işaretlenecek ve giderlere eklenecek. Devam etmek istiyor musunuz?')) {
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/voiceover-scripts/${scriptId}/pay`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert('Metin ödendi olarak işaretlendi ve giderlere eklendi!')
        // Server component'i yeniden render et
        router.refresh()
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  if (normalizedStatus === 'PAID') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">Bu metin onaylandı ve ödendi</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {normalizedStatus === 'APPROVED' && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Metin Onaylandı</h3>
              <p className="text-sm text-gray-600">Metin onaylandı. Ödeme yapıldıysa "Ödendi" olarak işaretleyin.</p>
            </div>
            <button
              onClick={handleMarkAsPaid}
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {submitting ? 'İşleniyor...' : 'Ödendi Olarak İşaretle'}
            </button>
          </div>
        </div>
      )}

      {normalizedStatus === 'VOICE_UPLOADED' && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">İçerik Üreticisi Onayladı</h3>
              <p className="text-sm text-orange-700">İçerik üreticisi sesi onayladı. Fiyat girip onaylayın.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-medium rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-all duration-200"
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Fiyat Gir ve Onayla
            </button>
          </div>
        </div>
      )}

      {(normalizedStatus === 'WAITING_VOICE' || normalizedStatus === 'PENDING') && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Metin Beklemede</h3>
              <p className="text-sm text-gray-600">İçerik üreticisi henüz sesi onaylamadı.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Metin Onayla</h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setPrice(currentPrice > 0 ? currentPrice.toString() : '')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Seslendirmen Ücreti (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setPrice(currentPrice > 0 ? currentPrice.toString() : '')
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={submitting || !price || parseFloat(price) <= 0}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Onaylanıyor...' : 'Onayla'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}



