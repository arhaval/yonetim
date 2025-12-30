'use client'

import { useState, useEffect } from 'react'
import { Copy, ExternalLink, FileText, AlertCircle, Loader2, Mic, Clock, CheckCircle2, Link2, StickyNote } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

interface EditPackData {
  editPack: {
    id: string
    token: string
    editorNotes: string | null
    assetsLinks: Array<{ label: string; url: string }> | null
    createdAt: string
    expiresAt: string
  }
  voiceover: {
    title: string
    text: string
    voiceLink: string | null
  }
}

export default function EditPackPage({ params }: { params: Promise<{ token: string }> | { token: string } }) {
  const [data, setData] = useState<EditPackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)

  useEffect(() => {
    const loadEditPack = async () => {
      try {
        const resolvedParams = await Promise.resolve(params)
        const { token } = resolvedParams

        const res = await fetch(`/api/edit-pack/${token}`)
        const responseData = await res.json()

        if (!res.ok) {
          if (res.status === 410) {
            setExpired(true)
            setError('Süresi doldu')
          } else if (res.status === 404) {
            setNotFound(true)
            setError('Link bulunamadı')
          } else {
            setError(responseData.error || 'Bir hata oluştu')
          }
          return
        }

        setData(responseData)

        // Kalan günü hesapla
        const expiresAt = new Date(responseData.editPack.expiresAt)
        const now = new Date()
        const diffTime = expiresAt.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setDaysRemaining(diffDays > 0 ? diffDays : 0)
      } catch (err) {
        console.error('Error loading EditPack:', err)
        setError('Veri yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    loadEditPack()
  }, [params])

  const copyToClipboard = async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(label ? `${label} kopyalandı` : 'Kopyalandı')
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Kopyalama başarısız')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin absolute top-4 left-4" />
          </div>
          <p className="text-gray-700 font-medium">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Süresi Doldu</h1>
          <p className="text-gray-600 mb-6">Bu link 7 gün geçerlidir. Yeni link isteyin.</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Bulunamadı</h1>
          <p className="text-gray-600">{error || 'Bu link geçersiz veya silinmiş olabilir.'}</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata</h1>
          <p className="text-gray-600">{error || 'Veri bulunamadı'}</p>
        </div>
      </div>
    )
  }

  const { editPack, voiceover } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">{voiceover.title}</h1>
              <div className="flex items-center gap-4 text-indigo-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">7 gün geçerli</span>
                </div>
                {daysRemaining !== null && (
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    daysRemaining > 3 
                      ? 'bg-green-500/30 text-green-100' 
                      : daysRemaining > 0 
                      ? 'bg-yellow-500/30 text-yellow-100'
                      : 'bg-red-500/30 text-red-100'
                  }`}>
                    {daysRemaining > 0 ? `${daysRemaining} gün kaldı` : 'Bugün son gün'}
                  </div>
                )}
              </div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Metin Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Metin İçeriği</h2>
            </div>
            <button
              onClick={() => copyToClipboard(voiceover.text, 'Metin')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Copy className="w-5 h-5" />
              Kopyala
            </button>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 max-h-96 overflow-y-auto border-2 border-gray-200">
            <div 
              className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: voiceover.text }}
            />
          </div>
        </div>

        {/* Ses Linki Card */}
        {voiceover.voiceLink && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Ses Kaydı</h2>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Ses Linki</p>
                  <p className="text-sm text-gray-800 break-all font-mono bg-white/50 px-3 py-2 rounded-lg">{voiceover.voiceLink}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <a
                    href={voiceover.voiceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Aç
                  </a>
                  <button
                    onClick={() => copyToClipboard(voiceover.voiceLink!, 'Ses linki')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <Copy className="w-5 h-5" />
                    Kopyala
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ek Linkler Card */}
        {editPack.assetsLinks && editPack.assetsLinks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Link2 className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Ek Linkler</h2>
            </div>
            <div className="grid gap-4">
              {editPack.assetsLinks.map((asset, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-300 transition-all duration-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{asset.label}</h3>
                      <p className="text-sm text-gray-600 break-all font-mono bg-white/50 px-3 py-2 rounded-lg">{asset.url}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Aç
                      </a>
                      <button
                        onClick={() => copyToClipboard(asset.url, asset.label)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Kopyala
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notlar Card */}
        {editPack.editorNotes && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <StickyNote className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Editör Notları</h2>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{editPack.editorNotes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Bu sayfa {format(new Date(editPack.expiresAt), 'dd MMMM yyyy HH:mm', { locale: tr })} tarihine kadar geçerlidir.</p>
        </div>
      </div>
    </div>
  )
}

