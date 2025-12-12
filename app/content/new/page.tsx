'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function NewContentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  
  // URL'den platform ve tip parametrelerini al
  const platformParam = searchParams.get('platform') || 'youtube'
  const typeParam = searchParams.get('type') || (platformParam === 'instagram' ? 'reels' : 'video')
  
  const getInitialData = () => {
    const platform = platformParam === 'instagram' ? 'Instagram' : 'YouTube'
    let type = typeParam
    
    // Tip dönüşümleri
    if (type === 'reels') type = 'reel'
    if (type === 'post') type = 'post'
    if (type === 'shorts') type = 'shorts'
    if (type === 'video') type = 'video'
    
    return { type, platform }
  }

  const initialData = getInitialData()
  
  const [formData, setFormData] = useState({
    title: '',
    type: initialData.type,
    platform: initialData.platform,
    url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('Form submitted:', formData)

    try {
      // Eğer URL varsa, önce API'den istatistikleri çek
      if (formData.url && formData.url.trim()) {
        console.log('URL detected, fetching from API...')
        if (formData.platform === 'YouTube') {
          // YouTube API'den çek
          const youtubeRes = await fetch('/api/content/youtube', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: formData.url.trim() }),
          })

          const youtubeData = await youtubeRes.json()
          
          if (!youtubeRes.ok) {
            alert(youtubeData.error || 'YouTube içeriği çekilemedi')
            setLoading(false)
            return
          }

          // YouTube API zaten içeriği kaydediyor, sadece yönlendir
          console.log('YouTube content created successfully:', youtubeData)
          alert(youtubeData.message || 'İçerik başarıyla eklendi ve istatistikler çekildi')
          setLoading(false)
          
          // İçeriğin tipine göre doğru tab'a yönlendir
          const contentType = youtubeData.content?.type || formData.type
          const tabForRedirect = contentType === 'shorts' ? 'shorts' : 'video'
          const platformForRedirect = platformParam
          
          // Mevcut ayı al (içerik bugün eklendiği için mevcut ay filtresine yönlendir)
          const currentMonth = new Date().toISOString().slice(0, 7)
          
          setTimeout(() => {
            window.location.href = `/content?platform=${platformForRedirect}&tab=${tabForRedirect}&filter=monthly&month=${currentMonth}`
          }, 1000)
          return
        } else if (formData.platform === 'Instagram') {
          // Instagram API'den çek
          const instagramRes = await fetch('/api/content/instagram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: formData.url.trim() }),
          })

          const instagramData = await instagramRes.json()
          
          if (!instagramRes.ok) {
            alert(instagramData.error || 'Instagram içeriği çekilemedi')
            setLoading(false)
            return
          }

          // Instagram API zaten içeriği kaydediyor, sadece yönlendir
          console.log('Instagram content created successfully:', instagramData)
          alert(instagramData.message || 'İçerik başarıyla eklendi ve istatistikler çekildi')
          setLoading(false)
          
          // İçeriğin tipine göre doğru tab'a yönlendir
          const contentType = instagramData.content?.type || formData.type
          const tabForRedirect = contentType === 'reel' ? 'reels' : contentType === 'post' ? 'post' : 'reels'
          const platformForRedirect = platformParam
          
          // Mevcut ayı al (içerik bugün eklendiği için mevcut ay filtresine yönlendir)
          const currentMonth = new Date().toISOString().slice(0, 7)
          
          setTimeout(() => {
            window.location.href = `/content?platform=${platformForRedirect}&tab=${tabForRedirect}&filter=monthly&month=${currentMonth}`
          }, 1000)
          return
        }
      }

      // URL yoksa, manuel olarak kaydet
      console.log('No URL, saving manually...')
      
      if (!formData.title || formData.title.trim() === '') {
        alert('Lütfen başlık girin veya içerik linki ekleyin')
        setLoading(false)
        return
      }

      console.log('Sending request to /api/content with data:', {
        title: formData.title.trim(),
        type: formData.type,
        platform: formData.platform,
        url: formData.url || null,
      })

      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          type: formData.type,
          platform: formData.platform,
          url: formData.url && formData.url.trim() ? formData.url.trim() : null,
          publishDate: new Date().toISOString().split('T')[0],
          creatorName: '',
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          notes: '',
        }),
      })

      const responseData = await res.json()

      if (res.ok) {
        console.log('Content created successfully:', responseData)
        alert('İçerik başarıyla eklendi!')
        setLoading(false)
        
        // İçeriğin tipine göre doğru tab'a yönlendir
        const contentType = responseData.content?.type || formData.type
        let tabForRedirect = typeParam
        
        // Tip dönüşümü: veritabanındaki tip -> URL tab parametresi
        if (contentType === 'shorts') tabForRedirect = 'shorts'
        else if (contentType === 'video') tabForRedirect = 'video'
        else if (contentType === 'reel') tabForRedirect = 'reels'
        else if (contentType === 'post') tabForRedirect = 'post'
        
        const platformForRedirect = formData.platform === 'YouTube' ? 'youtube' : 'instagram'
        
        // Mevcut ayı al (içerik bugün eklendiği için mevcut ay filtresine yönlendir)
        const currentMonth = new Date().toISOString().slice(0, 7)
        
        setTimeout(() => {
          window.location.href = `/content?platform=${platformForRedirect}&tab=${tabForRedirect}&filter=monthly&month=${currentMonth}`
        }, 1000)
      } else {
        console.error('API Error:', responseData)
        alert(responseData.error || responseData.details || 'İçerik eklenirken bir hata oluştu')
        setLoading(false)
      }
    } catch (error: any) {
      alert(`Bir hata oluştu: ${error.message}`)
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni İçerik</h1>
          <p className="mt-2 text-sm text-gray-600">
            Yeni içerik ekleyin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Başlık {formData.url ? '(Opsiyonel - URL\'den otomatik çekilecek)' : '*'}
                </label>
                <input
                  type="text"
                  required={!formData.url}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={formData.url ? "URL'den otomatik çekilecek" : "İçerik başlığını girin"}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Platform *
                </label>
                <select
                  required
                  value={formData.platform}
                  onChange={(e) => {
                    const newPlatform = e.target.value
                    // Platform değiştiğinde tip'i de güncelle
                    let newType = formData.type
                    if (newPlatform === 'YouTube' && (formData.type === 'reel' || formData.type === 'post')) {
                      newType = 'video'
                    } else if (newPlatform === 'Instagram' && (formData.type === 'video' || formData.type === 'shorts')) {
                      newType = 'reel'
                    }
                    setFormData({ ...formData, platform: newPlatform, type: newType })
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option>YouTube</option>
                  <option>Instagram</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tip *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {formData.platform === 'YouTube' && (
                    <>
                      <option value="video">Video</option>
                      <option value="shorts">Shorts</option>
                    </>
                  )}
                  {formData.platform === 'Instagram' && (
                    <>
                      <option value="reel">Reels</option>
                      <option value="post">Gönderi</option>
                    </>
                  )}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İçerik Linki (Opsiyonel)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={
                    formData.platform === 'YouTube'
                      ? 'https://www.youtube.com/watch?v=... veya https://youtu.be/...'
                      : 'https://www.instagram.com/p/... veya https://www.instagram.com/reel/...'
                  }
                />
                <p className="mt-2 text-xs text-gray-500">
                  {formData.platform === 'YouTube'
                    ? '💡 Link girerseniz, sistem otomatik olarak başlık ve istatistikleri çekecektir.'
                    : '💡 Link girerseniz, sistem otomatik olarak başlık ve istatistikleri çekecektir.'}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex justify-center py-2.5 px-6 border border-gray-300 shadow-sm text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-lg text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}



