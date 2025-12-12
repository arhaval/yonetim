'use client'

import Layout from '@/components/Layout'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Upload } from 'lucide-react'

export default function NewVoiceActorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    profilePhoto: '',
    notes: '',
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin')
      return
    }

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

    if (!formData.email || !formData.password) {
      alert('Email ve şifre gereklidir. Seslendirmen sisteme giriş yapabilmesi için bu bilgiler zorunludur.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/voice-actors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
          profilePhoto: formData.profilePhoto || null,
          notes: formData.notes || null,
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Yeni Seslendirmen Ekle
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Yeni bir seslendirmen ekleyin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Profil Fotoğrafı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profil Fotoğrafı
            </label>
            <div className="flex items-center space-x-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Mic className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingPhoto ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
              </div>
            </div>
          </div>

          {/* İsim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İsim *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Seslendirmen adı"
            />
          </div>

          {/* Giriş Bilgileri */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-pink-800 font-semibold mb-2">🔐 Dashboard Girişi İçin</p>
            <p className="text-xs text-pink-700">Email ve şifre girilirse seslendirmen <code className="bg-pink-100 px-1 rounded">/voice-actor-login</code> sayfasından giriş yapabilecek.</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-pink-600">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="seslendirmen@email.com"
            />
            <p className="mt-1 text-xs text-gray-500">Seslendirmen bu email ile sisteme giriş yapacak</p>
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre <span className="text-pink-600">*</span>
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Güvenli bir şifre belirleyin"
            />
            <p className="mt-1 text-xs text-gray-500">Seslendirmen bu şifre ile sisteme giriş yapacak</p>
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+90 555 123 45 67"
            />
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
              placeholder="Notlar..."
            />
          </div>

          {/* Butonlar */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}



