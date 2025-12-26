'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, FileText, Upload, X, Download, CheckCircle, Clock, User, Calendar, DollarSign, Mic, Save } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

export default function VoiceActorScriptDetailPage() {
  const router = useRouter()
  const params = useParams()
  const scriptId = params.id as string

  const [script, setScript] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [driveLink, setDriveLink] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/voice-actor-auth/me', {
        credentials: 'include', // Cookie'leri gönder
        cache: 'no-store', // Cache'i bypass et
      })
      
      if (!res.ok) {
        console.error('Auth check failed:', res.status)
        router.push('/voice-actor-login')
        return
      }

      const data = await res.json()

      if (!data.voiceActor) {
        console.error('No voice actor found in response')
        router.push('/voice-actor-login')
        return
      }

      // Auth başarılıysa script'i yükle
      loadScript()
    } catch (error) {
      console.error('Auth check error:', error)
      // Hata durumunda hemen login sayfasına yönlendirme, önce kullanıcıya bilgi ver
      alert('Oturum kontrolü başarısız. Lütfen tekrar giriş yapın.')
      router.push('/voice-actor-login')
    }
  }

  const loadScript = async () => {
    try {
      const res = await fetch(`/api/voiceover-scripts/${scriptId}`, {
        credentials: 'include', // Cookie'leri gönder
        cache: 'no-store', // Cache'i bypass et
      })
      
      if (!res.ok) {
        // 401 hatası durumunda login sayfasına yönlendir
        if (res.status === 401) {
          alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
          router.push('/voice-actor-login')
          return
        }
        const data = await res.json()
        alert(data.error || 'Metin bulunamadı')
        router.push('/voice-actor-dashboard')
        setLoading(false)
        return
      }

      const data = await res.json()
      setScript(data)
      setDriveLink(data.audioFile || '')
      setShowUploadForm(!data.audioFile)
    } catch (error) {
      console.error('Error loading script:', error)
      alert('Bir hata oluştu')
      router.push('/voice-actor-dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAudio = async () => {
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
      const res = await fetch(`/api/voiceover-scripts/${scriptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Cookie'leri gönder
        body: JSON.stringify({ audioFile: driveLink.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Google Drive linki başarıyla kaydedildi! Admin onayı bekleniyor.')
        setShowUploadForm(false)
        // State'i doğrudan güncelle, loadScript çağırma (checkAuth tetiklenmesin)
        if (data.script) {
          setScript(data.script)
          setDriveLink(data.script.audioFile || '')
        } else {
          // Eğer script dönmüyorsa, sadece audioFile'ı güncelle
          setScript((prev: any) => ({
            ...prev,
            audioFile: driveLink.trim(),
            status: prev?.status || 'pending'
          }))
        }
      } else {
        // 401 hatası durumunda login sayfasına yönlendir
        if (res.status === 401) {
          alert('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
          router.push('/voice-actor-login')
          return
        }
        alert(data.error || 'Link kaydedilirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error saving audio:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssignScript = async () => {
    try {
      const res = await fetch('/api/voiceover-scripts/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Cookie'leri gönder
        body: JSON.stringify({ scriptId }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Metin başarıyla size atandı!')
        loadScript()
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!script) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/voice-actor-dashboard')}
            className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 inline-flex items-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard'a Dön
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">{script.title}</h1>
                  {script.status === 'paid' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Ödendi
                    </span>
                  ) : script.status === 'approved' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Onaylandı
                    </span>
                  ) : script.status === 'creator-approved' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      <Clock className="w-4 h-4 mr-1" />
                      Creator Onayladı
                    </span>
                  ) : script.voiceActorId && script.audioFile ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="w-4 h-4 mr-1" />
                      Onay Bekleniyor
                    </span>
                  ) : script.voiceActorId ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <Clock className="w-4 h-4 mr-1" />
                      Size Atandı
                    </span>
                  ) : null}
                </div>
                
                <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(script.createdAt), 'dd MMMM yyyy', { locale: tr })}
                  </span>
                  {script.creator && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {script.creator.name}
                      </span>
                    </>
                  )}
                  {script.price > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center font-semibold text-green-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {script.price.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Assign Button */}
            {!script.voiceActorId && (
              <button
                onClick={handleAssignScript}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
              >
                <Mic className="w-5 h-5 mr-2" />
                Bu Metni Bana Ata
              </button>
            )}
          </div>
        </div>

        {/* Script Content - Reading Optimized */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              Seslendirme Metni
            </h2>
            {script.voiceActorId && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Upload button clicked, current showUploadForm:', showUploadForm)
                  setShowUploadForm(!showUploadForm)
                }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200"
              >
                {script.audioFile ? (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Ses Dosyasını Güncelle
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Ses Dosyası Yükle
                  </>
                )}
              </button>
            )}
          </div>

          {/* Rich Text Display - Optimized for Reading */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border-2 border-gray-200">
            <div 
              className="text-lg text-gray-900 leading-relaxed prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:mb-4 prose-strong:font-semibold prose-strong:text-gray-900 prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.8',
                fontSize: '18px',
              }}
              dangerouslySetInnerHTML={{ __html: script.text }}
            />
          </div>
        </div>

        {/* Upload Form */}
        {showUploadForm && script.voiceActorId && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-pink-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Ses Dosyası Yükle
              </h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Drive Linki *
                </label>
                <input
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-base"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Ses dosyanızı Google Drive'a yükleyin ve paylaşım linkini buraya yapıştırın
                </p>
              </div>

              {script.audioFile && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Mevcut ses dosyası kaydedilmiş</span>
                    </div>
                    <a
                      href={script.audioFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Linki Aç
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveAudio}
                  disabled={submitting || !driveLink.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audio File Display */}
        {script.audioFile && !showUploadForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Yüklenen Ses Dosyası
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <audio controls className="flex-1 w-full">
                <source src={script.audioFile} type="audio/mpeg" />
                Tarayıcınız ses dosyasını desteklemiyor.
              </audio>
              <a
                href={script.audioFile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 whitespace-nowrap"
              >
                <Download className="w-5 h-5 mr-2" />
                Linki Aç
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

