'use client'

import { useState, useEffect } from 'react'
import { Copy, ExternalLink, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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
            setError('Link süresi doldu')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Link Süresi Doldu</h1>
          <p className="text-gray-600 mb-6">Bu link 7 gün geçerlidir. Yeni link iste.</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Hata</h1>
          <p className="text-gray-600">{error || 'Veri bulunamadı'}</p>
        </div>
      </div>
    )
  }

  const { editPack, voiceover } = data

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{voiceover.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Bu link 7 gün geçerlidir</span>
            {daysRemaining !== null && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">
                {daysRemaining > 0 ? `${daysRemaining} gün kaldı` : 'Bugün son gün'}
              </span>
            )}
          </div>
        </div>

        {/* Metin */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Metin
            </h2>
            <button
              onClick={() => copyToClipboard(voiceover.text, 'Metin')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <Copy className="w-4 h-4" />
              Kopyala
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {voiceover.text}
            </pre>
          </div>
        </div>

        {/* Ses Linki */}
        {voiceover.voiceLink && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ses Linki</h2>
            <div className="flex items-center gap-3">
              <a
                href={voiceover.voiceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Aç
              </a>
              <button
                onClick={() => copyToClipboard(voiceover.voiceLink!, 'Ses linki')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                Kopyala
              </button>
              <span className="text-sm text-gray-600 break-all flex-1">{voiceover.voiceLink}</span>
            </div>
          </div>
        )}

        {/* Ek Linkler */}
        {editPack.assetsLinks && editPack.assetsLinks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ek Linkler</h2>
            <div className="space-y-3">
              {editPack.assetsLinks.map((asset, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{asset.label}</h3>
                    <div className="flex items-center gap-2">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Aç
                      </a>
                      <button
                        onClick={() => copyToClipboard(asset.url, asset.label)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        <Copy className="w-3 h-3" />
                        Kopyala
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 break-all">{asset.url}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notlar */}
        {editPack.editorNotes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notlar</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{editPack.editorNotes}</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

