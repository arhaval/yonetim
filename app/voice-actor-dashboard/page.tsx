'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, FileText, User, Calendar, CheckCircle, Upload, X, Clock, Download, DollarSign, Mic, Eye, Heart, MessageCircle, Share2, Bookmark, Video, Image } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

export default function VoiceActorDashboardPage() {
  const router = useRouter()
  const [voiceActor, setVoiceActor] = useState<any>(null)
  const [scripts, setScripts] = useState<any[]>([])
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [driveLink, setDriveLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/voice-actor-auth/me')
      const data = await res.json()

      if (!data.voiceActor) {
        router.push('/voice-actor-login')
        return
      }

      setVoiceActor(data.voiceActor)
      loadScripts()
      loadContents()
    } catch (error) {
      router.push('/voice-actor-login')
    }
  }

  const loadScripts = async () => {
    try {
      const res = await fetch('/api/voice-actor/scripts')
      const data = await res.json()
      if (res.ok) {
        setScripts(data)
      }
    } catch (error) {
      console.error('Error loading scripts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadContents = async () => {
    try {
      const res = await fetch('/api/voice-actor/contents')
      const data = await res.json()
      if (res.ok) {
        setContents(data)
      }
    } catch (error) {
      console.error('Error loading contents:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/voice-actor-auth/logout', { method: 'POST' })
    router.push('/voice-actor-login')
  }

  const handleAssignScript = async (scriptId: string) => {
    try {
      const res = await fetch('/api/voiceover-scripts/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Metin başarıyla size atandı!')
        loadScripts()
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const handleOpenModal = (script: any) => {
    setSelectedScript(script)
    setShowModal(true)
    setDriveLink(script.audioFile || '')
  }

  const handleSaveAudio = async () => {
    if (!selectedScript) return

    if (!driveLink || !driveLink.trim()) {
      alert('Lütfen Google Drive linkini girin')
      return
    }

    // Google Drive link formatını kontrol et
    const driveLinkPattern = /(https?:\/\/)?(drive\.google\.com|docs\.google\.com).*/
    if (!driveLinkPattern.test(driveLink.trim())) {
      alert('Lütfen geçerli bir Google Drive linki girin')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/voiceover-scripts/${selectedScript.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioFile: driveLink.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Google Drive linki başarıyla kaydedildi! Admin onayı bekleniyor.')
        setShowModal(false)
        setSelectedScript(null)
        setDriveLink('')
        loadScripts()
      } else {
        alert(data.error || 'Link kaydedilirken bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
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

  const unassignedScripts = scripts.filter(s => !s.voiceActorId)
  const myScripts = scripts.filter(s => s.voiceActorId === voiceActor.id)
  
  // Ödeme hesaplamaları
  const paidScripts = myScripts.filter(s => s.status === 'paid')
  const unpaidScripts = myScripts.filter(s => s.status === 'approved' || (s.status === 'pending' && s.audioFile))
  const totalPaid = paidScripts.reduce((sum, s) => sum + (s.price || 0), 0)
  const totalUnpaid = unpaidScripts.reduce((sum, s) => sum + (s.price || 0), 0)

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
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<span class="text-gray-900 font-bold text-xl">A</span>'
                      target.parentElement.style.background = 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)'
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
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atanmamış Metinler</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{unassignedScripts.length}</p>
              </div>
              <FileText className="w-12 h-12 text-indigo-400" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bana Atanan Metinler</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{myScripts.length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-purple-400" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ödenen</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {totalPaid.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">{paidScripts.length} iş</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ödenmemiş</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {totalUnpaid.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                    maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">{unpaidScripts.length} iş</p>
              </div>
              <DollarSign className="w-12 h-12 text-red-400" />
            </div>
          </div>
        </div>

        {/* Scripts List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Seslendirme Metinleri</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {scripts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">Henüz seslendirme metni eklenmemiş</p>
              </div>
            ) : (
              scripts.map((script) => (
                <div key={script.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 
                          className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
                          onClick={() => handleOpenModal(script)}
                        >
                          {script.title}
                        </h3>
                        {script.status === 'paid' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ödendi
                          </span>
                        ) : script.status === 'approved' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Tamamlandı
                          </span>
                        ) : script.voiceActorId === voiceActor.id && script.audioFile ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Onay Bekleniyor
                          </span>
                        ) : script.voiceActorId === voiceActor.id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Size Atandı
                          </span>
                        ) : null}
                        {script.creator && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <User className="w-3 h-3 mr-1" />
                            {script.creator.name}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(script.createdAt), 'dd MMMM yyyy', { locale: tr })}
                        </span>
                        {script.contentType && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border" style={{ 
                              backgroundColor: script.contentType === 'reels' ? 'rgba(255, 46, 99, 0.1)' : script.contentType === 'kısa' ? 'rgba(8, 217, 214, 0.1)' : 'rgba(37, 42, 52, 0.1)',
                              borderColor: script.contentType === 'reels' ? '#ff2e63' + '40' : script.contentType === 'kısa' ? '#08d9d6' + '40' : '#252a34' + '40',
                              color: '#252a34'
                            }}>
                              {script.contentType === 'reels' ? 'Reels' : script.contentType === 'kısa' ? 'Kısa Video' : 'Uzun Video'}
                            </span>
                          </>
                        )}
                        {script.price > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-green-600">
                              {script.price.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{script.text}</p>
                    </div>
                    <div className="ml-4 flex flex-col space-y-2">
                      {!script.voiceActorId && (
                        <button
                          onClick={() => handleAssignScript(script.id)}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                        >
                          Bana Ata
                        </button>
                      )}
                      {script.voiceActorId === voiceActor.id && !script.audioFile && (
                        <button
                          onClick={() => handleOpenModal(script)}
                          className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-sm font-medium rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200"
                        >
                          Ses Yükle
                        </button>
                      )}
                      {script.voiceActorId === voiceActor.id && script.audioFile && script.status === 'pending' && (
                        <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-lg">
                          Onay Bekleniyor
                        </span>
                      )}
                      {script.voiceActorId === voiceActor.id && script.status === 'approved' && (
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg">
                          Tamamlandı
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
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

      {/* Modal */}
      {showModal && selectedScript && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedScript.title}</h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedScript(null)
                    setDriveLink('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Seslendirme Metni:</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div 
                      className="text-sm text-gray-900 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedScript.text }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Google Drive Linki *
                  </label>
                  <input
                    type="url"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Ses dosyanızı Google Drive'a yükleyin ve paylaşım linkini buraya yapıştırın
                  </p>
                  {selectedScript.audioFile && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm text-green-600">✓ Link kaydedilmiş</span>
                      <a
                        href={selectedScript.audioFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Linki Aç
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedScript(null)
                      setDriveLink('')
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSaveAudio}
                    disabled={submitting || !driveLink.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Kaydediliyor...' : 'Kaydet'}
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
