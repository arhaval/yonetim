'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { toast } from 'sonner'
import { Plus, X, Trash2, Check, FileText, Mic, Video, Clock, CheckCircle, DollarSign, AlertTriangle, Calendar } from 'lucide-react'

// Durum bilgileri
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  WAITING_SCRIPT: { label: 'Metin Bekliyor', color: 'text-pink-600', bg: 'bg-pink-100' },
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
  scriptText?: string
  status: string
  voiceLink?: string
  editLink?: string
  scriptDeadline?: string
  voiceDeadline?: string
  editDeadline?: string
  creator?: { id: string; name: string }
  voiceActor?: { id: string; name: string }
  editor?: { id: string; name: string }
  createdAt: string
}

interface Person {
  id: string
  name: string
}

// Deadline kontrolü
function getDeadlineStatus(deadline?: string): { isOverdue: boolean; daysLeft: number; label: string } {
  if (!deadline) return { isOverdue: false, daysLeft: 999, label: '' }
  
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return { isOverdue: true, daysLeft: diffDays, label: `${Math.abs(diffDays)} gün gecikti!` }
  } else if (diffDays === 0) {
    return { isOverdue: false, daysLeft: 0, label: 'Bugün!' }
  } else if (diffDays === 1) {
    return { isOverdue: false, daysLeft: 1, label: 'Yarın' }
  } else {
    return { isOverdue: false, daysLeft: diffDays, label: `${diffDays} gün kaldı` }
  }
}

