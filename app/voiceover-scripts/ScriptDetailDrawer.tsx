'use client'

import { useState } from 'react'
import { X, CheckCircle, XCircle, Archive, FileText, Mic, DollarSign, Calendar, User, Save, Loader2, Play, Pause, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

interface Script {
  id: string
  title: string
  text: string
  status: 'WAITING_VOICE' | 'VOICE_UPLOADED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'ARCHIVED'
  price: number
  audioFile: string | null
  contentType: string | null
  notes: string | null
  rejectionReason: string | null
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
  isVoiceActor?: boolean // Seslendirmen mi kontrolü
}

export default function ScriptDetailDrawer({ script, isOpen, onClose, onUpdate, isVoiceActor = false }: ScriptDetailDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState(script.price || 0)
  const [notes, setNotes] = useState(script.notes || '')
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [audioFileLink, setAudioFileLink] = useState(script.audioFile || '')
  const [showAudioUpload, setShowAudioUpload] = useState(false)

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
      alert('Lütfen bir Google Drive linki girin')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/voiceover-scripts/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioFile: audioFileLink.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Ses dosyası başarıyla kaydedildi')
        setShowAudioUpload(false)
        onUpdate()
      } else {
        alert(data.error || 'Ses dosyası kaydedilemedi')
      }
    } catch (error) {
      console.error('Error saving audio:', error)
      alert('Ses dosyası kaydedilirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAudio = () => {
    if (!script.audioFile) return

    if (audioElement) {
      if (isPlaying) {
        audioElement.pause()
        setIsPlaying(false)
      } else {
        audioElement.play()
        setIsPlaying(true)
      }
    } else {
      const audio = new Audio(script.audioFile)
      audio.addEventListener('ended', () => setIsPlaying(false))
      audio.addEventListener('pause', () => setIsPlaying(false))
      audio.addEventListener('play', () => setIsPlaying(true))
      setAudioElement(audio)
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleStopAudio = () => {
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
      setIsPlaying(false)
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
                  {script.price > 0
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

            {/* Ses Dosyası */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Mic className="w-5 h-5 mr-2" />
                Ses Dosyası
              </h3>
              {script.audioFile ? (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={isPlaying ? handleStopAudio : handlePlayAudio}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    <a
                      href={script.audioFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ses dosyasını aç</span>
                    </a>
                  </div>
                  {isVoiceActor && (
                    <button
                      onClick={() => {
                        setShowAudioUpload(true)
                        setAudioFileLink(script.audioFile || '')
                      }}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Ses Dosyasını Değiştir
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 mb-2">Henüz ses dosyası yüklenmemiş</p>
                  {isVoiceActor && (
                    <button
                      onClick={() => setShowAudioUpload(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Ses Dosyası Yükle
                    </button>
                  )}
                </div>
              )}
              
              {/* Ses Yükleme Formu - Sadece seslendirmen için */}
              {isVoiceActor && showAudioUpload && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-3">
                  <label className="block text-sm font-medium text-gray-900">
                    Google Drive Linki
                  </label>
                  <input
                    type="text"
                    value={audioFileLink}
                    onChange={(e) => setAudioFileLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveAudio}
                      disabled={loading || !audioFileLink.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mic className="w-4 h-4 mr-2" />
                      )}
                      Kaydet
                    </button>
                    <button
                      onClick={() => {
                        setShowAudioUpload(false)
                        setAudioFileLink(script.audioFile || '')
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reddetme Nedeni */}
            {script.status === 'REJECTED' && script.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-900 mb-1">Reddetme Nedeni</h3>
                <p className="text-sm text-red-800">{script.rejectionReason}</p>
              </div>
            )}

            {/* Fiyat Girişi (Onay için) */}
            {script.status === 'VOICE_UPLOADED' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fiyat</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Fiyat girin"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-600">₺</span>
                </div>
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

