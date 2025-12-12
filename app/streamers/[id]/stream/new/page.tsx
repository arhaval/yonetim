'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function NewStreamPage() {
  const router = useRouter()
  const params = useParams()
  const streamerId = params.id as string
  const [loading, setLoading] = useState(false)
  const [streamer, setStreamer] = useState<any>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: '',
    viewers: '',
    revenue: '',
    teamName: '', // Hangi takım için yayın yapıldığı
    isExternalChannel: false,
    externalChannelName: '',
    notes: '',
  })

  useEffect(() => {
    fetch(`/api/streamers/${streamerId}`)
      .then((res) => res.json())
      .then((data) => setStreamer(data))
  }, [streamerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          ...formData,
          streamerId,
          duration: parseInt(formData.duration) || 0,
          viewers: parseInt(formData.viewers) || null,
          revenue: parseFloat(formData.revenue) || 0,
          teamName: formData.teamName || null,
          externalChannelName: formData.isExternalChannel ? formData.externalChannelName : null,
        }),
      })

      if (res.ok) {
        router.push(`/streamers/${streamerId}`)
      } else {
        const data = await res.json()
        alert(data.error || 'Bir hata oluştu')
        setLoading(false)
      }
    } catch (error) {
      alert('Bir hata oluştu')
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Yeni Yayın</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tarih *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Süre (dakika) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  İzleyici Sayısı
                </label>
                <input
                  type="number"
                  value={formData.viewers}
                  onChange={(e) =>
                    setFormData({ ...formData, viewers: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gelir (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.revenue}
                  onChange={(e) =>
                    setFormData({ ...formData, revenue: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hangi Firma İçin? (Opsiyonel)
                </label>
                <select
                  value={formData.teamName}
                  onChange={(e) =>
                    setFormData({ ...formData, teamName: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                >
                  <option value="">Varsayılan Ücret</option>
                  {streamer?.teamRates?.map((rate: any) => (
                    <option key={rate.id} value={rate.teamName}>
                      {rate.teamName} ({rate.rate.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })})
                    </option>
                  ))}
                </select>
                {formData.teamName && streamer?.teamRates?.find((r: any) => r.teamName === formData.teamName) && (
                  <p className="mt-1 text-xs text-gray-500">
                    Bu firma için ücret: {streamer.teamRates.find((r: any) => r.teamName === formData.teamName).rate.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isExternalChannel"
                  checked={formData.isExternalChannel}
                  onChange={(e) =>
                    setFormData({ ...formData, isExternalChannel: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isExternalChannel" className="ml-2 block text-sm text-gray-900">
                  Bu yayın başka bir kanala hizmet veriyor
                </label>
              </div>
              {formData.isExternalChannel && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hangi Kanala Hizmet Verdi? *
                  </label>
                  <input
                    type="text"
                    required={formData.isExternalChannel}
                    value={formData.externalChannelName}
                    onChange={(e) =>
                      setFormData({ ...formData, externalChannelName: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                    placeholder="Kanal adı"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notlar
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
              />
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

