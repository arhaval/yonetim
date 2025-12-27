'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, XCircle, Archive, FileText, Mic, DollarSign, Calendar, User, Save, Loader2, ExternalLink, AlertCircle } from 'lucide-react'
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
  creator: {
    id: string
    name: string
  } | null
  voiceActor: {
    id: string
    name: string
  } | null
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
  const [adminPrice, setAdminPrice] = useState(script.price || 0)
  const [notes, setNotes] = useState(script.notes || '')
  const [audioFileLink, setAudioFileLink] = useState(script.voiceLink || script.audioFile || '')
  
  // Rol kontrolü
  const [isCreator, setIsCreator] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    // Cookie'lerden rol bilgisini al
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }

    const creatorId = getCookie('creator-id')
    const userId = getCookie('user-id')

    // İçerik üreticisi kontrolü
    if (creatorId && script.creator?.id === creatorId) {
      setIsCreator(true)
    }

    // Admin kontrolü - cookie'den user-role kontrolü
    const userRole = getCookie('user-role')
    if (userRole === 'admin') {
      setIsAdmin(true)
    }
    setRoleLoading(false)
  }, [script.creator?.id])

  // Script güncellendiğinde state'i güncelle
  useEffect(() => {
    setPrice(script.price || 0)
    setAdminPrice(script.price || 0)
    setAudioFileLink(script.voiceLink || script.audioFile || '')
  }, [script])

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
    const voiceLink = script.voiceLink || script.audioFile
    if (!voiceLink) {
      toast.error('Ses linki eklenmemiş')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}/producer-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Producer onayı başarıyla verildi')
        onUpdate()
      } else {
        if (res.status === 403) {
          toast.error('Bu işlem için yetkiniz yok')
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

  const handleAdminApprove = async () => {
    if (!script.producerApproved) {
      toast.error('Önce içerik üreticisi onaylamalı')
      return
    }

    if (!adminPrice || adminPrice <= 0) {
      toast.error('Lütfen geçerli bir fiyat girin')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: adminPrice }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Admin onayı başarıyla verildi')
        onUpdate()
      } else {
        if (res.status === 403) {
          toast.error('Bu işlem için yetkiniz yok')
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
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mic className="w-4 h-4" />
                <span>
                  <span className="font-medium">Seslendiren:</span> {script.voiceActor?.name || '-'}
                </span>
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
                      href={script.voiceLink || script.audioFile || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
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

              {isCreator && (
                <div className="space-y-2">
                  <button
                    onClick={handleProducerApprove}
                    disabled={loading || !(script.voiceLink || script.audioFile) || script.producerApproved}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Sesi Onayla
                  </button>
                  
                  {!(script.voiceLink || script.audioFile) && (
                    <div className="flex items-start space-x-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Ses linki eklenmemiş. Onaylamak için önce ses linki eklenmelidir.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BLOK 2: Admin Final Onay + Fiyat */}
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

              {isAdmin && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      value={adminPrice}
                      onChange={(e) => setAdminPrice(parseFloat(e.target.value) || 0)}
                      placeholder="Fiyat girin"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      min="0"
                      step="0.01"
                      disabled={loading || script.adminApproved}
                    />
                  </div>

                  <button
                    onClick={handleAdminApprove}
                    disabled={loading || !script.producerApproved || !adminPrice || adminPrice <= 0 || script.adminApproved}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Final Onay Ver
                  </button>

                  {!script.producerApproved && (
                    <div className="flex items-start space-x-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Önce içerik üreticisi onaylamalı</span>
                    </div>
                  )}

                  {(!adminPrice || adminPrice <= 0) && script.producerApproved && (
                    <div className="flex items-start space-x-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Fiyat gir</span>
                    </div>
                  )}
                </div>
              )}
            </div>

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
              {script.status === 'VOICE_UPLOADED' && (
                <button
                  onClick={handleApprove}
                  disabled={loading || price <= 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Onayla
                </button>
              )}
              
              {(script.status === 'VOICE_UPLOADED' || script.status === 'APPROVED') && (
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

