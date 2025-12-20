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
  const [allMembers, setAllMembers] = useState<Array<{id: string, name: string, type: 'streamer' | 'teamMember', role?: string}>>([])
  
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    streamerId: '',
    teamMemberId: '',
    memberId: '', // Birleşik dropdown için
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🟢 API çağrıları başlıyor...')
        const [streamersRes, teamRes] = await Promise.all([
          fetch('/api/streamers', { credentials: 'include' }),
          fetch('/api/team', { credentials: 'include' }),
        ])

        console.log('🟡 API yanıtları:', {
          streamers: { status: streamersRes.status, ok: streamersRes.ok },
          team: { status: teamRes.status, ok: teamRes.ok },
        })

        // JSON parse hatalarını yakala
        let streamersData: any[] = []
        let teamDataRaw: any = null
        
        try {
          const streamersText = await streamersRes.text()
          console.log('🟡 Streamers response text:', streamersText.substring(0, 200))
          if (streamersRes.ok) {
            streamersData = streamersText ? JSON.parse(streamersText) : []
            console.log('✅ Streamers parsed:', streamersData.length, 'items')
          } else {
            console.error('❌ Streamers API error:', streamersText)
            const errorData = streamersText ? JSON.parse(streamersText) : {}
            console.error('Error details:', errorData)
          }
        } catch (e) {
          console.error('❌ Streamers JSON parse hatası:', e)
          streamersData = []
        }
        
        try {
          const teamText = await teamRes.text()
          console.log('🟡 Team response text:', teamText.substring(0, 200))
          if (teamRes.ok) {
            teamDataRaw = teamText ? JSON.parse(teamText) : null
            console.log('✅ Team parsed:', Array.isArray(teamDataRaw) ? teamDataRaw.length : 'not array')
          } else {
            console.error('❌ Team API error:', teamText)
            const errorData = teamText ? JSON.parse(teamText) : {}
            console.error('Error details:', errorData)
          }
        } catch (e) {
          console.error('❌ Team JSON parse hatası:', e)
          teamDataRaw = null
        }

        const streamersArray = Array.isArray(streamersData) ? streamersData : []
        let teamArray: any[] = []
        
        if (Array.isArray(teamDataRaw)) {
          teamArray = teamDataRaw
        } else if (teamDataRaw && typeof teamDataRaw === 'object') {
          if (Array.isArray((teamDataRaw as any).members)) {
            teamArray = (teamDataRaw as any).members
          } else if (Array.isArray((teamDataRaw as any).data)) {
            teamArray = (teamDataRaw as any).data
          }
        }

        console.log('✅ Final data:', {
          streamers: streamersArray.length,
          teamMembers: teamArray.length,
        })

        setStreamers(streamersArray)
        setTeamMembers(teamArray)

        // Birleşik liste oluştur
        const combined: Array<{id: string, name: string, type: 'streamer' | 'teamMember', role?: string}> = []
        
        // Streamers ekle
        streamersArray.forEach((s: any) => {
          combined.push({
            id: s.id,
            name: s.name,
            type: 'streamer',
          })
        })
        
        // Team members ekle
        teamArray.forEach((tm: any) => {
          combined.push({
            id: tm.id,
            name: tm.name,
            type: 'teamMember',
            role: tm.role,
          })
        })

        console.log('✅ Combined members:', combined.length)
        setAllMembers(combined)
      } catch (error: any) {
        console.error('❌ Error:', error)
        setStreamers([])
        setTeamMembers([])
        setAllMembers([])
      }
    }

    fetchData()
  }, [])

  const handleMemberChange = (memberId: string) => {
    if (!memberId) {
      setFormData({ ...formData, memberId: '', streamerId: '', teamMemberId: '' })
      return
    }

    const member = allMembers.find(m => m.id === memberId)
    if (member) {
      if (member.type === 'streamer') {
        setFormData({ ...formData, memberId, streamerId: member.id, teamMemberId: '' })
      } else {
        setFormData({ ...formData, memberId, streamerId: '', teamMemberId: member.id })
      }
    }
  }

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
              Toplam: <strong>{allMembers.length}</strong> kişi | 
              Yayıncılar: <strong>{streamers.length}</strong> | 
              Ekip Üyeleri: <strong>{teamMembers.length}</strong>
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

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Kişi (Opsiyonel)
                  <span className="ml-2 text-xs text-gray-400">
                    ({allMembers.length} kişi: {streamers.length} yayıncı, {teamMembers.length} ekip üyesi)
                  </span>
                </label>
                <select
                  value={formData.memberId}
                  onChange={(e) => handleMemberChange(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                  disabled={loading}
                >
                  <option value="">Yok</option>
                  {allMembers.length === 0 ? (
                    <option value="" disabled>
                      {loading ? 'Yükleniyor...' : 'Kişi bulunamadı'}
                    </option>
                  ) : (
                    <>
                      {streamers.length > 0 && (
                        <optgroup label="Yayıncılar">
                          {streamers.map((streamer) => (
                            <option key={`streamer-${streamer.id}`} value={streamer.id}>
                              {streamer.name} (Yayıncı)
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {teamMembers.length > 0 && (
                        <optgroup label="Ekip Üyeleri">
                          {teamMembers.map((member) => (
                            <option key={`team-${member.id}`} value={member.id}>
                              {member.name} {member.role ? `(${member.role})` : ''} (Ekip Üyesi)
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  )}
                </select>
                {allMembers.length === 0 && !loading && (
                  <div className="mt-1">
                    <p className="text-xs text-gray-500">
                      Kişi yoksa önce <Link href="/team/new" className="text-blue-600 hover:underline">ekip üyesi</Link> veya <Link href="/streamers/new" className="text-blue-600 hover:underline">yayıncı ekleyin</Link>
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


















