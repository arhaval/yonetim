'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus, Eye, Heart, MessageCircle, Share2, Bookmark, RefreshCw, Clock } from 'lucide-react'
import { format, parse } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DeleteButton from '@/components/DeleteButton'

type FilterType = 'monthly' | 'total'
type Platform = 'youtube' | 'instagram'
type ContentTab = 'video' | 'shorts' | 'reels' | 'post'

export default function ContentPage() {
  const router = useRouter()
  
  // URL'den platform ve tab parametrelerini al (client-side)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const platform = params.get('platform') as Platform | null
      return platform || 'youtube'
    }
    return 'youtube'
  })

  const [activeTab, setActiveTab] = useState<ContentTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab') as ContentTab | null
      const platform = params.get('platform') as Platform | null
      if (tab) return tab
      // Platform'a göre varsayılan tab
      if (platform === 'instagram') return 'reels'
      return 'video'
    }
    return 'video'
  })

  const handlePlatformChange = (platform: Platform) => {
    setSelectedPlatform(platform)
    // Platform değiştiğinde varsayılan tab'i ayarla
    const defaultTab = platform === 'youtube' ? 'video' : 'reels'
    setActiveTab(defaultTab)
    router.push(`/content?platform=${platform}&tab=${defaultTab}`)
  }

  const handleTabChange = (tab: ContentTab) => {
    setActiveTab(tab)
    router.push(`/content?platform=${selectedPlatform}&tab=${tab}`)
  }

  // Platform'a göre sekmeleri al
  const getTabs = (): { id: ContentTab; label: string }[] => {
    if (selectedPlatform === 'youtube') {
      return [
        { id: 'video', label: 'Video' },
        { id: 'shorts', label: 'Shorts' },
      ]
    } else {
      return [
        { id: 'reels', label: 'Reels' },
        { id: 'post', label: 'Gönderi' },
      ]
    }
  }
  const [filter, setFilter] = useState<FilterType>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const filterParam = params.get('filter') as FilterType
      // Eğer filter parametresi yoksa veya geçersizse, varsayılan olarak "total" kullan
      return filterParam === 'monthly' || filterParam === 'total' ? filterParam : 'total'
    }
    return 'total' // Varsayılan olarak "Toplam" göster
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('month') || format(new Date(), 'yyyy-MM')
    }
    return format(new Date(), 'yyyy-MM')
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [contents, setContents] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    totalViews: 0,
    totalLikes: 0,
    totalEngagement: 0,
  })

  const handleUpdateAll = async () => {
    const platformName = selectedPlatform === 'youtube' ? 'YouTube' : 'Instagram'
    const confirmed = confirm(
      `Tüm ${platformName} içeriklerini güncellemek istediğinize emin misiniz?\n\nBu işlem biraz zaman alabilir.`
    )
    
    if (!confirmed) return

    setUpdating(true)
    try {
      const response = await fetch('/api/content/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platformName,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        const message = `${data.message}\n\nGüncellenen: ${data.updated}\nHatalar: ${data.errors || 0}\nToplam: ${data.total}`
        alert(message)
        window.location.reload()
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error: any) {
      console.error('Error updating content:', error)
      alert(`İçerikler güncellenirken bir hata oluştu: ${error.message}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleSyncFromAPI = async () => {
    if (selectedPlatform === 'youtube') {
      // Kullanıcıya seçenek sun
      const choice = prompt(
        'Ne yapmak istersiniz?\n\n1 - Tek video çek (Video URL girin)\n2 - Tüm kanalı çek (Channel ID, Handle veya URL girin)\n\n1 veya 2 yazın:'
      )
      
      if (!choice) return
      
      if (choice === '1') {
        // Tek video çek
        const url = prompt('YouTube Video URL\'i girin:\n\nÖrnekler:\n- https://www.youtube.com/watch?v=VIDEO_ID\n- https://youtu.be/VIDEO_ID\n- https://www.youtube.com/shorts/VIDEO_ID')
        if (!url || !url.trim()) return
        
        setSyncing(true)
        try {
          const response = await fetch('/api/content/youtube', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url.trim() }),
          })

          const data = await response.json()
          
          if (response.ok) {
            const message = data.created 
              ? `${data.message}\n\nYeni içerik eklendi.`
              : `${data.message}\n\nİçerik güncellendi.`
            alert(message)
            window.location.reload()
          } else {
            alert(data.error || 'Bir hata oluştu')
          }
        } catch (error: any) {
          console.error('Error syncing content:', error)
          alert(`İçerik çekilirken bir hata oluştu: ${error.message}`)
        } finally {
          setSyncing(false)
        }
      } else if (choice === '2') {
        // Tüm kanalı çek
        const channelInput = prompt(
          'Channel ID, Handle (@username) veya Channel URL girin:\n\nÖrnekler:\n- UC... (Channel ID)\n- @channelname (Handle)\n- https://www.youtube.com/@channelname\n- https://www.youtube.com/channel/UC...'
        )
        if (!channelInput || !channelInput.trim()) return
        
        setSyncing(true)
        try {
          const response = await fetch('/api/content/youtube', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelId: channelInput.trim() }),
          })

          const data = await response.json()
          
          if (response.ok) {
            const message = `${data.message}\n\n${data.created || 0} yeni içerik eklendi.\n${data.updated || 0} içerik güncellendi.\nToplam ${data.total || 0} video bulundu.`
            alert(message)
            window.location.reload()
          } else {
            alert(data.error || 'Bir hata oluştu')
          }
        } catch (error: any) {
          console.error('Error syncing content:', error)
          alert(`İçerikler çekilirken bir hata oluştu: ${error.message}`)
        } finally {
          setSyncing(false)
        }
      }
    } else {
      // Instagram için
      const url = prompt('Instagram Post/Reel URL\'i girin:')
      if (!url || !url.trim()) return
      
      setSyncing(true)
      try {
        const response = await fetch('/api/content/instagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() }),
        })

        const data = await response.json()
        
        if (response.ok) {
          alert(data.message || 'İçerik başarıyla çekildi')
          window.location.reload()
        } else {
          alert(data.error || 'Bir hata oluştu')
        }
      } catch (error: any) {
        console.error('Error syncing content:', error)
        alert(`İçerik çekilirken bir hata oluştu: ${error.message}`)
      } finally {
        setSyncing(false)
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const platformName = selectedPlatform === 'youtube' ? 'YouTube' : 'Instagram'
        // Tab -> Type dönüşümü: reels -> reel, post -> post, video -> video, shorts -> shorts
        const typeName = activeTab === 'post' ? 'post' : activeTab === 'reels' ? 'reel' : activeTab
        
        console.log('Fetching content with filters:', {
          platform: platformName,
          type: typeName,
          filter,
          month: selectedMonth,
        })
        
        const params = new URLSearchParams({
          filter: filter,
          month: selectedMonth,
        })
        // Platform ve tip filtresini KALDIR - tüm içerikler gözüksün
        // Filtreleme sadece görsel olarak yapılacak (client-side)
        const response = await fetch(`/api/content/list?${params}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        console.log('Fetched contents:', data.contents?.length || 0, 'items')
        
        // Güvenli array kontrolü
        const safeContents = Array.isArray(data.contents) ? data.contents : []
        const safeStats = data.stats || {
          total: 0,
          totalViews: 0,
          totalLikes: 0,
          totalEngagement: 0,
        }
        
        setContents(safeContents)
        setStats(safeStats)
      } catch (error) {
        console.error('Error fetching content:', error)
        setContents([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    // Sayfa odağa geldiğinde de yenile (içerik eklendikten sonra)
    const handleFocus = () => {
      fetchData()
    }
    window.addEventListener('focus', handleFocus)
    
    // URL parametreleri değiştiğinde de yenile
    const handlePopState = () => {
      fetchData()
    }
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [filter, selectedMonth, activeTab, selectedPlatform])

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = format(date, 'yyyy-MM')
      const label = format(date, 'MMMM yyyy', { locale: tr })
      options.push({ value, label })
    }
    return options
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Yükleniyor...</p>
          </div>
        )}
        {!loading && (
          <>
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">İçerikler</h1>
            <p className="mt-2 text-sm text-gray-600">
              Tüm içerikleri görüntüleyin ve yönetin
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-2">
            <button
              onClick={handleUpdateAll}
              disabled={updating || syncing}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
              {updating ? 'Güncelleniyor...' : 'Tümünü Güncelle'}
            </button>
            <button
              onClick={handleSyncFromAPI}
              disabled={syncing || updating}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
            >
              {syncing ? 'Senkronize ediliyor...' : 'API\'den Çek'}
            </button>
            <Link
              href={`/content/new?platform=${selectedPlatform}&type=${activeTab}`}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni İçerik
            </Link>
          </div>
        </div>

        {/* Platform Seçimi */}
        <div className="mb-4 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Platform:</label>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePlatformChange('youtube')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedPlatform === 'youtube'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              YouTube
            </button>
            <button
              onClick={() => handlePlatformChange('instagram')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedPlatform === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Instagram
            </button>
          </div>
        </div>

        {/* İçerik Tipi Sekmeleri */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {getTabs().map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filtre:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="monthly">Aylık</option>
              <option value="total">Toplam</option>
            </select>
          </div>
          {filter === 'monthly' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Ay:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {getMonthOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>


        {/* Tablo Formatı */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contents
                    .filter((content) => {
                      // Client-side filtreleme - sadece görsel
                      const matchesPlatform = !selectedPlatform || 
                        (selectedPlatform === 'youtube' && content.platform === 'YouTube') ||
                        (selectedPlatform === 'instagram' && content.platform === 'Instagram')
                      
                      // Tip filtresi - shorts'lar sadece shorts tab'ında, videolar sadece video tab'ında
                      let matchesType = true
                      if (activeTab) {
                        if (selectedPlatform === 'youtube') {
                          if (activeTab === 'video') {
                            matchesType = content.type === 'video' // Sadece video tipi
                          } else if (activeTab === 'shorts') {
                            matchesType = content.type === 'shorts' // Sadece shorts tipi
                          }
                        } else if (selectedPlatform === 'instagram') {
                          if (activeTab === 'reels') {
                            matchesType = content.type === 'reel' // Sadece reel tipi
                          } else if (activeTab === 'post') {
                            matchesType = content.type === 'post' // Sadece post tipi
                          }
                        }
                      }
                      
                      return matchesPlatform && matchesType
                    })
                    .map((content) => {
                      // İçerik tipini belirle
                      let contentType = ''
                      if (content.platform === 'YouTube') {
                        contentType = content.type === 'shorts' ? 'Shorts' : 'Video'
                      } else if (content.platform === 'Instagram') {
                        contentType = content.type === 'reel' ? 'Reels' : 'Gönderi'
                      } else {
                        contentType = content.type === 'shorts' ? 'Shorts' : content.type === 'reel' ? 'Reels' : content.type === 'post' ? 'Gönderi' : 'Video'
                      }

                      // Sayıları formatla
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
                              contentType === 'Shorts' || contentType === 'Reels'
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {contentType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {content.creator ? (
                              <Link
                                href={`/content-creators/${content.creator.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                              >
                                {content.creator.name}
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{formatNumber(content.views || 0)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4 text-red-400" />
                              <span className="text-sm font-medium text-gray-900">{formatNumber(content.likes || 0)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-medium text-gray-900">{formatNumber(content.comments || 0)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {content.platform === 'Instagram' ? (
                              <div className="flex items-center space-x-1">
                                <Share2 className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-medium text-gray-900">{formatNumber(content.shares || 0)}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {content.platform === 'Instagram' ? (
                              <div className="flex items-center space-x-1">
                                <Bookmark className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-medium text-gray-900">{formatNumber(content.saves || 0)}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(content.publishDate), 'dd MMM yyyy', { locale: tr })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                            <DeleteButton
                              id={content.id}
                              type="content"
                              compact={true}
                            />
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </Layout>
  )
}
