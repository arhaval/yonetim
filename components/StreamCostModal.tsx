'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface StreamCostModalProps {
  stream: any
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function StreamCostModal({
  stream,
  isOpen,
  onClose,
  onUpdate,
}: StreamCostModalProps) {
  const [formData, setFormData] = useState({
    streamerEarning: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (stream) {
      setFormData({
        streamerEarning: stream.streamerEarning?.toString() || '',
      })
    }
  }, [stream])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/streams/${stream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerEarning: parseFloat(formData.streamerEarning) || 0,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Maliyet bilgileri başarıyla güncellendi!')
        onUpdate()
        onClose()
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Maliyet Bilgileri
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {stream && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Yayıncı:</span> {stream.streamer?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tarih:</span>{' '}
                  {new Date(stream.date).toLocaleDateString('tr-TR')}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Maç:</span> {stream.matchInfo || '-'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Firma:</span> {stream.teamName || '-'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Süre:</span> {stream.duration} saat
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yayıncı Ödemesi (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.streamerEarning}
                  onChange={(e) =>
                    setFormData({ ...formData, streamerEarning: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Yayıncıya ödenecek ücret (gider olarak kaydedilir)
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  💡 Not: Toplu ödemeleri Finansal Kayıtlar sayfasından gelir olarak ekleyebilirsiniz.
                </p>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:col-start-2 sm:text-sm"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

