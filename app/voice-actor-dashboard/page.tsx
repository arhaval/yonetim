'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, FileText, User, Calendar, CheckCircle, Clock, Download, DollarSign, Mic, Eye, Heart, MessageCircle, Share2, Bookmark, Video, Image, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

export default function VoiceActorDashboardPage() {
  const router = useRouter()
  const [voiceActor, setVoiceActor] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [pendingTasks, setPendingTasks] = useState<any[]>([]) // Ses bekleyen işler
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [voiceLink, setVoiceLink] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editors, setEditors] = useState<any[]>([])
  const [selectedEditorId, setSelectedEditorId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/voice-actor-auth/me', {
        cache: 'default', // Browser cache kullan
      })
      const data = await res.json()

      if (!data.voiceActor) {
        router.push('/voice-actor-login')
        return
      }

      setVoiceActor(data.voiceActor)
      loadContents(data.voiceActor.id)
    } catch (error) {
      router.push('/voice-actor-login')
    } finally {
      setLoading(false)
    }
  }

  const loadContents = async (voiceActorId: string) => {
    try {
      const res = await fetch('/api/voice-actor/contents', {
        cache: 'default', // Browser cache kullan
      })
      const data = await res.json()
      if (res.ok) {
        setContents(data)
      }

      // Editörleri yükle
      const editorsRes = await fetch('/api/team')
      if (editorsRes.ok) {
        const editorsData = await editorsRes.json()
        setEditors(Array.isArray(editorsData) ? editorsData : [])
      }

      // Ses bekleyen işleri yükle (ContentRegistry'den)
      const tasksRes = await fetch('/api/content-registry?status=SCRIPT_READY')
      const tasksData = await tasksRes.json()
      if (tasksRes.ok) {
        // Sadece bu seslendirmene atanan işleri filtrele
        const myTasks = (tasksData.registries || []).filter(
          (task: any) => task.voiceActor?.id === voiceActorId
        )
        setPendingTasks(myTasks)
      }
    } catch (error) {
      console.error('Error loading contents:', error)
    }
  }

  // Ses linkini gönder ve editöre düşür
  const handleSubmitVoice = async () => {
    if (!selectedTask || !voiceLink.trim()) {
      alert('Ses linki boş olamaz')
      return
    }

    if (!selectedEditorId) {
      alert('Lütfen bir editör seçin')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/content-registry/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceLink: voiceLink,
          editorId: selectedEditorId,
          status: 'VOICE_READY', // Editöre düşsün
        }),
      })

      if (res.ok) {
        alert('Ses başarıyla gönderildi ve editöre iletildi!')
        setShowTaskModal(false)
        setSelectedTask(null)
        setVoiceLink('')
        setSelectedEditorId('')
        loadContents(voiceActor.id)
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

  const handleLogout = async () => {
    await fetch('/api/voice-actor-auth/logout', { method: 'POST' })
    router.push('/voice-actor-login')
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

  if (!voiceActor) {
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
              {voiceActor.profilePhoto ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-2 ring-pink-200">
                  <img
                    src={voiceActor.profilePhoto}
                    alt={voiceActor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg ring-2 ring-pink-200">
                  <Mic className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Hoş geldiniz, {voiceActor.name}!
                </h1>
                <p className="mt-2 text-gray-600">Seslendirme metinlerinizi buradan görebilirsiniz</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/request-extra-work')}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Ekstra İş Talebi
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

        {/* Bekleyen İşler - Ses Teslim Edilecek */}
        {pendingTasks.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 mb-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mic className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-800">Ses Bekleyen İşler</h2>
                <p className="text-sm text-blue-600">{pendingTasks.length} adet iş sizden ses bekliyor</p>
              </div>
            </div>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 transition cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task)
                    setVoiceLink('')
                    setSelectedEditorId(task.editor?.id || '')
                    setShowTaskModal(true)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        {task.voiceDeadline && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Teslim: {format(new Date(task.voiceDeadline), 'dd MMM', { locale: tr })}
                          </span>
                        )}
                        {task.creator && (
                          <span>✍️ {task.creator.name}</span>
                        )}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                      Ses Teslim Et
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scripts Link */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Tüm Seslendirmelerim
                </h2>
                <p className="text-sm text-gray-600 mt-1">Size atanan seslendirme metinlerini görüntüleyin ve yönetin</p>
              </div>
              <Link
                href="/my-assignments"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Tümünü Görüntüle
              </Link>
            </div>
          </div>
        </div>

        {/* Payments Link */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Ödemelerim
                </h2>
                <p className="text-sm text-gray-600 mt-1">Ödenen ve bekleyen ödemelerinizi görüntüleyin</p>
              </div>
              <Link
                href="/voice-actor-payments"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Ödemelerimi Görüntüle
              </Link>
            </div>
          </div>
        </div>

        {/* Contents List - Tablo Formatı */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Tüm İçerikler</h2>
            <p className="text-sm text-gray-600 mt-1">Admin panelinden güncellenen tüm içerikler</p>
          </div>
          {contents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium">Henüz içerik bulunmuyor</p>
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
                        onClick={() => window.location.href = `/content/${content.id}`}
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

      {/* Ses Teslim Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">{selectedTask.title}</h3>
              <p className="text-sm text-gray-500 mt-1">Seslendirmeyi tamamlayın ve editöre gönderin</p>
            </div>
            <div className="p-6 space-y-4">
              {/* Metin Gösterimi */}
              {selectedTask.scriptText && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">Seslendirme Metni:</p>
                  <div 
                    className="text-sm text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedTask.scriptText }}
                  />
                </div>
              )}

              {selectedTask.notes && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-1">Notlar:</p>
                  <p className="text-sm text-blue-700">{selectedTask.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ses Linki *
                </label>
                <input
                  type="url"
                  value={voiceLink}
                  onChange={(e) => setVoiceLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ses dosyasını Google Drive, Dropbox vb. yükleyip linkini yapıştırın
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Editör *
                </label>
                <select
                  value={selectedEditorId}
                  onChange={(e) => setSelectedEditorId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Editör seçin</option>
                  {editors.map((editor) => (
                    <option key={editor.id} value={editor.id}>{editor.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Kurguyu yapacak editörü seçin. Ses teslim edildiğinde iş otomatik olarak editöre düşecek.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  {selectedTask.creator && (
                    <span>✍️ Metin: <strong>{selectedTask.creator.name}</strong></span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowTaskModal(false)
                      setSelectedTask(null)
                      setVoiceLink('')
                      setSelectedEditorId('')
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSubmitVoice}
                    disabled={submitting || !voiceLink.trim() || !selectedEditorId}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Gönderiliyor...' : 'Sesi Teslim Et'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
