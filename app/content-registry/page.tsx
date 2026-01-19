'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { toast } from 'sonner'
import { Plus, X, ExternalLink, Trash2, Check, FileText, Mic, Video, Clock, CheckCircle, DollarSign } from 'lucide-react'

// Durum bilgileri - basitleştirilmiş
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Taslak', color: 'text-gray-600', bg: 'bg-gray-100' },
  SCRIPT_READY: { label: 'Ses Bekliyor', color: 'text-blue-600', bg: 'bg-blue-100' },
  VOICE_READY: { label: 'Kurgu Bekliyor', color: 'text-purple-600', bg: 'bg-purple-100' },
  EDITING: { label: 'Kurgu Yapılıyor', color: 'text-orange-600', bg: 'bg-orange-100' },
  REVIEW: { label: 'Onay Bekliyor', color: 'text-amber-600', bg: 'bg-amber-100' },
  PUBLISHED: { label: 'Tamamlandı', color: 'text-green-600', bg: 'bg-green-100' },
  ARCHIVED: { label: 'Arşiv', color: 'text-gray-500', bg: 'bg-gray-50' },
}

interface ContentRegistry {
  id: string
  title: string
  description?: string
  status: string
  voiceLink?: string
  editLink?: string
  voiceActor?: { id: string; name: string }
  editor?: { id: string; name: string }
  createdAt: string
}

interface Person {
  id: string
  name: string
}

