'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Durum bilgileri
const STATUS_INFO: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  DRAFT: { label: 'Taslak', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '📝' },
  SCRIPT_READY: { label: 'Metin Hazır', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '📄' },
  VOICE_READY: { label: 'Ses Hazır', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '🎙️' },
  EDITING: { label: 'Kurgu', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '🎬' },
  REVIEW: { label: 'İnceleme', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '👀' },
  PUBLISHED: { label: 'Yayınlandı', color: 'text-green-600', bgColor: 'bg-green-100', icon: '✅' },
  ARCHIVED: { label: 'Arşiv', color: 'text-gray-500', bgColor: 'bg-gray-50', icon: '📦' },
}

const PLATFORMS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'twitter', label: 'Twitter/X' },
]

const CONTENT_TYPES = [
  { value: 'uzun', label: 'Uzun Video' },
  { value: 'kisa', label: 'Kısa Video' },
  { value: 'reels', label: 'Reels/Shorts' },
]

interface ContentRegistry {
  id: string
  title: string
  description?: string
  status: string
  platform?: string
  contentType?: string
  scriptLink?: string
  voiceLink?: string
  editLink?: string
  finalLink?: string
  notes?: string
  createdAt: string
  creator?: { id: string; name: string }
  voiceActor?: { id: string; name: string }
  editor?: { id: string; name: string }
}

interface Creator {
  id: string
  name: string
}

interface VoiceActor {
  id: string
  name: string
}

interface TeamMember {
  id: string
  name: string
}

export default function ContentRegistryPage() {
  const [registries, setRegistries] = useState<ContentRegistry[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [voiceActors, setVoiceActors] = useState<VoiceActor[]>([])
  const [editors, setEditors] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: '',
    contentType: '',
    creatorId: '',
    voiceActorId: '',
    editorId: '',
    scriptLink: '',
    voiceLink: '',
    editLink: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Verileri yükle
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Paralel olarak tüm verileri çek
      const [registriesRes, creatorsRes, voiceActorsRes, teamRes] = await Promise.all([
        fetch('/api/content-registry'),
        fetch('/api/content-creators'),
        fetch('/api/voice-actors'),
        fetch('/api/team'),
      ])

      if (registriesRes.ok) {
        const data = await registriesRes.json()
        setRegistries(data.registries || [])
      }

      if (creatorsRes.ok) {
        const data = await creatorsRes.json()
        setCreators(Array.isArray(data) ? data : data.creators || [])
      }

      if (voiceActorsRes.ok) {
        const data = await voiceActorsRes.json()
        setVoiceActors(Array.isArray(data) ? data : data.voiceActors || [])
      }

      if (teamRes.ok) {
        const data = await teamRes.json()
        setEditors(Array.isArray(data) ? data : data.members || [])
      }
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Başlık gereklidir')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/content-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          creatorId: formData.creatorId || undefined,
          voiceActorId: formData.voiceActorId || undefined,
          editorId: formData.editorId || undefined,
        }),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({
          title: '',
          description: '',
          platform: '',
          contentType: '',
          creatorId: '',
          voiceActorId: '',
          editorId: '',
          scriptLink: '',
          voiceLink: '',
          editLink: '',
          notes: '',
        })
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Kayıt oluşturulamadı')
      }
    } catch (err) {
      alert('Bir hata oluştu')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/content-registry/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Durum güncellenemedi')
      }
    } catch (err) {
      alert('Bir hata oluştu')
      console.error(err)
    }
  }

  const deleteRegistry = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch(`/api/content-registry/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Kayıt silinemedi')
      }
    } catch (err) {
      alert('Bir hata oluştu')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📋 İçerik Kayıt Sistemi
              </h1>
              <p className="text-gray-500 mt-1">
                Editör, Ses ve Üretici bağlantısı - Test Sayfası
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                ← Ana Sayfa
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {showForm ? 'İptal' : '+ Yeni Kayıt'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Yeni Kayıt Formu */}
        {showForm && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Yeni İçerik Kaydı</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Başlık */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="İçerik başlığı"
                    required
                  />
                </div>

                {/* Açıklama */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="İçerik açıklaması"
                  />
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seçiniz</option>
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* İçerik Türü */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İçerik Türü
                  </label>
                  <select
                    value={formData.contentType}
                    onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seçiniz</option>
                    {CONTENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* İçerik Üreticisi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📝 İçerik Üreticisi
                  </label>
                  <select
                    value={formData.creatorId}
                    onChange={(e) => setFormData({ ...formData, creatorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seçiniz</option>
                    {creators.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Seslendirmen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🎙️ Seslendirmen
                  </label>
                  <select
                    value={formData.voiceActorId}
                    onChange={(e) => setFormData({ ...formData, voiceActorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seçiniz</option>
                    {voiceActors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                {/* Editör */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🎬 Editör
                  </label>
                  <select
                    value={formData.editorId}
                    onChange={(e) => setFormData({ ...formData, editorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seçiniz</option>
                    {editors.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                {/* Notlar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notlar
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ek notlar"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Kayıt Listesi */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">
              İçerik Kayıtları ({registries.length})
            </h2>
          </div>

          {registries.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-4xl mb-4">📭</p>
              <p>Henüz içerik kaydı yok</p>
              <p className="text-sm mt-2">Yukarıdaki "Yeni Kayıt" butonuna tıklayarak başlayın</p>
            </div>
          ) : (
            <div className="divide-y">
              {registries.map((registry) => {
                const statusInfo = STATUS_INFO[registry.status] || STATUS_INFO.DRAFT
                return (
                  <div key={registry.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                          <h3 className="font-medium text-gray-900">{registry.title}</h3>
                        </div>

                        {registry.description && (
                          <p className="text-gray-600 text-sm mb-2">{registry.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          {registry.platform && (
                            <span>📺 {registry.platform}</span>
                          )}
                          {registry.contentType && (
                            <span>🎞️ {registry.contentType}</span>
                          )}
                          {registry.creator && (
                            <span>📝 {registry.creator.name}</span>
                          )}
                          {registry.voiceActor && (
                            <span>🎙️ {registry.voiceActor.name}</span>
                          )}
                          {registry.editor && (
                            <span>🎬 {registry.editor.name}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {/* Durum Değiştirme */}
                        <select
                          value={registry.status}
                          onChange={(e) => updateStatus(registry.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          {Object.entries(STATUS_INFO).map(([value, info]) => (
                            <option key={value} value={value}>
                              {info.icon} {info.label}
                            </option>
                          ))}
                        </select>

                        {/* Sil */}
                        <button
                          onClick={() => deleteRegistry(registry.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bilgi Kutusu */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">ℹ️ Bu Sistem Nasıl Çalışır?</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. <strong>Taslak</strong> → İçerik fikri oluşturulur, üretici atanır</p>
            <p>2. <strong>Metin Hazır</strong> → Üretici metni yazar, seslendirmen atanır</p>
            <p>3. <strong>Ses Hazır</strong> → Seslendirmen sesi kaydeder, editör atanır</p>
            <p>4. <strong>Kurgu</strong> → Editör videoyu kurguya alır</p>
            <p>5. <strong>İnceleme</strong> → Son kontrol yapılır</p>
            <p>6. <strong>Yayınlandı</strong> → İçerik yayına alınır</p>
          </div>
        </div>
      </div>
    </div>
  )
}

