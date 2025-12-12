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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    iban: '',
    role: 'editor',
    baseSalary: '',
    notes: '',
  })

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
        })
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

