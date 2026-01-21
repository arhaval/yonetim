'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut, Video, Image, Calendar, Eye, Heart, MessageCircle, Share2, Bookmark, FileText, Download, CheckCircle, Clock, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import RichTextEditor from '@/components/RichTextEditor'

export default function CreatorDashboardPage() {
  const router = useRouter()
  const [creator, setCreator] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [pendingTasks, setPendingTasks] = useState<any[]>([]) // Metin bekleyen işler
  const [myScripts, setMyScripts] = useState<any[]>([]) // Benim oluşturduğum metinler
  const [loading, setLoading] = useState(true)
  const [showScriptForm, setShowScriptForm] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [taskScriptText, setTaskScriptText] = useState('')
  const [scriptFormData, setScriptFormData] = useState({
    title: '',
    text: '',
    voiceActorId: '', // Seslendirmen seçimi
  })
  const [voiceActors, setVoiceActors] = useState<any[]>([])
  const [streamers, setStreamers] = useState<any[]>([])
  const [editors, setEditors] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/creator-auth/me')
      const data = await res.json()

      if (!data.creator) {
        router.push('/creator-login')
        return
      }

      setCreator(data.creator)
      loadContents(data.creator.id)
    } catch (error) {
      router.push('/creator-login')
    }
  }

  const loadContents = async (creatorId: string) => {
    try {
      // İçerikleri yükle
      const res = await fetch('/api/creator/content')
      const data = await res.json()
      if (res.ok) {
        setContents(data)
      }

      // Seslendirmen ve yayıncıları yükle
      const [voiceRes, streamersRes, editorsRes] = await Promise.all([
        fetch('/api/voice-actors'),
        fetch('/api/streamers'),
        fetch('/api/team'),
      ])
      if (voiceRes.ok) {
        const voiceData = await voiceRes.json()
        setVoiceActors(Array.isArray(voiceData) ? voiceData : [])
      }
      if (streamersRes.ok) {
        const streamersData = await streamersRes.json()
        setStreamers(Array.isArray(streamersData) ? streamersData : [])
      }
      if (editorsRes.ok) {
        const editorsData = await editorsRes.json()
        setEditors(Array.isArray(editorsData) ? editorsData : [])
      }

      // Metin bekleyen işleri yükle
      const tasksRes = await fetch('/api/content-registry?status=WAITING_SCRIPT')
      const tasksData = await tasksRes.json()
      if (tasksRes.ok) {
        // Sadece bu içerik üreticisine atanan işleri filtrele
        const myTasks = (tasksData.registries || []).filter(
          (task: any) => task.creator?.id === creatorId
        )
        setPendingTasks(myTasks)
      }

      // Benim oluşturduğum tüm metinleri yükle
      const allScriptsRes = await fetch('/api/content-registry')
      const allScriptsData = await allScriptsRes.json()
      if (allScriptsRes.ok) {
        // Sadece bu içerik üreticisinin oluşturduğu metinleri filtrele
        const scripts = (allScriptsData.registries || []).filter(
          (script: any) => script.creator?.id === creatorId
        )
        setMyScripts(scripts)
      }
    } catch (error) {
      console.error('Error loading contents:', error)
    } finally {
      setLoading(false)
    }
  }

  // Metin gönder
  const handleSubmitScript = async () => {
    if (!selectedTask || !taskScriptText.trim()) {
      alert('Metin boş olamaz')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/content-registry/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptText: taskScriptText,
          description: taskScriptText, // Aynı zamanda description'a da kaydet
          status: selectedTask.voiceActor ? 'SCRIPT_READY' : 'DRAFT', // Seslendirmen atanmışsa direkt ona düşsün
        }),
      })

      if (res.ok) {
        alert('Metin başarıyla gönderildi!')
        setShowTaskModal(false)
        setSelectedTask(null)
        setTaskScriptText('')
        loadContents(creator.id)
      } else {
        const data = await res.json()
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleScriptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!scriptFormData.title.trim() || !scriptFormData.text.trim()) {
      alert('Başlık ve metin gerekli')
      return
    }

    if (!scriptFormData.voiceActorId) {
      alert('Lütfen bir seslendirmen seçin')
      return
    }
    
    setSubmitting(true)

    try {
      // Seslendirmen tipini ve ID'sini ayır (va:id veya st:id formatında)
      const [type, id] = scriptFormData.voiceActorId.split(':')
      const isStreamer = type === 'st'

      // ContentRegistry'ye kaydet - içerik üreticisi kendi metnini oluşturuyor
      // Seslendirmen seçildiği için direkt SCRIPT_READY olarak başlıyor
      const res = await fetch('/api/content-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scriptFormData.title,
          description: scriptFormData.text,
          scriptText: scriptFormData.text,
          voiceActorId: isStreamer ? undefined : id,
          streamerId: isStreamer ? id : undefined,
          status: 'SCRIPT_READY', // Direkt seslendirmene düşsün
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Metin başarıyla oluşturuldu ve seslendirmene gönderildi!')
        setShowScriptForm(false)
        setScriptFormData({
          title: '',
          text: '',
          voiceActorId: '',
        })
        loadContents(creator.id)
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/creator-auth/logout', { method: 'POST' })
    router.push('/creator-login')
  }



  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!creator) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 bg-white overflow-hidden p-2">
                <img 
                  src="/arhaval-logo.png" 
                  alt="Arhaval Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    try {
                      const target = e.target as HTMLImageElement
                      if (target) {
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<span class="text-gray-900 font-bold text-xl">A</span>'
                          if (parent.style) {
                            parent.style.background = 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)'
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error handling image onError:', error)
                    }
                  }}
                />
              </div>
              {creator.profilePhoto ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-2 ring-indigo-200">
                  <img
                    src={creator.profilePhoto}
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-indigo-200">
                  <span className="text-white font-bold text-2xl">
                    {creator.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {creator.name}
                </h1>
                <p className="mt-1 text-gray-600">İçeriklerinizi buradan ekleyebilirsiniz</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/my-payment-requests')}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Ödeme Taleplerim
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        {/* Bekleyen İşler - Metin Yazılacak */}
        {pendingTasks.length > 0 && (
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl shadow-xl p-6 mb-6 border border-pink-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-pink-800">Metin Bekleyen İşler</h2>
                <p className="text-sm text-pink-600">{pendingTasks.length} adet iş sizden metin bekliyor</p>
              </div>
            </div>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl p-4 border border-pink-200 hover:border-pink-400 transition cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task)
                    setTaskScriptText('')
                    setShowTaskModal(true)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        {task.scriptDeadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Teslim: {format(new Date(task.scriptDeadline), 'dd MMM', { locale: tr })}
                          </span>
                        )}
                        {task.voiceActor && (
                          <span>🎙️ {task.voiceActor.name}</span>
                        )}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition text-sm font-medium">
                      Metin Yaz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!showScriptForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowScriptForm(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl hover:from-pink-700 hover:to-rose-700 transition-all duration-200"
            >
              <FileText className="w-5 h-5 mr-2" />
              Yeni Metin Oluştur
            </button>
          </div>
        )}

        {/* Add Script Form */}
        {showScriptForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni Seslendirme Metni Oluştur</h2>
            <form onSubmit={handleScriptSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlık *
                </label>
                <input
                  type="text"
                  required
                  value={scriptFormData.title}
                  onChange={(e) => setScriptFormData({ ...scriptFormData, title: e.target.value })}
                  placeholder="Metin başlığı"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metin *
                </label>
                <RichTextEditor
                  value={scriptFormData.text}
                  onChange={(value) => setScriptFormData({ ...scriptFormData, text: value })}
                  placeholder="Seslendirme metnini buraya yazın..."
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">Bu metin seslendirmen tarafından görülecektir. Yazı stili, boyutu ve kalın/ince ayarlarını kullanabilirsiniz.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seslendirmen *
                </label>
                <select
                  value={scriptFormData.voiceActorId}
                  onChange={(e) => setScriptFormData({ ...scriptFormData, voiceActorId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Seslendirmen seçin</option>
                  {voiceActors.length > 0 && (
                    <optgroup label="🎙️ Seslendirmenler">
                      {voiceActors.map((v) => (
                        <option key={`va-${v.id}`} value={`va:${v.id}`}>{v.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {streamers.length > 0 && (
                    <optgroup label="📺 Yayıncılar">
                      {streamers.map((s) => (
                        <option key={`st-${s.id}`} value={`st:${s.id}`}>{s.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">Metni okuyacak seslendirmeni seçin. Metin direkt olarak seçtiğiniz kişiye gönderilecek.</p>
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowScriptForm(false)
                    setScriptFormData({
                      title: '',
                      text: '',
                      voiceActorId: '',
                    })
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Kaydediliyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Metinlerim - İçerik Üreticisinin Oluşturduğu Metinler */}
        {myScripts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-xl font-bold text-gray-900">Metinlerim ({myScripts.length})</h2>
              <p className="text-sm text-gray-600 mt-1">Oluşturduğunuz metinlerin durumunu takip edin</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {myScripts.map((script) => {
                const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
                  WAITING_SCRIPT: { label: 'Metin Bekliyor', color: 'text-pink-600', bg: 'bg-pink-100' },
                  DRAFT: { label: 'Taslak', color: 'text-gray-600', bg: 'bg-gray-100' },
                  SCRIPT_READY: { label: 'Ses Bekliyor', color: 'text-blue-600', bg: 'bg-blue-100' },
                  VOICE_READY: { label: 'Kurgu Bekliyor', color: 'text-purple-600', bg: 'bg-purple-100' },
                  EDITING: { label: 'Kurgu Yapılıyor', color: 'text-orange-600', bg: 'bg-orange-100' },
                  REVIEW: { label: 'Onay Bekliyor', color: 'text-amber-600', bg: 'bg-amber-100' },
                  PUBLISHED: { label: 'Tamamlandı', color: 'text-green-600', bg: 'bg-green-100' },
                  ARCHIVED: { label: 'Arşiv', color: 'text-gray-500', bg: 'bg-gray-50' },
                }
                const status = statusConfig[script.status] || statusConfig.DRAFT
                
                return (
                  <div key={script.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{script.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                          {script.voiceActor && (
                            <span>🎙️ {script.voiceActor.name}</span>
                          )}
                          {script.editor && (
                            <span>🎬 {script.editor.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {script.voiceLink && <span className="text-xs text-green-600">✓ Ses</span>}
                        {script.editLink && <span className="text-xs text-green-600">✓ Kurgu</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Metin Yazma Modal */}
        {showTaskModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">{selectedTask.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Bu içerik için seslendirme metni yazın</p>
              </div>
              <div className="p-6 space-y-4">
                {selectedTask.notes && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-1">Admin Notları:</p>
                    <p className="text-sm text-blue-700">{selectedTask.notes}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seslendirme Metni *
                  </label>
                  <RichTextEditor
                    value={taskScriptText}
                    onChange={setTaskScriptText}
                    placeholder="Seslendirmenin okuyacağı metni buraya yazın..."
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Bu metin seslendirmen tarafından okunacak. Yazı stili, boyutu ve kalın/ince ayarlarını kullanabilirsiniz.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    {selectedTask.voiceActor && (
                      <span>🎙️ Seslendirmen: <strong>{selectedTask.voiceActor.name}</strong></span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowTaskModal(false)
                        setSelectedTask(null)
                        setTaskScriptText('')
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSubmitScript}
                      disabled={submitting || !taskScriptText.trim()}
                      className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Gönderiliyor...' : 'Metni Gönder'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contents List - Tablo Formatı */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Tüm İçerikler</h2>
            <p className="text-sm text-gray-600 mt-1">Admin panelinden güncellenen tüm içerikler</p>
          </div>
            {contents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium">Henüz içerik eklenmemiş</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İçerik Üreticisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Görüntülenme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beğeni
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yorum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paylaşım
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kaydetme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contents.map((content) => {
                const contentType = content.type === 'shorts' ? 'Shorts' : content.type === 'reel' ? 'Reels' : content.type === 'post' ? 'Gönderi' : 'Video'
                    const formatNumber = (num: number) => {
                      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
                      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
                      return num.toString()
                    }
                
                return (
                      <tr
                        key={content.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/content/${content.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={content.title}>
                              {content.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              content.platform === 'YouTube' 
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {content.platform}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              content.type === 'shorts' || content.type === 'reel'
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {contentType}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {content.creator?.name || content.creatorName || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatNumber(content.views || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatNumber(content.likes || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatNumber(content.comments || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatNumber(content.shares || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatNumber(content.saves || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                          {format(new Date(content.publishDate), 'dd MMM yyyy', { locale: tr })}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
                          </div>
                        )}
        </div>
      </div>
    </div>
  )
}

