'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Durum bilgileri
const STATUS_INFO: Record<string, { label: string; color: string; bgColor: string; icon: string; description: string }> = {
  DRAFT: { label: 'Metin Yazılıyor', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '📝', description: 'Admin/Üretici metin yazıyor' },
  SCRIPT_READY: { label: 'Ses Bekleniyor', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '🎙️', description: 'Seslendirmen ses yükleyecek' },
  VOICE_READY: { label: 'Kurgu Bekleniyor', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '🎬', description: 'Editör kurgu yapacak' },
  EDITING: { label: 'Kurgu Yapılıyor', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '⏳', description: 'Editör çalışıyor' },
  REVIEW: { label: 'Onay Bekliyor', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '👀', description: 'Admin onayı bekleniyor' },
  PUBLISHED: { label: 'Tamamlandı', color: 'text-green-600', bgColor: 'bg-green-100', icon: '✅', description: 'İş tamamlandı, ödeme bekliyor' },
  ARCHIVED: { label: 'Ödendi', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: '💰', description: 'Ödemeler yapıldı' },
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
  editorNotes?: string
  createdAt: string
  creator?: { id: string; name: string }
  voiceActor?: { id: string; name: string }
  editor?: { id: string; name: string }
}

interface Person {
  id: string
  name: string
}

