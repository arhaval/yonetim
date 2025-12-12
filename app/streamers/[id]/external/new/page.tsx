'use client'

import Layout from '@/components/Layout'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function NewExternalStreamPage() {
  const router = useRouter()
  const params = useParams()
  const streamerId = params.id as string
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    teamName: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    payment: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/external-streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          streamerId,
          duration: parseInt(formData.duration) || 0,
          payment: parseFloat(formData.payment) || 0,
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
          <h1 className="text-3xl font-bold text-gray-900">Yeni Dış Yayın</h1>
          <p className="mt-2 text-sm text-gray-600">
            Yayıncının başka bir firmaya gittiği yayını kaydedin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Firma Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.teamName}
                  onChange={(e) =>
                    setFormData({ ...formData, teamName: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                />
              </div>

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
                  Ödenen Ücret (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.payment}
                  onChange={(e) =>
                    setFormData({ ...formData, payment: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                />
              </div>
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




