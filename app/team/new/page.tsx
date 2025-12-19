'use client'

import Layout from '@/components/Layout'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewTeamMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    iban: '',
    role: 'editor',
    baseSalary: '',
    notes: '',
    avatar: '',
  })

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
        setFormData({ ...formData, avatar: data.url })
        setPhotoPreview(data.url)
      } else {
        const errorMsg = data.error || 'Fotoğraf yüklenirken bir hata oluştu'
        console.error('Upload error:', errorMsg)
        alert(errorMsg)
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      const errorMsg = error?.message || 'Fotoğraf yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'
      alert(errorMsg)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          baseSalary: parseFloat(formData.baseSalary) || 0,
          avatar: formData.avatar || null,
        }),
      })

      if (res.ok) {
        router.push('/team')
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
          <h1 className="text-3xl font-bold text-gray-900">Yeni Ekip Üyesi</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-6 space-y-8">
            {/* Temel Bilgiler */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Temel Bilgiler</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İsim *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="input w-full"
                  >
                    <option value="editor">Editör</option>
                    <option value="designer">Tasarımcı</option>
                    <option value="manager">Yönetici</option>
                    <option value="content">İçerik Üreticisi</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
              </div>

              {/* Profil Fotoğrafı */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profil Fotoğrafı
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                        <span className="text-gray-400 text-sm">Fotoğraf</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                    />
                    {uploadingPhoto && (
                      <p className="mt-2 text-sm text-gray-500">Yükleniyor...</p>
                    )}
                    {formData.avatar && !uploadingPhoto && (
                      <p className="mt-2 text-sm text-green-600">✓ Fotoğraf yüklendi</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Giriş Bilgileri */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Giriş Bilgileri</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">🔐 Dashboard Girişi İçin</p>
                <p className="text-xs text-blue-600">Ekip üyesi <code className="bg-blue-100 px-1 rounded">/team-login</code> sayfasından giriş yapabilecek.</p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input w-full"
                    placeholder="ornek@email.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Dashboard girişi için email adresi (zorunlu)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input w-full"
                    placeholder="Şifre belirleyin"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Dashboard girişi için şifre (zorunlu)
                  </p>
                </div>
              </div>
            </div>

            {/* İletişim ve Finansal */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">İletişim ve Finansal</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) =>
                      setFormData({ ...formData, iban: e.target.value })
                    }
                    className="input w-full"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temel Maaş (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.baseSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, baseSalary: e.target.value })
                    }
                    className="input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Notlar */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Notlar</h2>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="input w-full"
                placeholder="Ekip üyesi hakkında notlar..."
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}





