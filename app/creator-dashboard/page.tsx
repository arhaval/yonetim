'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut, Video, Image, Calendar, Eye, Heart, MessageCircle, Share2, Bookmark, FileText, Download, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import RichTextEditor from '@/components/RichTextEditor'

export default function CreatorDashboardPage() {
  const router = useRouter()
  const [creator, setCreator] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showScriptForm, setShowScriptForm] = useState(false)
  const [scriptFormData, setScriptFormData] = useState({
    title: '',
    text: '',
  })
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
      const res = await fetch('/api/creator/content')
      const data = await res.json()
      if (res.ok) {
        setContents(data)
      }
    } catch (error) {
      console.error('Error loading contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScriptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/voiceover-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scriptFormData),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Metin başarıyla oluşturuldu!')
        setShowScriptForm(false)
        setScriptFormData({
          title: '',
          text: '',
        })
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
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>

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

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowScriptForm(false)
                    setScriptFormData({
                      title: '',
                      text: '',
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

        {/* Scripts Link */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Seslendirme Metinlerim</h2>
                <p className="text-sm text-gray-600 mt-1">Tüm seslendirme metinlerinizi görüntüleyin ve yönetin</p>
              </div>
              <Link
                href="/my-voiceovers"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Tümünü Görüntüle
              </Link>
            </div>
          </div>
        </div>

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

