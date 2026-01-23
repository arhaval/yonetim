'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, DollarSign, CheckCircle2, Clock, FileText, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import toast from 'react-hot-toast'

export default function CreatorDashboardPage() {
  const router = useRouter()
  const [creator, setCreator] = useState<any>(null)
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/creator-auth/me', { credentials: 'include' })
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
      const res = await fetch('/api/creator/content', { credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setContents(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading contents:', error)
      setContents([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/creator-auth/logout', { method: 'POST', credentials: 'include' })
      router.push('/creator-login')
    } catch (error) {
      router.push('/creator-login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!creator) return null

  const completedContents = contents.filter((c: any) => c.status === 'COMPLETED' || c.status === 'PUBLISHED').length
  const paidEarnings = contents
    .filter((c: any) => c.creatorPaid)
    .reduce((sum: number, c: any) => sum + (c.creatorEarning || 0), 0)
  const totalEarnings = paidEarnings
  const pendingEarnings = contents
    .filter((c: any) => !c.creatorPaid)
    .reduce((sum: number, c: any) => sum + (c.creatorEarning || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hoş geldiniz, {creator.name}</h1>
              <p className="text-gray-600">İçerik ve kazanç bilgilerinizi buradan takip edebilirsiniz</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/request-extra-work')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                İş Talebi Oluştur
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistikler */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Kazanç</p>
                <p className="text-2xl font-bold text-gray-900">₺{totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ödenen</p>
                <p className="text-2xl font-bold text-gray-900">₺{paidEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bekleyen Ödeme</p>
                <p className="text-2xl font-bold text-gray-900">₺{pendingEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tamamlanan İçerik</p>
                <p className="text-2xl font-bold text-gray-900">{completedContents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Son İçerikler */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Son İçeriklerim</h2>
          </div>
          <div className="p-6">
            {contents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Henüz içerik kaydı bulunmuyor</p>
                <button
                  onClick={() => router.push('/request-extra-work')}
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  İlk İş Talebini Oluştur
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tarih</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Başlık</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Platform</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Durum</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Kazanç</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.slice(0, 10).map((content: any) => (
                      <tr key={content.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(content.publishDate || content.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="py-3 px-4 text-sm">{content.title || '-'}</td>
                        <td className="py-3 px-4 text-sm">
                          {content.platform === 'YOUTUBE' ? '📺 YouTube' : 
                           content.platform === 'INSTAGRAM' ? '📷 Instagram' :
                           content.platform === 'TIKTOK' ? '🎵 TikTok' : content.platform}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            content.status === 'COMPLETED' || content.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {content.status === 'COMPLETED' ? 'Tamamlandı' :
                             content.status === 'PUBLISHED' ? 'Yayınlandı' :
                             content.status === 'PENDING' ? 'Beklemede' : content.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          {content.creatorEarning ? `₺${content.creatorEarning.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
