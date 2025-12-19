'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AVAILABLE_TEAMS = ['Eternal Fire', 'Arhaval', 'Sangal']

export default function NewStreamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [streamers, setStreamers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    streamerId: '',
    matchInfo: '',
    teamName: '', // Opsiyonel
    duration: '', // Tam saat cinsinden (1, 2, 3, 4, 5...)
    streamerEarning: '', // Yayıncıya ödenecek miktar
    totalRevenue: '', // Toplam gelir (opsiyonel)
    notes: '',
  })

  useEffect(() => {
    // Streamers listesini her seferinde yeniden yükle
    fetch('/api/streamers')
      .then((res) => res.json())
      .then((data) => {
        setStreamers(data)
      })
      .catch((error) => {
        console.error('Error fetching streamers:', error)
      })
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Yayıncı maliyet girmeden yayın ekleyebilir - admin sonra maliyet girecek
    const totalRevenue = parseFloat(formData.totalRevenue) || 0
    const streamerEarning = parseFloat(formData.streamerEarning) || 0

    try {
      const res = await fetch('/api/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamerId: formData.streamerId,
          date: formData.date,
          duration: parseInt(formData.duration) || 0,
          matchInfo: formData.matchInfo,
          teamName: formData.teamName || null,
          totalRevenue: totalRevenue,
          streamerEarning: streamerEarning, // 0 olabilir - admin sonra girecek
          arhavalProfit: 0,
          notes: formData.notes || null,
        }),
      })

      if (res.ok) {
        const streamData = await res.json()
        // Yayıncı detay sayfasına yönlendir
        router.push(`/streamers/${formData.streamerId}`)
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
                  Yayıncı *
                </label>
                <select
                  required
                  value={formData.streamerId}
                  onChange={(e) =>
                    setFormData({ ...formData, streamerId: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                >
                  <option value="">Yayıncı Seçin</option>
                  {streamers.map((streamer) => (
                    <option key={streamer.id} value={streamer.id}>
                      {streamer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hangi Maç? *
                </label>
                <input
                  type="text"
                  required
                  value={formData.matchInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, matchInfo: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                  placeholder="Örn: Fnatic vs NAVI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Süre (Saat) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={formData.duration}
                  onChange={(e) => {
                    const value = e.target.value
                    // Sadece tam sayıları kabul et
                    if (value === '' || /^\d+$/.test(value)) {
                      setFormData({ ...formData, duration: value })
                    }
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                  placeholder="1, 2, 3, 4, 5..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Sadece tam saatler (1, 2, 3, 4, 5...)
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ödeme Bilgileri <span className="text-sm font-normal text-gray-500">(Opsiyonel - Admin sonra girebilir)</span></h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yayıncıya Ödenecek Miktar (₺) <span className="text-gray-400">(Opsiyonel)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.streamerEarning}
                    onChange={(e) =>
                      setFormData({ ...formData, streamerEarning: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm border p-2"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Bu yayın için yayıncıya ödenecek toplam tutar (Admin onay sayfasından da girilebilir)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Toplam Gelir (₺) <span className="text-gray-400">(Opsiyonel)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalRevenue}
                    onChange={(e) =>
                      setFormData({ ...formData, totalRevenue: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Firmadan alınan toplam ücret (bilgi amaçlı)
                  </p>
                </div>
              </div>

              {parseFloat(formData.totalRevenue) > 0 && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Toplam Gelir:
                    </span>
                    <span className="text-lg font-bold text-blue-900">
                      {parseFloat(formData.totalRevenue).toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    💡 Not: Toplu ödemeleri Finansal Kayıtlar sayfasından gelir olarak ekleyebilirsiniz.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Firma <span className="text-gray-400">(Opsiyonel)</span>
              </label>
              <select
                value={formData.teamName}
                onChange={(e) =>
                  setFormData({ ...formData, teamName: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
              >
                <option value="">Firma Seçin (Opsiyonel)</option>
                {AVAILABLE_TEAMS.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
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
