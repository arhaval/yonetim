'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  User, FileText, Clock, CheckCircle, DollarSign, Link as LinkIcon, 
  ExternalLink, Mic, Video, Calendar, AlertTriangle, LogOut
} from 'lucide-react'
import Link from 'next/link'

interface ContentItem {
  id: string
  title: string
  description?: string
  status: string
  voiceLink?: string
  editLink?: string
  voiceDeadline?: string
  editDeadline?: string
  voiceActor?: { id: string; name: string }
  editor?: { id: string; name: string }
  createdAt: string
}

interface UserInfo {
  id: string
  name: string
  email: string
  role: 'voice-actor' | 'team' | 'admin'
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Taslak', color: 'text-gray-600', bg: 'bg-gray-100' },
  SCRIPT_READY: { label: 'Ses Bekliyor', color: 'text-blue-600', bg: 'bg-blue-100' },
  VOICE_READY: { label: 'Kurgu Bekliyor', color: 'text-purple-600', bg: 'bg-purple-100' },
  EDITING: { label: 'Kurgu Yapılıyor', color: 'text-orange-600', bg: 'bg-orange-100' },
  REVIEW: { label: 'Onay Bekliyor', color: 'text-amber-600', bg: 'bg-amber-100' },
  PUBLISHED: { label: 'Tamamlandı', color: 'text-green-600', bg: 'bg-green-100' },
  ARCHIVED: { label: 'Arşiv', color: 'text-gray-500', bg: 'bg-gray-50' },
}