export default function ContentRegistryPage() {
  const [registries, setRegistries] = useState<ContentRegistry[]>([])
  const [creators, setCreators] = useState<Person[]>([])
  const [voiceActors, setVoiceActors] = useState<Person[]>([])
  const [streamers, setStreamers] = useState<Person[]>([]) // Yayıncılar da seslendirmen olabilir
  const [editors, setEditors] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showNewModal, setShowNewModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentRegistry | null>(null)
  
  // Form
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    creatorId: '',
    voiceActorId: '', // format: "va:id" veya "st:id"
    editorId: '',
    scriptDeadline: '',
    voiceDeadline: '',
    editDeadline: '',
    assignToCreator: false, // İçerik üreticisine metin yazdır
  })
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
      const [regRes, creatorsRes, voiceRes, streamersRes, teamRes] = await Promise.all([
        fetch('/api/content-registry'),
        fetch('/api/content-creators'),
        fetch('/api/voice-actors'),
        fetch('/api/streamers'),
        fetch('/api/team'),
      ])

      if (regRes.ok) {
        const data = await regRes.json()
        setRegistries(data.registries || [])
      }
      if (creatorsRes.ok) {
        const data = await creatorsRes.json()
        setCreators(Array.isArray(data) ? data : [])
      }
      if (voiceRes.ok) {
        const data = await voiceRes.json()
        setVoiceActors(Array.isArray(data) ? data : [])
      }
      if (streamersRes.ok) {
        const data = await streamersRes.json()
        setStreamers(Array.isArray(data) ? data : [])
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
    // İçerik üreticisine atanacaksa sadece başlık gerekli
    if (formData.assignToCreator) {
      if (!formData.title.trim()) {
        toast.error('Başlık gerekli')
        return
      }
      if (!formData.creatorId) {
        toast.error('İçerik üreticisi seçmelisiniz')
        return
      }
    } else {
      if (!formData.title.trim() || !formData.description.trim()) {
        toast.error('Başlık ve metin gerekli')
        return
      }
    }

    setSubmitting(true)
    try {
      // Seslendirmen tipini ve ID'sini ayır (va:id veya st:id formatında)
      let voiceActorId = undefined
      let voiceActorType = undefined
      if (formData.voiceActorId) {
        const [type, id] = formData.voiceActorId.split(':')
        voiceActorId = id
        voiceActorType = type === 'st' ? 'streamer' : 'voiceActor'
      }

      // Durumu belirle
      let status = 'DRAFT'
      if (formData.assignToCreator && formData.creatorId) {
        status = 'WAITING_SCRIPT' // İçerik üreticisi metin yazacak
      } else if (voiceActorId) {
        status = 'SCRIPT_READY' // Direkt seslendirmene gidecek
      }

      const res = await fetch('/api/content-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.assignToCreator ? '' : formData.description,
          creatorId: formData.creatorId || undefined,
          voiceActorId: voiceActorType === 'voiceActor' ? voiceActorId : undefined,
          streamerId: voiceActorType === 'streamer' ? voiceActorId : undefined,
          editorId: formData.editorId || undefined,
          scriptDeadline: formData.scriptDeadline || undefined,
          voiceDeadline: formData.voiceDeadline || undefined,
          editDeadline: formData.editDeadline || undefined,
          status,
        }),
      })

      if (res.ok) {
        toast.success('İçerik oluşturuldu')
        setShowNewModal(false)
        setFormData({ 
          title: '', description: '', creatorId: '', voiceActorId: '', editorId: '', 
          scriptDeadline: '', voiceDeadline: '', editDeadline: '', assignToCreator: false 
        })
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
    active: registries.filter(r => ['WAITING_SCRIPT', 'DRAFT', 'SCRIPT_READY', 'VOICE_READY', 'EDITING'].includes(r.status)),
    review: registries.filter(r => r.status === 'REVIEW'),
    done: registries.filter(r => ['PUBLISHED', 'ARCHIVED'].includes(r.status)),
  }

  // İstatistikler
  const stats = {
    total: registries.length,
    active: groups.active.length,
    review: groups.review.length,
    done: groups.done.length,
    overdue: registries.filter(r => {
      if (r.status === 'SCRIPT_READY' && r.voiceDeadline) {
        return getDeadlineStatus(r.voiceDeadline).isOverdue
      }
      if (['VOICE_READY', 'EDITING'].includes(r.status) && r.editDeadline) {
        return getDeadlineStatus(r.editDeadline).isOverdue
      }
      return false
    }).length,
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

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Toplam</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-xs text-gray-500">Devam Eden</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold text-amber-600">{stats.review}</p>
            <p className="text-xs text-gray-500">Onay Bekliyor</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-2xl font-bold text-green-600">{stats.done}</p>
            <p className="text-xs text-gray-500">Tamamlanan</p>
          </div>
          {stats.overdue > 0 && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-4">
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-xs text-red-600">Geciken!</p>
            </div>
          )}
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

              {/* İçerik Üreticisine Ata Toggle */}
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.assignToCreator}
                    onChange={e => setFormData({ ...formData, assignToCreator: e.target.checked })}
                    className="w-5 h-5 text-pink-600 rounded"
                  />
                  <div>
                    <span className="font-medium text-pink-800">İçerik üreticisi metin yazsın</span>
                    <p className="text-xs text-pink-600">İçerik üreticisi metni yazıp gönderecek, sonra seslendirmene düşecek</p>
                  </div>
                </label>
              </div>

              {/* İçerik Üreticisi Seçimi */}
              {formData.assignToCreator && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İçerik Üreticisi *</label>
                    <select
                      value={formData.creatorId}
                      onChange={e => setFormData({ ...formData, creatorId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg border-pink-300 focus:ring-pink-500"
                    >
                      <option value="">Seçiniz</option>
                      {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metin Teslim Tarihi</label>
                    <input
                      type="date"
                      value={formData.scriptDeadline}
                      onChange={e => setFormData({ ...formData, scriptDeadline: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Metin Alanı - Sadece içerik üreticisine atanmıyorsa */}
              {!formData.assignToCreator && (
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
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seslendirmen</label>
                  <select
                    value={formData.voiceActorId}
                    onChange={e => setFormData({ ...formData, voiceActorId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seçiniz</option>
                    <optgroup label="🎙️ Seslendirmenler">
                      {voiceActors.map(v => <option key={`va-${v.id}`} value={`va:${v.id}`}>{v.name}</option>)}
                    </optgroup>
                    <optgroup label="📺 Yayıncılar">
                      {streamers.map(s => <option key={`st-${s.id}`} value={`st:${s.id}`}>{s.name}</option>)}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ses Teslim Tarihi</label>
                  <input
                    type="date"
                    value={formData.voiceDeadline}
                    onChange={e => setFormData({ ...formData, voiceDeadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kurgu Teslim Tarihi</label>
                  <input
                    type="date"
                    value={formData.editDeadline}
                    onChange={e => setFormData({ ...formData, editDeadline: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
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
                  {selectedItem.voiceDeadline && (
                    <DeadlineBadge deadline={selectedItem.voiceDeadline} status={selectedItem.status} type="voice" />
                  )}
                </div>
                <div>
                  <span className="text-gray-500">Editör:</span>
                  <p className="font-medium">{selectedItem.editor?.name || '-'}</p>
                  {selectedItem.editDeadline && (
                    <DeadlineBadge deadline={selectedItem.editDeadline} status={selectedItem.status} type="edit" />
                  )}
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

// Modal Komponenti
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

// Deadline Badge
function DeadlineBadge({ deadline, status, type }: { deadline: string; status: string; type: 'voice' | 'edit' }) {
  // Sadece ilgili durumda göster
  if (type === 'voice' && status !== 'SCRIPT_READY') return null
  if (type === 'edit' && !['VOICE_READY', 'EDITING'].includes(status)) return null
  
  const { isOverdue, label } = getDeadlineStatus(deadline)
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs mt-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
      {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
      {label}
    </span>
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
  
  // Deadline kontrolü
  let deadlineInfo = null
  if (item.status === 'SCRIPT_READY' && item.voiceDeadline) {
    deadlineInfo = getDeadlineStatus(item.voiceDeadline)
  } else if (['VOICE_READY', 'EDITING'].includes(item.status) && item.editDeadline) {
    deadlineInfo = getDeadlineStatus(item.editDeadline)
  }

  return (
    <div 
      className={`p-3 rounded-lg cursor-pointer transition ${deadlineInfo?.isOverdue ? 'bg-red-50 hover:bg-red-100 border border-red-200' : 'bg-gray-50 hover:bg-gray-100'}`}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2 py-0.5 rounded text-xs ${status.bg} ${status.color} mb-1`}>
            {status.label}
          </span>
          <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
            {item.creator && <span>✍️ {item.creator.name}</span>}
            {item.voiceActor && <span>🎙️ {item.voiceActor.name}</span>}
            {item.editor && <span>🎬 {item.editor.name}</span>}
          </div>
          <div className="flex gap-2 mt-1">
            {item.voiceLink && <span className="text-xs text-green-600">✓ Ses</span>}
            {item.editLink && <span className="text-xs text-green-600">✓ Kurgu</span>}
          </div>
          {deadlineInfo && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${deadlineInfo.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {deadlineInfo.isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {deadlineInfo.label}
            </div>
          )}
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
