'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewFinancialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [streamers, setStreamers] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  
  // İlk render'da direkt çalıştır
  if (typeof window !== 'undefined') {
    // Sayfa yüklendiğinde çalışacak
    setTimeout(() => {
      console.log('🔴 Component render edildi!')
      alert('Sayfa yüklendi! useEffect çalışacak...')
    }, 100)
  }
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    streamerId: '',
    teamMemberId: '',
  })

  useEffect(() => {
    // İlk render'da çalışacak
    window.addEventListener('load', () => {
      console.log('🟢 Window loaded!')
    })
    
    // Direkt çalıştır
    console.log('🟢 useEffect çalıştı - İlk render')
    
    const fetchData = async () => {
      try {
        // Debug endpoint'ini çağır
        try {
          const debugRes = await fetch('/api/team/debug')
          if (debugRes.ok) {
            const debugData = await debugRes.json()
            console.log('🔍 DEBUG DATA:', JSON.stringify(debugData, null, 2))
            // Alert ile göster
            alert(`Debug Bilgisi:\nTeam Members: ${debugData.summary.totalTeamMembers}\nStreamers: ${debugData.summary.totalStreamers}\nContent Creators: ${debugData.summary.totalContentCreators}\nVoice Actors: ${debugData.summary.totalVoiceActors}`)
          }
        } catch (debugErr) {
          console.error('Debug endpoint hatası:', debugErr)
        }
        
        const [streamersRes, teamRes] = await Promise.all([
          fetch('/api/streamers'),
          fetch('/api/team'),
        ])

        const streamersData = await streamersRes.json()
        const teamData = await teamRes.json()

        console.log('Streamers count:', streamersData.length)
        console.log('Team Members count:', teamData.length)
        console.log('Team Members data:', teamData)

        setStreamers(Array.isArray(streamersData) ? streamersData : [])
        
        if (Array.isArray(teamData)) {
          setTeamMembers(teamData)
        } else if (teamData && typeof teamData === 'object') {
          if (Array.isArray(teamData.members)) {
            setTeamMembers(teamData.members)
          } else if (Array.isArray(teamData.data)) {
            setTeamMembers(teamData.data)
          } else {
            setTeamMembers([])
          }
        } else {
          setTeamMembers([])
        }
      } catch (error: any) {
        console.error('Error:', error)
        alert(`Hata: ${error.message}`)
        setStreamers([])
        setTeamMembers([])
      }
    }

    // Hemen çalıştır
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          streamerId: formData.streamerId || null,
          teamMemberId: formData.teamMemberId || null,
        }),
      })

      if (res.ok) {
        router.push('/financial')
        router.refresh()
      } else {
        const data = await res.json()
        const errorMsg = data.error || 'Bir hata oluştu'
        console.error('API Error:', errorMsg)
        alert(errorMsg)
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Error:', error)
      const errorMsg = error?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'
      alert(errorMsg)
      setLoading(false)
    }
  }

  const categories = {
    income: [
      'sponsorship',
      'content',
      'stream',
      'merchandise',
      'donation',
      'other',
    ],
    expense: [
      'salary',
      'equipment',
      'marketing',
      'content',
      'office',
      'other',
    ],
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Yeni Finansal Kayıt</h1>
          {/* Debug bilgisi - her zaman görünür */}
          <div className="mt-3 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 mb-2">🔍 Debug Bilgisi:</p>
            <p className="text-xs text-yellow-700">
              Streamers: <strong>{streamers.length}</strong> | 
              Team Members: <strong>{teamMembers.length}</strong>
            </p>
            <a 
              href="/api/team/debug" 
              target="_blank" 
              className="mt-2 inline-block text-sm text-blue-600 hover:underline font-semibold"
            >
              🔍 Tüm Üye Tiplerini Görmek İçin Tıklayın (Yeni Sekmede Açılır)
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tip *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value, category: '' })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                >
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategori *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                >
                  <option value="">Seçiniz</option>
                  {categories[formData.type as keyof typeof categories].map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tutar (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tarih *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Yayıncı (Opsiyonel)
                </label>
                <select
                  value={formData.streamerId}
                  onChange={(e) =>
                    setFormData({ ...formData, streamerId: e.target.value, teamMemberId: '' })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                >
                  <option value="">Yok</option>
                  {streamers.map((streamer) => (
                    <option key={streamer.id} value={streamer.id}>
                      {streamer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ekip Üyesi (Opsiyonel)
                  {teamMembers.length > 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({teamMembers.length} üye)
                    </span>
                  )}
                </label>
                <select
                  value={formData.teamMemberId}
                  onChange={(e) =>
                    setFormData({ ...formData, teamMemberId: e.target.value, streamerId: '' })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                  disabled={loading}
                >
                  <option value="">Yok</option>
                  {teamMembers.length === 0 ? (
                    <option value="" disabled>
                      {loading ? 'Yükleniyor...' : 'Ekip üyesi bulunamadı'}
                    </option>
                  ) : (
                    teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} {member.role ? `(${member.role})` : ''}
                      </option>
                    ))
                  )}
                </select>
                {teamMembers.length === 0 && !loading && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Not:</strong> Finansal kayıtlar için sadece <strong>Ekip Üyesi</strong> (TeamMember) tipindeki kişiler seçilebilir. 
                      <br />
                      <span className="text-xs mt-1 block">
                        Yayıncılar, İçerik Üreticileri ve Seslendirmenler için "Yayıncı" dropdown'ını kullanın veya 
                        <Link href="/team/new" className="ml-1 font-semibold text-blue-600 hover:underline">
                          yeni ekip üyesi ekleyin
                        </Link>
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Açıklama
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
              />
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}


















