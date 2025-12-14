'use client'

import Layout from '@/components/Layout'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewStreamerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profilePhoto: '',
    iban: '',
    phone: '',
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [teamRates, setTeamRates] = useState<Array<{ teamName: string; hourlyRate: string }>>([])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin')
      return
    }

    // Dosya boyutunu kontrol et (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan büyük olamaz')
      return
    }

    setUploadingPhoto(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await res.json()

      if (res.ok && data.url) {
        setFormData({ ...formData, profilePhoto: data.url })
        setPhotoPreview(data.url)
      } else {
        alert(data.error || 'Fotoğraf yüklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Fotoğraf yüklenirken bir hata oluştu')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/streamers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          password: formData.password || null,
          profilePhoto: formData.profilePhoto || null,
          iban: formData.iban || null,
          phone: formData.phone || null,
          platform: 'Twitch', // Varsayılan
          teamRates: teamRates
            .filter(tr => tr.teamName.trim() && tr.hourlyRate)
            .map(tr => ({
              teamName: tr.teamName.trim(),
              hourlyRate: parseFloat(tr.hourlyRate) || 0,
            })),
        }),
      })

      if (res.ok) {
        router.push('/streamers')
      } else {
        const data = await res.json()
        console.error('Error response:', data)
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
          <h1 className="text-3xl font-bold text-gray-900">Yeni Yayıncı</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  İsim *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                  placeholder="Yayıncı adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email (Giriş için)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                  placeholder="yayinci@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Yayıncı bu email ile sisteme giriş yapabilir
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Şifre (Giriş için)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                  placeholder="Giriş şifresi"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Yayıncı bu şifre ile sisteme giriş yapabilir
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                  placeholder="555 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profil Fotoğrafı
                </label>
                <div className="mt-1 space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                      />
                    </div>
                    {photoPreview && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {uploadingPhoto && (
                    <p className="text-xs text-blue-600">Yükleniyor...</p>
                  )}
                  {formData.profilePhoto && !uploadingPhoto && (
                    <p className="text-xs text-green-600">✓ Fotoğraf yüklendi</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Maksimum dosya boyutu: 5MB (JPG, PNG, GIF)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IBAN Bilgisi
                </label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) =>
                    setFormData({ ...formData, iban: e.target.value.toUpperCase() })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  maxLength={34}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ödeme için IBAN bilgisi (opsiyonel)
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Firma Bazlı Saatlik Ücretler (Opsiyonel)
                </h3>
                <button
                  type="button"
                  onClick={() => setTeamRates([...teamRates, { teamName: '', hourlyRate: '' }])}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  + Firma Ekle
                </button>
              </div>
              {teamRates.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Firma Adı
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Saatlik Ücret (₺)
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          İşlem
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamRates.map((teamRate, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              value={teamRate.teamName}
                              onChange={(e) => {
                                const newRates = [...teamRates]
                                newRates[index].teamName = e.target.value
                                setTeamRates(newRates)
                              }}
                              placeholder="Arhaval, Sangal, Eternal Fire..."
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="number"
                              step="0.01"
                              value={teamRate.hourlyRate}
                              onChange={(e) => {
                                const newRates = [...teamRates]
                                newRates[index].hourlyRate = e.target.value
                                setTeamRates(newRates)
                              }}
                              placeholder="200"
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => {
                                const newRates = teamRates.filter((_, i) => i !== index)
                                setTeamRates(newRates)
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {teamRates.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Henüz firma eklenmemiş. "+ Firma Ekle" butonuna tıklayarak ekleyebilirsiniz.
                </p>
              )}
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
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