export default function MyPanelPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [linkInput, setLinkInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Cookie'den kullanıcı bilgilerini al
      const voiceActorId = document.cookie.split('; ').find(row => row.startsWith('voice-actor-id='))?.split('=')[1]
      const teamMemberId = document.cookie.split('; ').find(row => row.startsWith('user-id='))?.split('=')[1]
      const userRole = document.cookie.split('; ').find(row => row.startsWith('user-role='))?.split('=')[1]
      
      if (voiceActorId) {
        // Seslendirmen olarak giriş yapmış
        const res = await fetch(`/api/voice-actors/${voiceActorId}`)
        if (res.ok) {
          const data = await res.json()
          setUser({ id: voiceActorId, name: data.name, email: data.email, role: 'voice-actor' })
          fetchMyContents(voiceActorId, 'voice-actor')
        }
      } else if (teamMemberId && userRole !== 'admin') {
        // Ekip üyesi olarak giriş yapmış
        const res = await fetch(`/api/team/${teamMemberId}`)
        if (res.ok) {
          const data = await res.json()
          setUser({ id: teamMemberId, name: data.name, email: data.email, role: 'team' })
          fetchMyContents(teamMemberId, 'team')
        }
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error('Auth check error:', err)
      setLoading(false)
    }
  }

  const fetchMyContents = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/content-registry')
      if (res.ok) {
        const data = await res.json()
        const allContents = data.registries || []
        
        // Kullanıcıya atanan içerikleri filtrele
        const myContents = allContents.filter((c: ContentItem) => {
          if (role === 'voice-actor') {
            return c.voiceActor?.id === userId
          } else {
            return c.editor?.id === userId
          }
        })
        
        setContents(myContents)
      }
    } catch (err) {
      toast.error('İçerikler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleAddLink = async () => {
    if (!selectedItem || !linkInput.trim() || !user) return

    setSubmitting(true)
    try {
      const isVoiceActor = user.role === 'voice-actor'
      const updateData: any = {}
      
      if (isVoiceActor) {
        updateData.voiceLink = linkInput
        if (selectedItem.editor) {
          updateData.status = 'VOICE_READY'
        }
      } else {
        updateData.editLink = linkInput
        updateData.status = 'REVIEW'
      }

      const res = await fetch(`/api/content-registry/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (res.ok) {
        toast.success('Link eklendi!')
        setLinkInput('')
        setSelectedItem(null)
        fetchMyContents(user.id, user.role)
      } else {
        toast.error('Link eklenemedi')
      }
    } catch {
      toast.error('Hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'voice-actor-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Giriş Yapılmadı</h1>
          <p className="text-gray-500 mb-6">Paneli görmek için giriş yapmanız gerekiyor.</p>
          <div className="space-y-3">
            <Link
              href="/voice-actor-login"
              className="block w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
            >
              Seslendirmen Girişi
            </Link>
            <Link
              href="/team-login"
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Ekip Üyesi Girişi
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isVoiceActor = user.role === 'voice-actor'
  
  // İçerikleri grupla
  const myPending = contents.filter(c => {
    if (isVoiceActor) {
      return c.status === 'SCRIPT_READY' && !c.voiceLink
    } else {
      return ['VOICE_READY', 'EDITING'].includes(c.status) && !c.editLink
    }
  })
  
  const myCompleted = contents.filter(c => {
    if (isVoiceActor) {
      return c.voiceLink
    } else {
      return c.editLink
    }
  })

  const stats = {
    total: contents.length,
    pending: myPending.length,
    completed: myCompleted.length,
    overdue: myPending.filter(c => {
      const deadline = isVoiceActor ? c.voiceDeadline : c.editDeadline
      return deadline && getDeadlineStatus(deadline).isOverdue
    }).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${isVoiceActor ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-indigo-600'} flex items-center justify-center`}>
                {isVoiceActor ? <Mic className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">{isVoiceActor ? 'Seslendirmen' : 'Editör'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Toplam İş</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Bekleyen</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500">Tamamlanan</p>
          </div>
          {stats.overdue > 0 && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-xs text-red-600">Geciken!</p>
            </div>
          )}
        </div>

        {/* Bekleyen İşler */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className={`px-4 py-3 border-b ${isVoiceActor ? 'bg-amber-50' : 'bg-blue-50'}`}>
            <h2 className={`font-semibold ${isVoiceActor ? 'text-amber-800' : 'text-blue-800'} flex items-center gap-2`}>
              <Clock className="w-4 h-4" />
              Bekleyen İşlerim ({myPending.length})
            </h2>
          </div>
          <div className="divide-y">
            {myPending.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>Tüm işlerinizi tamamladınız! 🎉</p>
              </div>
            ) : (
              myPending.map(item => {
                const deadline = isVoiceActor ? item.voiceDeadline : item.editDeadline
                const deadlineInfo = deadline ? getDeadlineStatus(deadline) : null
                
                return (
                  <div 
                    key={item.id} 
                    className={`p-4 ${deadlineInfo?.isOverdue ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        )}
                        {deadlineInfo && (
                          <div className={`flex items-center gap-1 mt-2 text-sm ${deadlineInfo.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {deadlineInfo.isOverdue ? <AlertTriangle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                            {deadlineInfo.label}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => { setSelectedItem(item); setLinkInput('') }}
                        className={`px-4 py-2 ${isVoiceActor ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-sm font-medium transition`}
                      >
                        <LinkIcon className="w-4 h-4 inline mr-1" />
                        Link Ekle
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Tamamlanan İşler */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 border-b bg-green-50">
            <h2 className="font-semibold text-green-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Tamamladıklarım ({myCompleted.length})
            </h2>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {myCompleted.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Henüz tamamlanan iş yok
              </div>
            ) : (
              myCompleted.map(item => {
                const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.DRAFT
                const myLink = isVoiceActor ? item.voiceLink : item.editLink
                
                return (
                  <div key={item.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      {myLink && (
                        <a
                          href={myLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Linki Gör
                        </a>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Link Ekleme Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg">{isVoiceActor ? '🎙️ Ses Linki Ekle' : '🎬 Kurgu Linki Ekle'}</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedItem.title}</p>
            </div>
            <div className="p-4 space-y-4">
              {selectedItem.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedItem.description}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isVoiceActor ? 'Ses Dosyası Linki (Google Drive vb.)' : 'Kurgu Dosyası Linki (Google Drive vb.)'}
                </label>
                <input
                  type="url"
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddLink}
                  disabled={submitting || !linkInput.trim()}
                  className={`px-4 py-2 ${isVoiceActor ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg disabled:opacity-50`}
                >
                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