export default function ContentRegistryPage() {
  const [registries, setRegistries] = useState<ContentRegistry[]>([])
  const [creators, setCreators] = useState<Person[]>([])
  const [voiceActors, setVoiceActors] = useState<Person[]>([])
  const [editors, setEditors] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form states
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '', // Metin içeriği
    platform: '',
    contentType: '',
    voiceActorId: '',
    editorId: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Detay modal
  const [selectedRegistry, setSelectedRegistry] = useState<ContentRegistry | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  
  // Link ekleme
  const [linkInput, setLinkInput] = useState('')
  const [linkType, setLinkType] = useState<'voice' | 'edit'>('voice')

  // Ödeme modal
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentRegistry, setPaymentRegistry] = useState<ContentRegistry | null>(null)
  const [voiceActorPrice, setVoiceActorPrice] = useState('')
  const [editorPrice, setEditorPrice] = useState('')
  const [paymentSubmitting, setPaymentSubmitting] = useState(false)

  // Verileri yükle
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
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

  // Yeni içerik oluştur (Admin/Üretici)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Başlık gereklidir')
      return
    }
    if (!formData.description.trim()) {
      alert('Metin içeriği gereklidir')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/content-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          platform: formData.platform || undefined,
          contentType: formData.contentType || undefined,
          voiceActorId: formData.voiceActorId || undefined,
          editorId: formData.editorId || undefined,
          notes: formData.notes || undefined,
          status: formData.voiceActorId ? 'SCRIPT_READY' : 'DRAFT', // Seslendirmen atandıysa direkt ona git
        }),
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({
          title: '',
          description: '',
          platform: '',
          contentType: '',
          voiceActorId: '',
          editorId: '',
          notes: '',
        })
        fetchData()
        alert('✅ İçerik oluşturuldu!')
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

  // Link ekle (Seslendirmen veya Editör)
  const handleAddLink = async () => {
    if (!selectedRegistry || !linkInput.trim()) {
      alert('Link gereklidir')
      return
    }

    try {
      const updateData: any = {}
      let newStatus = selectedRegistry.status

      if (linkType === 'voice') {
        updateData.voiceLink = linkInput
        // Ses eklendi, editöre git
        if (selectedRegistry.editor) {
          newStatus = 'VOICE_READY'
        }
      } else {
        updateData.editLink = linkInput
        // Kurgu eklendi, onaya git
        newStatus = 'REVIEW'
      }

      updateData.status = newStatus

      const res = await fetch(`/api/content-registry/${selectedRegistry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (res.ok) {
        setLinkInput('')
        setShowDetail(false)
        setSelectedRegistry(null)
        fetchData()
        alert('✅ Link eklendi!')
      } else {
        const data = await res.json()
        alert(data.error || 'Link eklenemedi')
      }
    } catch (err) {
      alert('Bir hata oluştu')
      console.error(err)
    }
  }

  // Durum güncelle
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

  // Sil
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

  // Ödeme modalını aç
  const openPaymentModal = (registry: ContentRegistry) => {
    setPaymentRegistry(registry)
    setVoiceActorPrice('')
    setEditorPrice('')
    setShowPaymentModal(true)
  }

  // Onayla ve ödeme kaydet
  const handlePayment = async () => {
    if (!paymentRegistry) return

    const voicePrice = parseFloat(voiceActorPrice) || 0
    const editPrice = parseFloat(editorPrice) || 0

    setPaymentSubmitting(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      const payments: string[] = []

      // Seslendirmen ödemesi (fiyat girildiyse)
      if (voicePrice > 0 && paymentRegistry.voiceActor) {
        const voicePayoutRes = await fetch('/api/payouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voiceActorId: paymentRegistry.voiceActor.id,
            amount: voicePrice,
            date: today,
            category: 'seslendirme',
            description: `Seslendirme: ${paymentRegistry.title}`,
            payoutStatus: 'paid',
          }),
        })

        if (!voicePayoutRes.ok) {
          const err = await voicePayoutRes.json()
          throw new Error(err.error || 'Seslendirmen ödemesi kaydedilemedi')
        }
        payments.push(`🎙️ ${paymentRegistry.voiceActor.name}: ${voicePrice}₺`)
      }

      // Editör ödemesi (fiyat girildiyse)
      if (editPrice > 0 && paymentRegistry.editor) {
        const editorPayoutRes = await fetch('/api/payouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamMemberId: paymentRegistry.editor.id,
            amount: editPrice,
            date: today,
            category: 'kurgu',
            description: `Kurgu: ${paymentRegistry.title}`,
            payoutStatus: 'paid',
          }),
        })

        if (!editorPayoutRes.ok) {
          const err = await editorPayoutRes.json()
          throw new Error(err.error || 'Editör ödemesi kaydedilemedi')
        }
        payments.push(`🎬 ${paymentRegistry.editor.name}: ${editPrice}₺`)
      }

      // ContentRegistry durumunu PUBLISHED (Onaylandı) yap
      await fetch(`/api/content-registry/${paymentRegistry.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      })

      setShowPaymentModal(false)
      setPaymentRegistry(null)
      setVoiceActorPrice('')
      setEditorPrice('')
      fetchData()

      // Sonuç mesajı
      if (payments.length > 0) {
        alert(`✅ Onaylandı!\n\nÖdeme kayıtları:\n${payments.join('\n')}`)
      } else {
        alert('✅ Onaylandı! (Ödeme kaydı girilmedi)')
      }
    } catch (err: any) {
      alert(err.message || 'Bir hata oluştu')
      console.error(err)
    } finally {
      setPaymentSubmitting(false)
    }
  }

  // Detay aç
  const openDetail = (registry: ContentRegistry) => {
    setSelectedRegistry(registry)
    setShowDetail(true)
    setLinkInput('')
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

  // Duruma göre grupla
  const groupedRegistries = {
    waiting: registries.filter(r => ['DRAFT', 'SCRIPT_READY', 'VOICE_READY', 'EDITING'].includes(r.status)),
    review: registries.filter(r => r.status === 'REVIEW'),
    completed: registries.filter(r => r.status === 'PUBLISHED'),
    paid: registries.filter(r => r.status === 'ARCHIVED'),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📋 İçerik Merkezi
              </h1>
              <p className="text-gray-500 mt-1">
                Metin → Ses → Kurgu → Onay → Ödeme
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
                {showForm ? 'İptal' : '+ Yeni Metin Oluştur'}
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

        {/* YENİ METİN FORMU */}
        {showForm && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">📝 Yeni Metin Oluştur</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Başlık */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Video başlığı"
                  required
                />
              </div>

              {/* Metin İçeriği */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metin İçeriği * (Seslendirmenin okuyacağı metin)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Seslendirmenin okuyacağı metni buraya yazın..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
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
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seçiniz</option>
                    {CONTENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Seslendirmen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🎙️ Seslendirmen Ata
                  </label>
                  <select
                    value={formData.voiceActorId}
                    onChange={(e) => setFormData({ ...formData, voiceActorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
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
                    🎬 Editör Ata
                  </label>
                  <select
                    value={formData.editorId}
                    onChange={(e) => setFormData({ ...formData, editorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seçiniz</option>
                    {editors.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notlar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ek Notlar (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ekip için notlar..."
                />
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : 'Oluştur ve Gönder'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* İŞ AKIŞI TABLOLARI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* DEVAM EDEN İŞLER */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b bg-blue-50">
              <h2 className="font-semibold text-blue-800">
                ⏳ Devam Eden İşler ({groupedRegistries.waiting.length})
              </h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {groupedRegistries.waiting.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Devam eden iş yok
                </div>
              ) : (
                groupedRegistries.waiting.map((r) => (
                  <RegistryCard 
                    key={r.id} 
                    registry={r} 
                    onOpen={() => openDetail(r)}
                    onDelete={() => deleteRegistry(r.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ONAY BEKLİYOR */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b bg-yellow-50">
              <h2 className="font-semibold text-yellow-800">
                👀 Onay Bekliyor ({groupedRegistries.review.length})
              </h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {groupedRegistries.review.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Onay bekleyen iş yok
                </div>
              ) : (
                groupedRegistries.review.map((r) => (
                  <RegistryCard 
                    key={r.id} 
                    registry={r} 
                    onOpen={() => openDetail(r)}
                    onDelete={() => deleteRegistry(r.id)}
                    showApprove
                    onApprove={() => openPaymentModal(r)}
                  />
                ))
              )}
            </div>
          </div>

          {/* TAMAMLANDI */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b bg-green-50">
              <h2 className="font-semibold text-green-800">
                ✅ Onaylandı ({groupedRegistries.completed.length})
              </h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {groupedRegistries.completed.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Onaylanan iş yok
                </div>
              ) : (
                groupedRegistries.completed.map((r) => (
                  <RegistryCard 
                    key={r.id} 
                    registry={r} 
                    onOpen={() => openDetail(r)}
                    onDelete={() => deleteRegistry(r.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ÖDENDİ */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b bg-emerald-50">
              <h2 className="font-semibold text-emerald-800">
                💰 Ödendi ({groupedRegistries.paid.length})
              </h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {groupedRegistries.paid.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Ödenen iş yok
                </div>
              ) : (
                groupedRegistries.paid.map((r) => (
                  <RegistryCard 
                    key={r.id} 
                    registry={r} 
                    onOpen={() => openDetail(r)}
                    onDelete={() => deleteRegistry(r.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* AKIŞ AÇIKLAMASI */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-3">📌 İş Akışı</h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-gray-100 rounded-full">📝 Metin Yaz</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-blue-100 rounded-full">🎙️ Ses Yükle</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-purple-100 rounded-full">🎬 Kurgu Yap</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-yellow-100 rounded-full font-medium">👀 Admin Onayı + 💰 Fiyat Gir</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-green-100 rounded-full">✅ Tamamlandı</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            * Onay aşamasında fiyat girdiğinizde, ilgili kişilerin ödeme kayıtlarına otomatik düşer
          </p>
        </div>

        {/* UYARI */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-medium text-amber-800 mb-2">⚠️ Önemli Not</h3>
          <p className="text-sm text-amber-700">
            Bu sistem mevcut <strong>Seslendirme Metinleri</strong> sisteminden bağımsızdır. 
            Burada girdiğiniz ödemeler ayrı kayıt olarak düşer. Aynı iş için hem buradan hem 
            eski sistemden ödeme girmeyin!
          </p>
        </div>
      </div>

      {/* DETAY MODAL */}
      {showDetail && selectedRegistry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedRegistry.title}</h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-sm ${STATUS_INFO[selectedRegistry.status]?.bgColor} ${STATUS_INFO[selectedRegistry.status]?.color}`}>
                  {STATUS_INFO[selectedRegistry.status]?.icon} {STATUS_INFO[selectedRegistry.status]?.label}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Metin */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">📄 Metin İçeriği</h3>
                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
                  {selectedRegistry.description || 'Metin yok'}
                </div>
              </div>

              {/* Atanan Kişiler */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">🎙️ Seslendirmen</h3>
                  <p className="text-gray-600">
                    {selectedRegistry.voiceActor?.name || <span className="text-gray-400">Atanmadı</span>}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">🎬 Editör</h3>
                  <p className="text-gray-600">
                    {selectedRegistry.editor?.name || <span className="text-gray-400">Atanmadı</span>}
                  </p>
                </div>
              </div>

              {/* Linkler */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">🔊 Ses Linki</h3>
                  {selectedRegistry.voiceLink ? (
                    <a href={selectedRegistry.voiceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {selectedRegistry.voiceLink}
                    </a>
                  ) : (
                    <span className="text-gray-400">Henüz yüklenmedi</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">🎬 Kurgu Linki</h3>
                  {selectedRegistry.editLink ? (
                    <a href={selectedRegistry.editLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {selectedRegistry.editLink}
                    </a>
                  ) : (
                    <span className="text-gray-400">Henüz yüklenmedi</span>
                  )}
                </div>
              </div>

              {/* Link Ekleme */}
              {['SCRIPT_READY', 'VOICE_READY', 'EDITING'].includes(selectedRegistry.status) && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-700 mb-2">📎 Link Ekle</h3>
                  <div className="flex gap-2">
                    <select
                      value={linkType}
                      onChange={(e) => setLinkType(e.target.value as 'voice' | 'edit')}
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="voice">🎙️ Ses Linki</option>
                      <option value="edit">🎬 Kurgu Linki</option>
                    </select>
                    <input
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="https://drive.google.com/..."
                    />
                    <button
                      onClick={handleAddLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              )}

              {/* Notlar */}
              {selectedRegistry.notes && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">📝 Notlar</h3>
                  <p className="text-gray-600">{selectedRegistry.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONAY VE ÖDEME MODAL */}
      {showPaymentModal && paymentRegistry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b bg-yellow-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">✅ Onayla ve Öde</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mt-1">{paymentRegistry.title}</p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                💡 Ödeme yapılacak kişileri seçin ve fiyatlarını girin. Boş bıraktığınız kişilere ödeme kaydı düşmez.
              </p>

              {/* Seslendirmen Ücreti */}
              {paymentRegistry.voiceActor && (
                <div className="p-4 border rounded-lg">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-lg">🎙️</span>
                    <span>Seslendirmen: <strong>{paymentRegistry.voiceActor.name}</strong></span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={voiceActorPrice}
                      onChange={(e) => setVoiceActorPrice(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Fiyat girin (boş = ödeme yok)"
                      min="0"
                      step="0.01"
                    />
                    <span className="text-gray-500 font-medium">₺</span>
                  </div>
                </div>
              )}

              {/* Editör Ücreti */}
              {paymentRegistry.editor && (
                <div className="p-4 border rounded-lg">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-lg">🎬</span>
                    <span>Editör: <strong>{paymentRegistry.editor.name}</strong></span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editorPrice}
                      onChange={(e) => setEditorPrice(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Fiyat girin (boş = ödeme yok)"
                      min="0"
                      step="0.01"
                    />
                    <span className="text-gray-500 font-medium">₺</span>
                  </div>
                </div>
              )}

              {/* Atanmamış uyarısı */}
              {!paymentRegistry.voiceActor && !paymentRegistry.editor && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                  ⚠️ Bu içeriğe seslendirmen veya editör atanmamış. Sadece onaylayabilirsiniz.
                </div>
              )}

              {/* Toplam */}
              {(paymentRegistry.voiceActor || paymentRegistry.editor) && (voiceActorPrice || editorPrice) && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Toplam Ödeme:</span>
                    <span className="text-green-600">
                      {((parseFloat(voiceActorPrice) || 0) + (parseFloat(editorPrice) || 0)).toFixed(2)} ₺
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                İptal
              </button>
              <button
                onClick={handlePayment}
                disabled={paymentSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {paymentSubmitting ? 'Kaydediliyor...' : '✅ Onayla ve Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Kayıt Kartı Komponenti
function RegistryCard({ 
  registry, 
  onOpen, 
  onDelete,
  showApprove,
  onApprove,
  showPayment,
  onMarkPaid,
}: { 
  registry: ContentRegistry
  onOpen: () => void
  onDelete: () => void
  showApprove?: boolean
  onApprove?: () => void
  showPayment?: boolean
  onMarkPaid?: () => void
}) {
  const statusInfo = STATUS_INFO[registry.status] || STATUS_INFO.DRAFT

  return (
    <div className="p-4 hover:bg-gray-50 cursor-pointer" onClick={onOpen}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>
          <h3 className="font-medium text-gray-900">{registry.title}</h3>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
            {registry.voiceActor && (
              <span>🎙️ {registry.voiceActor.name}</span>
            )}
            {registry.editor && (
              <span>🎬 {registry.editor.name}</span>
            )}
            {registry.voiceLink && (
              <span className="text-green-600">✓ Ses</span>
            )}
            {registry.editLink && (
              <span className="text-green-600">✓ Kurgu</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
          {showApprove && onApprove && (
            <button
              onClick={onApprove}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              ✓ Onayla
            </button>
          )}
          {showPayment && onMarkPaid && (
            <button
              onClick={onMarkPaid}
              className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
            >
              💰 Ödendi
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-red-500 hover:bg-red-50 rounded"
            title="Sil"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
