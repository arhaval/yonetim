'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, XCircle, Archive, FileText, Mic, DollarSign, Calendar, User, Save, Loader2, ExternalLink, AlertCircle, Copy, Plus, Trash2, Edit, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { toast } from 'sonner'

interface Script {
  id: string
  title: string
  text: string
  status: 'WAITING_VOICE' | 'VOICE_UPLOADED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'ARCHIVED'
  price: number | null
  audioFile: string | null // Deprecated - use voiceLink
  voiceLink: string | null // Ses linki
  contentType: string | null
  notes: string | null
  rejectionReason: string | null
  producerApproved: boolean
  producerApprovedAt: string | null
  producerApprovedBy: string | null
  adminApproved: boolean
  adminApprovedAt: string | null
  adminApprovedBy: string | null
  createdAt: string
  updatedAt: string
  creatorId: string | null // Ownership kontrolü için gerekli
  creator: {
    id: string
    name: string
  } | null
  voiceActor: {
    id: string
    name: string
  } | null
  voiceActorId: string | null
}

interface ScriptDetailDrawerProps {
  script: Script
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function ScriptDetailDrawer({ script, isOpen, onClose, onUpdate }: ScriptDetailDrawerProps) {
  
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState(script.price || 0)
  const [adminPrice, setAdminPrice] = useState<string | number>(script.price?.toString() || '')
  const [notes, setNotes] = useState(script.notes || '')
  const [audioFileLink, setAudioFileLink] = useState(script.voiceLink || script.audioFile || '')
  
  // EditPack state
  const [editPack, setEditPack] = useState<{
    id: string
    token: string
    editorNotes: string | null
    assetsLinks: Array<{ label: string; url: string }> | null
    createdAt: string
    expiresAt: string
  } | null>(null)
  const [editPackLoading, setEditPackLoading] = useState(false)
  const [editorNotes, setEditorNotes] = useState('')
  const [assetsLinks, setAssetsLinks] = useState<Array<{ label: string; url: string }>>([])
  const [newAssetLabel, setNewAssetLabel] = useState('')
  const [newAssetUrl, setNewAssetUrl] = useState('')
  const [editingAssetIndex, setEditingAssetIndex] = useState<number | null>(null)
  
  // Rol kontrolü
  const [isCreator, setIsCreator] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentVoiceActorId, setCurrentVoiceActorId] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    
    // Güvenilir kaynaktan current user bilgisini al
    const fetchUserInfo = async () => {
      try {
        // Cookie'lerden bilgileri al
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`
          const parts = value.split(`; ${name}=`)
          if (parts.length === 2) return parts.pop()?.split(';').shift()
          return null
        }

        const userIdCookie = getCookie('user-id')
        const userRoleCookie = getCookie('user-role')
        const voiceActorIdCookie = getCookie('voice-actor-id')

        // API'den güvenilir current user ID'sini al
        let currentUserId: string | null = null
        
        if (userIdCookie) {
          try {
            const userRes = await fetch('/api/auth/me')
            const userData = await userRes.json()
            if (userData.user?.id) {
              currentUserId = String(userData.user.id)
            }
          } catch (error) {
            console.error('[ScriptDetailDrawer] Error fetching user:', error)
          }
        }

        // Ownership bazlı creator tespiti - script.creatorId (ContentCreator ID) ile current creator ID karşılaştırması
        const scriptCreatorId = script.creatorId ? String(script.creatorId) : (script.creator?.id ? String(script.creator.id) : null)
        let isCreatorByOwnership = false
        
        if (scriptCreatorId) {
          // Current user'ın creator ID'sini cookie'den al
          const creatorIdCookie = getCookie('creator-id')
          if (creatorIdCookie && String(creatorIdCookie) === String(scriptCreatorId)) {
            isCreatorByOwnership = true
          } else {
            // API'den creator bilgisini al ve karşılaştır
            try {
              const creatorRes = await fetch('/api/creator-auth/me')
              const creatorData = await creatorRes.json()
              if (creatorData.creator?.id && String(creatorData.creator.id) === String(scriptCreatorId)) {
                isCreatorByOwnership = true
              }
            } catch (error) {
              // Ignore
            }
          }
        }

        // Ownership bazlı creator tespiti (role veya status kullanmadan)
        setIsCreator(isCreatorByOwnership)

        // Admin kontrolü - cookie'den ve API'den user-role kontrolü (case-insensitive)
        let isAdminByRole = false
        
        // Önce cookie'den kontrol et
        if (userRoleCookie && (userRoleCookie.toLowerCase() === 'admin' || userRoleCookie === 'ADMIN')) {
          isAdminByRole = true
        } else if (currentUserId) {
          // Cookie'de yoksa API'den user bilgisini al ve role kontrolü yap
          try {
            const userRes = await fetch('/api/auth/me')
            const userData = await userRes.json()
            if (userData.user?.role && (userData.user.role.toLowerCase() === 'admin' || userData.user.role === 'ADMIN')) {
              isAdminByRole = true
            }
          } catch (error) {
            // Ignore
          }
        }
        
        setIsAdmin(isAdminByRole)

        // Voice actor kontrolü
        if (voiceActorIdCookie) {
          setCurrentVoiceActorId(voiceActorIdCookie)
        }

        setRoleLoading(false)
      } catch (error) {
        console.error('[ScriptDetailDrawer] Error in fetchUserInfo:', error)
        setRoleLoading(false)
      }
    }

    fetchUserInfo()
  }, [isOpen, script.id, script.creatorId, script.producerApproved, script.adminApproved])

  // Script güncellendiğinde state'i güncelle
  useEffect(() => {
    setPrice(script.price || 0)
    setAdminPrice(script.price?.toString() || '')
    setAudioFileLink(script.voiceLink || script.audioFile || '')
  }, [script])

  // EditPack yükle
  useEffect(() => {
    if (script.adminApproved && isOpen) {
      loadEditPack()
    }
  }, [script.id, script.adminApproved, isOpen])

  const loadEditPack = async () => {
    setEditPackLoading(true)
    try {
      const res = await fetch(`/api/edit-pack/voiceover/${script.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.editPack) {
          setEditPack(data.editPack)
          setEditorNotes(data.editPack.editorNotes || '')
          setAssetsLinks(data.editPack.assetsLinks || [])
        } else {
          setEditPack(null)
          setEditorNotes('')
          setAssetsLinks([])
        }
      } else if (res.status === 404) {
        // EditPack yok, bu normal
        setEditPack(null)
        setEditorNotes('')
        setAssetsLinks([])
      }
    } catch (error) {
      console.error('Error loading EditPack:', error)
      setEditPack(null)
      setEditorNotes('')
      setAssetsLinks([])
    } finally {
      setEditPackLoading(false)
    }
  }

  const handleCreateEditPack = async () => {
    if (!script.adminApproved) {
      toast.error('Admin onayı olmadan EditPack oluşturulamaz')
      return
    }

    setEditPackLoading(true)
    try {
      const res = await fetch(`/api/edit-pack/voiceover/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editorNotes: '', assetsLinks: [] }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.editPack) {
          setEditPack(data.editPack)
          setEditorNotes(data.editPack.editorNotes || '')
          setAssetsLinks(data.editPack.assetsLinks || [])
          toast.success('EditPack oluşturuldu')
        } else {
          toast.error('EditPack oluşturulamadı')
        }
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'EditPack oluşturulamadı')
      }
    } catch (error) {
      console.error('Error creating EditPack:', error)
      toast.error('EditPack oluşturulurken bir hata oluştu')
    } finally {
      setEditPackLoading(false)
    }
  }

  const handleSaveEditPack = async () => {
    setEditPackLoading(true)
    try {
      const res = await fetch(`/api/edit-pack/voiceover/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editorNotes,
          assetsLinks,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.editPack) {
          setEditPack(data.editPack)
          setEditorNotes(data.editPack.editorNotes || '')
          setAssetsLinks(data.editPack.assetsLinks || [])
          toast.success('EditPack kaydedildi')
        } else {
          toast.error('Kaydetme başarısız')
        }
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Kaydetme başarısız')
      }
    } catch (error) {
      console.error('Error saving EditPack:', error)
      toast.error('Kaydetme sırasında bir hata oluştu')
    } finally {
      setEditPackLoading(false)
    }
  }

  const handleAddAsset = () => {
    if (!newAssetLabel.trim() || !newAssetUrl.trim()) {
      toast.error('Label ve URL gerekli')
      return
    }

    if (!newAssetUrl.startsWith('http://') && !newAssetUrl.startsWith('https://')) {
      toast.error('URL http:// veya https:// ile başlamalı')
      return
    }

    setAssetsLinks([...assetsLinks, { label: newAssetLabel, url: newAssetUrl }])
    setNewAssetLabel('')
    setNewAssetUrl('')
  }

  const handleDeleteAsset = (index: number) => {
    setAssetsLinks(assetsLinks.filter((_, i) => i !== index))
  }

  const handleEditAsset = (index: number) => {
    const asset = assetsLinks[index]
    setNewAssetLabel(asset.label)
    setNewAssetUrl(asset.url)
    setEditingAssetIndex(index)
    handleDeleteAsset(index)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Kopyalandı')
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Kopyalama başarısız')
    }
  }

  const getEditPackUrl = (token: string) => {
    // Production URL - environment variable'dan al veya default kullan
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yonetim.arhaval.com'
    return `${baseUrl}/edit-pack/${token}`
  }

  const handleApprove = async () => {
    if (price <= 0) {
      alert('Lütfen geçerli bir ücret girin')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Metin başarıyla onaylandı')
        onUpdate()
        onClose()
      } else {
        alert(data.error || 'Onaylama başarısız')
      }
    } catch (error) {
      console.error('Error approving script:', error)
      alert('Onaylama sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Bu metni reddetmek istediğinize emin misiniz?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Metin reddedildi')
        onUpdate()
        onClose()
      } else {
        alert(data.error || 'Reddetme başarısız')
      }
    } catch (error) {
      console.error('Error rejecting script:', error)
      alert('Reddetme sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!confirm('Bu metni arşivlemek istediğinize emin misiniz?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}/archive`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert('Metin başarıyla arşivlendi')
        onUpdate()
        onClose()
      } else {
        alert(data.error || 'Arşivleme başarısız')
      }
    } catch (error) {
      console.error('Error archiving script:', error)
      alert('Arşivleme sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Notlar kaydedildi')
        onUpdate()
      } else {
        alert(data.error || 'Notlar kaydedilemedi')
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('Notlar kaydedilirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAudio = async () => {
    if (!audioFileLink.trim()) {
      toast.error('Lütfen bir link girin')
      return
    }

    if (!audioFileLink.startsWith('http://') && !audioFileLink.startsWith('https://')) {
      toast.error('Link http:// veya https:// ile başlamalıdır')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceLink: audioFileLink.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Ses linki başarıyla kaydedildi')
        onUpdate()
      } else {
        toast.error(data.error || 'Link kaydedilemedi')
      }
    } catch (error) {
      console.error('Error saving audio:', error)
      toast.error('Link kaydedilirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleProducerApprove = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}/creator-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Metin başarıyla onaylandı! Admin fiyat girip final onayı yapacak.')
        // Script'i refetch et ve güncelle
        try {
          const scriptRes = await fetch(`/api/voiceover-scripts/${script.id}`)
          if (scriptRes.ok) {
            const updatedScript = await scriptRes.json()
            // Parent'a güncellenmiş script'i bildir - onUpdate callback'i script'i güncelleyecek
            onUpdate()
            // Force re-render için script prop'unun değişmesini bekle
            // Parent component (VoiceoverInbox) selectedScript'i güncelleyecek
          }
        } catch (err) {
          console.error('Error refetching script:', err)
          // Hata olsa bile parent'a bildir
          onUpdate()
        }
      } else {
        console.error('Creator approve error:', { status: res.status, data })
        if (res.status === 401) {
          toast.error('Giriş yapmanız gerekiyor')
        } else if (res.status === 403) {
          toast.error(data.error || 'Bu işlem için yetkiniz yok')
        } else if (res.status === 400) {
          toast.error(data.error || 'Onaylama için gerekli koşullar sağlanmamış')
        } else {
          toast.error(data.error || 'Onaylama başarısız')
        }
      }
    } catch (error) {
      console.error('Error approving as producer:', error)
      toast.error('Onaylama sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignScript = async () => {
    if (!currentVoiceActorId) {
      toast.error('Giriş yapmanız gerekiyor')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('İş üstlenildi')
        onUpdate()
        // voiceLink input'una odaklan
        setTimeout(() => {
          const input = document.querySelector('input[placeholder*="drive.google.com"]') as HTMLInputElement
          if (input) {
            input.focus()
          }
        }, 100)
      } else if (res.status === 409) {
        toast.error('Bu iş başka birine atanmış')
      } else {
        toast.error(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      console.error('Error assigning script:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminApprove = async () => {
    if (!script.producerApproved) {
      toast.error('Önce içerik üreticisi onaylamalı')
      return
    }

    // Güvenli price parse - virgül desteği ve empty string kontrolü
    const priceString = typeof adminPrice === 'string' ? adminPrice.replace(',', '.') : String(adminPrice || '')
    const priceValue = priceString === '' ? 0 : parseFloat(priceString)
    
    if (!priceValue || priceValue <= 0 || isNaN(priceValue)) {
      toast.error('Lütfen geçerli bir fiyat girin')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: priceValue }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Admin onayı başarıyla verildi')
        // Script'i refetch et ve güncelle
        try {
          const scriptRes = await fetch(`/api/voiceover-scripts/${script.id}`)
          if (scriptRes.ok) {
            const updatedScript = await scriptRes.json()
            // Parent'a güncellenmiş script'i bildir
            onUpdate()
            // Local state'i güncelle (script prop useEffect ile güncellenecek)
            setAdminPrice(updatedScript.price?.toString() || '')
          }
        } catch (err) {
          console.error('Error refetching script:', err)
        }
        onUpdate()
      } else {
        console.error('Admin approve error:', { status: res.status, data })
        if (res.status === 401) {
          toast.error('Giriş yapmanız gerekiyor')
        } else if (res.status === 403) {
          toast.error(data.error || 'Bu işlem için admin yetkisi gerekmektedir')
        } else if (res.status === 400) {
          toast.error(data.error || 'Onaylama için gerekli koşullar sağlanmamış')
        } else {
          toast.error(data.error || 'Onaylama başarısız')
        }
      }
    } catch (error) {
      console.error('Error approving as admin:', error)
      toast.error('Onaylama sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async () => {
    if (!confirm('Bu metnin ödemesini yapmak istediğinize emin misiniz?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        alert('Metin ödendi olarak işaretlendi')
        onUpdate()
        onClose()
      } else {
        alert(data.error || 'Ödeme işlemi başarısız')
      }
    } catch (error) {
      console.error('Error paying script:', error)
      alert('Ödeme işlemi sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl z-50 transform transition-transform overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{script.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Meta Bilgiler */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>
                  <span className="font-medium">Oluşturan:</span> {script.creator?.name || '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mic className="w-4 h-4" />
                  <span>
                    <span className="font-medium">Seslendiren:</span> {script.voiceActor?.name || '-'}
                  </span>
                </div>
                {/* İşi Üstlen butonu - sadece voice actor için ve atanmamışsa göster */}
                {currentVoiceActorId && (!script.voiceActorId || script.voiceActorId === null) && (
                  <button
                    onClick={handleAssignScript}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    İşi Üstlen
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  <span className="font-medium">Tarih:</span>{' '}
                  {format(new Date(script.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>
                  <span className="font-medium">Fiyat:</span>{' '}
                  {script.price && script.price > 0
                    ? script.price.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })
                    : '-'}
                </span>
              </div>
            </div>

            {/* Metin İçeriği */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Metin İçeriği
              </h3>
              <div
                className="prose max-w-none bg-gray-50 rounded-lg p-4 text-sm"
                dangerouslySetInnerHTML={{ __html: script.text }}
              />
            </div>

            {/* Ses Linki */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Mic className="w-5 h-5 mr-2" />
                Ses Linki
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Google Drive Linki
                  </label>
                  <input
                    type="text"
                    value={audioFileLink}
                    onChange={(e) => setAudioFileLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                  {audioFileLink && !audioFileLink.startsWith('http://') && !audioFileLink.startsWith('https://') && (
                    <p className="mt-1 text-sm text-red-600">Link http:// veya https:// ile başlamalıdır</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    💡 Not: Google Drive linkinin "Herkesle paylaş" olarak ayarlandığından emin olun
                  </p>
                </div>
                <button
                  onClick={handleSaveAudio}
                  disabled={loading || !audioFileLink.trim() || (!audioFileLink.startsWith('http://') && !audioFileLink.startsWith('https://'))}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Linki Kaydet
                </button>
                {(script.voiceLink || script.audioFile) && (
                  <div className="mt-2">
                    <a
                      href={script.voiceLink || script.audioFile || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                      onClick={(e) => {
                        if (!script.voiceLink && !script.audioFile) {
                          e.preventDefault()
                        }
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Mevcut linki aç
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Reddetme Nedeni */}
            {script.status === 'REJECTED' && script.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-900 mb-1">Reddetme Nedeni</h3>
                <p className="text-sm text-red-800">{script.rejectionReason}</p>
              </div>
            )}

            {/* BLOK 1: İçerik Üreticisi Onayı */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  İçerik Üreticisi Onayı
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  script.producerApproved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {script.producerApproved ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Onaylı
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Onaysız
                    </>
                  )}
                </span>
              </div>
              
              {script.producerApprovedAt && (
                <p className="text-xs text-gray-600">
                  Onaylandı: {format(new Date(script.producerApprovedAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                </p>
              )}

              {/* İçerik Üreticisi Onay Butonu - HER ZAMAN GÖRÜNÜR */}
              <div className="space-y-2">
                <button
                  onClick={handleProducerApprove}
                  disabled={loading || (!isCreator && !isAdmin) || script.producerApproved || !(script.voiceLink || script.audioFile)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Metni Onayla
                </button>
                
                {/* Disabled durumunda açıklama */}
                {((!isCreator && !isAdmin) || script.producerApproved || !(script.voiceLink || script.audioFile)) && (
                  <div className="flex items-start space-x-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      {(!isCreator && !isAdmin) && <div>Bu işlem içerik üreticisine ait.</div>}
                      {script.producerApproved && <div>Zaten onaylandı.</div>}
                      {!(script.voiceLink || script.audioFile) && <div>Önce ses linki eklenmeli.</div>}
                    </div>
                  </div>
                )}
              </div>
              
              {script.producerApproved && (
                <div className="flex items-start space-x-2 text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Metin onaylandı. Admin fiyat girip final onayı yapacak.</span>
                </div>
              )}
            </div>

            {/* BLOK 2: Admin Final Onay + Fiyat - HER ZAMAN GÖRÜNÜR */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                  Admin Final Onay + Fiyat
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  script.adminApproved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {script.adminApproved ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Admin Onaylı
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Admin Onaysız
                    </>
                  )}
                </span>
              </div>

              {script.adminApprovedAt && (
                <p className="text-xs text-gray-600">
                  Onaylandı: {format(new Date(script.adminApprovedAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                </p>
              )}

              {/* Admin Onay Butonu - HER ZAMAN GÖRÜNÜR */}
              <div className="space-y-3 relative z-10">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    value={adminPrice}
                    onChange={(e) => setAdminPrice(e.target.value)}
                    placeholder="Fiyat girin"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 relative z-10"
                    min="0"
                    step="0.01"
                    disabled={loading || script.adminApproved}
                    readOnly={false}
                  />
                  {/* Overlay koruması - admin değilse görünür ama pointer-events: none */}
                  {!isAdmin && (
                    <div className="absolute inset-0 bg-gray-50 opacity-50 rounded-md pointer-events-none z-20" />
                  )}
                </div>

                {(() => {
                  // Güvenli price parse
                  const priceString = typeof adminPrice === 'string' ? adminPrice.replace(',', '.') : String(adminPrice || '')
                  const parsedPrice = priceString === '' ? 0 : parseFloat(priceString)
                  const isValidPrice = !isNaN(parsedPrice) && parsedPrice > 0
                  
                  // Final onay için tek doğru kural - SADECE bu değişkenlere bağlı
                  const canAdminApprove = isAdmin 
                    && script.producerApproved === true
                    && isValidPrice
                    && script.adminApproved !== true
                  
                  return (
                    <>
                      {/* Debug: Geçici olarak değerleri göster */}
                      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mb-2 font-mono">
                        admin={String(isAdmin)} | producerApproved={String(script.producerApproved)} | price={String(adminPrice)} | adminApproved={String(script.adminApproved)} | canApprove={String(canAdminApprove)}
                      </div>
                      
                      <button
                        onClick={handleAdminApprove}
                        disabled={loading || !canAdminApprove}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Final Onay Ver
                      </button>

                      {/* Disabled durumunda açıklama */}
                      {!canAdminApprove && !loading && (
                        <div className="flex items-start space-x-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1">
                            {!isAdmin && <div>Admin olarak algılanmıyorsun</div>}
                            {!script.producerApproved && <div>Önce içerik üreticisi onaylamalı</div>}
                            {!isValidPrice && script.producerApproved && <div>Fiyat geçerli değil (adminPrice: {adminPrice})</div>}
                            {script.adminApproved && <div>Zaten onaylı</div>}
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Edit Paketi */}
            {script.adminApproved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Edit Paketi
                  </h3>
                </div>

                {editPackLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                  </div>
                ) : !editPack ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      EditPack henüz oluşturulmamış. Admin onayı sonrası otomatik oluşturulacak.
                    </p>
                    {isAdmin && (
                      <button
                        onClick={handleCreateEditPack}
                        disabled={editPackLoading}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {editPackLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Oluştur
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* EditPack URL */}
                    {editPack && editPack.token && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          EditPack URL
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={getEditPackUrl(editPack.token)}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(getEditPackUrl(editPack.token))}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Kopyala
                          </button>
                          <a
                            href={getEditPackUrl(editPack.token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Aç
                          </a>
                        </div>
                        {editPack.expiresAt && (
                          <p className="mt-1 text-xs text-gray-500">
                            Süresi: {format(new Date(editPack.expiresAt), 'dd MMM yyyy HH:mm', { locale: tr })} (7 gün)
                          </p>
                        )}
                      </div>
                    )}

                    {/* Ek Linkler */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Ek Linkler
                      </label>
                      <div className="space-y-2 mb-2">
                        {assetsLinks.map((asset, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{asset.label}</div>
                              <div className="text-xs text-gray-600 truncate">{asset.url}</div>
                            </div>
                            <button
                              onClick={() => handleEditAsset(index)}
                              className="p-1 text-gray-600 hover:text-gray-900"
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAsset(index)}
                              className="p-1 text-red-600 hover:text-red-900"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newAssetLabel}
                          onChange={(e) => setNewAssetLabel(e.target.value)}
                          placeholder="Label (örn: Müzik)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <input
                          type="text"
                          value={newAssetUrl}
                          onChange={(e) => setNewAssetUrl(e.target.value)}
                          placeholder="URL (http:// veya https://)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                          onClick={() => {
                            if (editingAssetIndex !== null) {
                              handleAddAsset()
                              setEditingAssetIndex(null)
                            } else {
                              handleAddAsset()
                            }
                          }}
                          disabled={!newAssetLabel.trim() || !newAssetUrl.trim()}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {editingAssetIndex !== null ? 'Güncelle' : 'Link Ekle'}
                        </button>
                      </div>
                    </div>

                    {/* Editor Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Editör Notları
                      </label>
                      <textarea
                        value={editorNotes}
                        onChange={(e) => setEditorNotes(e.target.value)}
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                        placeholder="Editör için notlar..."
                      />
                    </div>

                    {/* Kaydet Butonu */}
                    <button
                      onClick={handleSaveEditPack}
                      disabled={editPackLoading}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editPackLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Kaydet
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notlar */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notlar</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Notlarınızı buraya yazın..."
              />
              <button
                onClick={handleSaveNotes}
                disabled={loading}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Notları Kaydet
              </button>
            </div>
          </div>

          {/* Footer - Aksiyon Butonları */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-3">
              {/* İçerik Üreticisi Onayla Butonu - HER ZAMAN GÖRÜNÜR */}
              <button
                onClick={handleProducerApprove}
                disabled={loading || (!isCreator && !isAdmin) || script.producerApproved || !(script.voiceLink || script.audioFile)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={(!isCreator && !isAdmin) ? 'Bu işlem içerik üreticisine ait' : script.producerApproved ? 'Zaten onaylandı' : !(script.voiceLink || script.audioFile) ? 'Önce ses linki eklenmeli' : ''}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Metni Onayla
              </button>

              {/* Admin Final Onay Butonu - HER ZAMAN GÖRÜNÜR */}
              <div className="flex items-center gap-2 relative z-10">
                <div className="relative">
                  <input
                    type="number"
                    value={adminPrice}
                    onChange={(e) => setAdminPrice(e.target.value)}
                    placeholder="Fiyat (₺)"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm w-32 focus:ring-purple-500 focus:border-purple-500 relative z-10"
                    min="0"
                    step="0.01"
                    disabled={loading || script.adminApproved}
                    readOnly={false}
                    title={script.adminApproved ? 'Metin zaten onaylandı' : ''}
                  />
                  {/* Overlay koruması - admin değilse görünür ama pointer-events: none */}
                  {!isAdmin && (
                    <div className="absolute inset-0 bg-gray-50 opacity-50 rounded-md pointer-events-none z-20" />
                  )}
                </div>
                {(() => {
                  // Güvenli price parse
                  const priceString = typeof adminPrice === 'string' ? adminPrice.replace(',', '.') : String(adminPrice || '')
                  const parsedPrice = priceString === '' ? 0 : parseFloat(priceString)
                  const isValidPrice = !isNaN(parsedPrice) && parsedPrice > 0
                  
                  // Final onay için tek doğru kural - SADECE bu değişkenlere bağlı
                  const canAdminApprove = isAdmin 
                    && script.producerApproved === true
                    && isValidPrice
                    && script.adminApproved !== true
                  
                  return (
                    <>
                      {/* Debug: Geçici olarak değerleri göster */}
                      <div className="text-xs text-gray-500 bg-gray-100 p-1 rounded mb-1 font-mono">
                        admin={String(isAdmin)} | producerApproved={String(script.producerApproved)} | price={String(adminPrice)} | adminApproved={String(script.adminApproved)}
                      </div>
                      <button
                        onClick={handleAdminApprove}
                        disabled={loading || !canAdminApprove}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!isAdmin ? 'Admin olarak algılanmıyorsun' : !script.producerApproved ? 'Önce içerik üreticisi onaylamalı' : !isValidPrice ? 'Fiyat geçerli değil' : script.adminApproved ? 'Zaten onaylı' : ''}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Final Onay Ver
                      </button>
                    </>
                  )
                })()}
              </div>
              
              {/* Reddet Butonu - Admin ve Creator için */}
              {/* Reddet Butonu - Admin ve Creator için (status kontrolü kaldırıldı) */}
              {(isAdmin || isCreator) && (
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reddet
                </button>
              )}

              {script.status === 'APPROVED' && (
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <DollarSign className="w-4 h-4 mr-2" />
                  )}
                  Ödendi İşaretle
                </button>
              )}

              {script.status !== 'ARCHIVED' && (
                <button
                  onClick={handleArchive}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4 mr-2" />
                  )}
                  Arşivle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

