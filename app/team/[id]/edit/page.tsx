'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditTeamMemberPage() {
  const router = useRouter()
  const params = useParams()
  const memberId = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        alert(data.error || 'Fotoğraf yüklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Fotoğraf yüklenirken bir hata oluştu')
    } finally {
      setUploadingPhoto(false)
    }
  }

  useEffect(() => {
    if (memberId) {
      loadMember()
    }
  }, [memberId])

  const loadMember = async () => {
    try {
      const res = await fetch(`/api/team/${memberId}`)
      if (res.ok) {
        const member = await res.json()
        setFormData({
          name: member.name || '',
          email: member.email || '',
          password: '', // Şifreyi gösterme
          phone: member.phone || '',
          iban: member.iban || '',
          role: member.role || 'editor',
          baseSalary: member.baseSalary?.toString() || '',
          notes: member.notes || '',
          avatar: member.avatar || '',
        })
        setPhotoPreview(member.avatar || null)
      }
    } catch (error) {
      console.error('Error loading member:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          baseSalary: parseFloat(formData.baseSalary) || 0,
          avatar: formData.avatar || null,
          // Şifre boşsa gönderme
          password: formData.password.trim() || undefined,
        }),
      })

      if (res.ok) {
        router.push(`/team/${memberId}`)
      } else {
        const data = await res.json()
        alert(data.error || 'Bir hata oluştu')
        setSaving(false)
      }
    } catch (error) {
      alert('Bir hata oluştu')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="px-4 py-6 sm:px-0">
          <p>Yükleniyor...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link
            href={`/team/${memberId}`}
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Geri dön
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Ekip Üyesini Düzenle</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Profil Fotoğrafı */}
            <div>
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
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rol *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="input"
                >
                  <option value="editor">Editör</option>
                  <option value="designer">Tasarımcı</option>
                  <option value="manager">Yönetici</option>
                  <option value="content">İçerik Üreticisi</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input"
                  placeholder="ornek@email.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Dashboard girişi için email adresi
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Şifre (Değiştirmek için yeni şifre girin)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input"
                  placeholder="Yeni şifre (boş bırakabilirsiniz)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Sadece şifre değiştirmek istiyorsanız yeni şifre girin
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
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IBAN
                </label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) =>
                    setFormData({ ...formData, iban: e.target.value })
                  }
                  className="input"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Temel Maaş (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.baseSalary}
                  onChange={(e) =>
                    setFormData({ ...formData, baseSalary: e.target.value })
                  }
                  className="input"
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
                className="input"
              />
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary mr-3"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