export default function ContentRegistryPage() {
  const [registries, setRegistries] = useState<ContentRegistry[]>([])
  const [voiceActors, setVoiceActors] = useState<Person[]>([])
  const [editors, setEditors] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showNewModal, setShowNewModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentRegistry | null>(null)
  
  // Form
  const [formData, setFormData] = useState({ title: '', description: '', voiceActorId: '', editorId: '' })
  const [linkInput, setLinkInput] = useState('')
  const [linkType, setLinkType] = useState<'voice' | 'edit'>('voice')
  const [voicePrice, setVoicePrice] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [regRes, voiceRes, teamRes] = await Promise.all([
        fetch('/api/content-registry'),
        fetch('/api/voice-actors'),
        fetch('/api/team'),
      ])

      if (regRes.ok) {
        const data = await regRes.json()
        setRegistries(data.registries || [])
      }
      if (voiceRes.ok) {
        const data = await voiceRes.json()
        setVoiceActors(Array.isArray(data) ? data : [])
      }
      if (teamRes.ok) {
        const data = await teamRes.json()
        setEditors(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  // Yeni içerik oluştur
  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Başlık ve metin gerekli')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/content-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: formData.voiceActorId ? 'SCRIPT_READY' : 'DRAFT',
        }),
      })

      if (res.ok) {
        toast.success('İçerik oluşturuldu')
        setShowNewModal(false)
        setFormData({ title: '', description: '', voiceActorId: '', editorId: '' })
        fetchData()
      } else {
        toast.error('Oluşturulamadı')
      }
    } catch {
      toast.error('Hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  // Link ekle
  const handleAddLink = async () => {
    if (!selectedItem || !linkInput.trim()) return

    try {
      const updateData: any = { [linkType === 'voice' ? 'voiceLink' : 'editLink']: linkInput }
      
      // Durumu güncelle
      if (linkType === 'voice' && selectedItem.editor) {
        updateData.status = 'VOICE_READY'
      } else if (linkType === 'edit') {
        updateData.status = 'REVIEW'
      }

      const res = await fetch(`/api/content-registry/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (res.ok) {
        toast.success('Link eklendi')
        setLinkInput('')
        setShowDetailModal(false)
        fetchData()
      }
    } catch {
      toast.error('Hata oluştu')
    }
  }

  // Onayla ve öde
  const handleApprove = async () => {
    if (!selectedItem) return

    setSubmitting(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const vPrice = parseFloat(voicePrice) || 0
      const ePrice = parseFloat(editPrice) || 0

      // Ödemeleri kaydet
      if (vPrice > 0 && selectedItem.voiceActor) {
        await fetch('/api/payouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voiceActorId: selectedItem.voiceActor.id,
            amount: vPrice,
            date: today,
            category: 'seslendirme',
            description: `Seslendirme: ${selectedItem.title}`,
            payoutStatus: 'paid',
          }),
        })
      }

      if (ePrice > 0 && selectedItem.editor) {
        await fetch('/api/payouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamMemberId: selectedItem.editor.id,
            amount: ePrice,
            date: today,
            category: 'kurgu',
            description: `Kurgu: ${selectedItem.title}`,
            payoutStatus: 'paid',
          }),
        })
      }

      // Durumu güncelle
      await fetch(`/api/content-registry/${selectedItem.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      })

      toast.success('Onaylandı ve ödemeler kaydedildi')
      setShowPaymentModal(false)
      setVoicePrice('')
      setEditPrice('')
      fetchData()
    } catch {
      toast.error('Hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  // Sil
  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch(`/api/content-registry/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Silindi')
        fetchData()
      }
    } catch {
      toast.error('Silinemedi')
    }
  }

  // Gruplama
  const groups = {
    active: registries.filter(r => ['DRAFT', 'SCRIPT_READY', 'VOICE_READY', 'EDITING'].includes(r.status)),
    review: registries.filter(r => r.status === 'REVIEW'),
    done: registries.filter(r => ['PUBLISHED', 'ARCHIVED'].includes(r.status)),
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">İçerik Merkezi</h1>
            <p className="text-gray-500 text-sm mt-1">Metin → Ses → Kurgu → Onay</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Yeni İçerik
          </button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Devam Eden */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b bg-blue-50 rounded-t-xl">
              <h2 className="font-semibold text-blue-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Devam Eden ({groups.active.length})
              </h2>
            </div>
            <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
              {groups.active.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Boş</p>
              ) : (
                groups.active.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onOpen={() => { setSelectedItem(item); setShowDetailModal(true) }}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Onay Bekliyor */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b bg-amber-50 rounded-t-xl">
              <h2 className="font-semibold text-amber-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Onay Bekliyor ({groups.review.length})
              </h2>
            </div>
            <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
              {groups.review.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Boş</p>
              ) : (
                groups.review.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onOpen={() => { setSelectedItem(item); setShowDetailModal(true) }}
                    onDelete={() => handleDelete(item.id)}
                    onApprove={() => { setSelectedItem(item); setShowPaymentModal(true) }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Tamamlanan */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b bg-green-50 rounded-t-xl">
              <h2 className="font-semibold text-green-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Tamamlanan ({groups.done.length})
              </h2>
            </div>
            <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
              {groups.done.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Boş</p>
              ) : (
                groups.done.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onOpen={() => { setSelectedItem(item); setShowDetailModal(true) }}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Yeni İçerik Modal */}
        {showNewModal && (
          <Modal title="Yeni İçerik" onClose={() => setShowNewModal(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Video başlığı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metin *</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder="Seslendirmenin okuyacağı metin..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seslendirmen</label>
                  <select
                    value={formData.voiceActorId}
                    onChange={e => setFormData({ ...formData, voiceActorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seçiniz</option>
                    {voiceActors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Editör</label>
                  <select
                    value={formData.editorId}
                    onChange={e => setFormData({ ...formData, editorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seçiniz</option>
                    {editors.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900">
                  İptal
                </button>
                <button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : 'Oluştur'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Detay Modal */}
        {showDetailModal && selectedItem && (
          <Modal title={selectedItem.title} onClose={() => setShowDetailModal(false)}>
            <div className="space-y-4">
              <div className={`inline-block px-3 py-1 rounded-full text-sm ${STATUS_CONFIG[selectedItem.status]?.bg} ${STATUS_CONFIG[selectedItem.status]?.color}`}>
                {STATUS_CONFIG[selectedItem.status]?.label}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Metin</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedItem.description || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Seslendirmen:</span>
                  <p className="font-medium">{selectedItem.voiceActor?.name || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Editör:</span>
                  <p className="font-medium">{selectedItem.editor?.name || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Ses Linki:</span>
                  {selectedItem.voiceLink ? (
                    <a href={selectedItem.voiceLink} target="_blank" className="text-blue-600 hover:underline block truncate">
                      {selectedItem.voiceLink}
                    </a>
                  ) : <p className="text-gray-400">-</p>}
                </div>
                <div>
                  <span className="text-gray-500">Kurgu Linki:</span>
                  {selectedItem.editLink ? (
                    <a href={selectedItem.editLink} target="_blank" className="text-blue-600 hover:underline block truncate">
                      {selectedItem.editLink}
                    </a>
                  ) : <p className="text-gray-400">-</p>}
                </div>
              </div>

              {/* Link Ekleme */}
              {['SCRIPT_READY', 'VOICE_READY', 'EDITING'].includes(selectedItem.status) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Link Ekle</h4>
                  <div className="flex gap-2">
                    <select
                      value={linkType}
                      onChange={e => setLinkType(e.target.value as 'voice' | 'edit')}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="voice">Ses</option>
                      <option value="edit">Kurgu</option>
                    </select>
                    <input
                      type="url"
                      value={linkInput}
                      onChange={e => setLinkInput(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      placeholder="https://..."
                    />
                    <button
                      onClick={handleAddLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Ödeme Modal */}
        {showPaymentModal && selectedItem && (
          <Modal title="Onayla ve Öde" onClose={() => setShowPaymentModal(false)}>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                Ödeme yapılacak kişilerin fiyatlarını girin. Boş bırakırsanız ödeme kaydı oluşmaz.
              </p>

              {selectedItem.voiceActor && (
                <div className="flex items-center gap-3">
                  <Mic className="w-5 h-5 text-blue-600" />
                  <span className="flex-1">{selectedItem.voiceActor.name}</span>
                  <input
                    type="number"
                    value={voicePrice}
                    onChange={e => setVoicePrice(e.target.value)}
                    className="w-32 px-3 py-2 border rounded-lg text-right"
                    placeholder="0"
                  />
                  <span className="text-gray-500">₺</span>
                </div>
              )}

              {selectedItem.editor && (
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-purple-600" />
                  <span className="flex-1">{selectedItem.editor.name}</span>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    className="w-32 px-3 py-2 border rounded-lg text-right"
                    placeholder="0"
                  />
                  <span className="text-gray-500">₺</span>
                </div>
              )}

              {(voicePrice || editPrice) && (
                <div className="flex justify-between items-center pt-4 border-t font-semibold">
                  <span>Toplam:</span>
                  <span className="text-green-600">
                    {((parseFloat(voicePrice) || 0) + (parseFloat(editPrice) || 0)).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-gray-600">
                  İptal
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : 'Onayla'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  )
}

// Basit Modal Komponenti
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

// Kart Komponenti
function ItemCard({ 
  item, 
  onOpen, 
  onDelete, 
  onApprove 
}: { 
  item: ContentRegistry
  onOpen: () => void
  onDelete: () => void
  onApprove?: () => void
}) {
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.DRAFT

  return (
    <div 
      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2 py-0.5 rounded text-xs ${status.bg} ${status.color} mb-1`}>
            {status.label}
          </span>
          <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
          <div className="flex gap-2 mt-1 text-xs text-gray-500">
            {item.voiceActor && <span>🎙️ {item.voiceActor.name}</span>}
            {item.editor && <span>🎬 {item.editor.name}</span>}
          </div>
          <div className="flex gap-2 mt-1">
            {item.voiceLink && <span className="text-xs text-green-600">✓ Ses</span>}
            {item.editLink && <span className="text-xs text-green-600">✓ Kurgu</span>}
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {onApprove && (
            <button
              onClick={onApprove}
              className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
              title="Onayla"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
