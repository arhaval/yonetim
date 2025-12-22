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
  const [contentCreators, setContentCreators] = useState<any[]>([])
  const [voiceActors, setVoiceActors] = useState<any[]>([])
  const [allMembers, setAllMembers] = useState<Array<{id: string, name: string, type: 'streamer' | 'teamMember' | 'contentCreator' | 'voiceActor', role?: string}>>([])
  
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    streamerId: '',
    teamMemberId: '',
    contentCreatorId: '',
    voiceActorId: '',
    memberId: '', // Birleşik dropdown için
    isPayout: false, // Bu bir ödeme mi?
    payoutStatus: 'paid', // Ödeme durumu
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streamersRes, teamRes, creatorsRes, voiceActorsRes] = await Promise.all([
          fetch('/api/streamers', { credentials: 'include' }),
          fetch('/api/team', { credentials: 'include' }),
          fetch('/api/content-creators', { credentials: 'include' }),
          fetch('/api/voice-actors', { credentials: 'include' }),
        ])

        // JSON parse hatalarını yakala
        let streamersData: any[] = []
        let teamDataRaw: any = null
        let creatorsData: any[] = []
        let voiceActorsData: any[] = []
        
        try {
          const streamersText = await streamersRes.text()
          if (streamersRes.ok) {
            streamersData = streamersText ? JSON.parse(streamersText) : []
          }
        } catch (e) {
          console.error('❌ Streamers JSON parse hatası:', e)
          streamersData = []
        }
        
        try {
          const teamText = await teamRes.text()
          if (teamRes.ok) {
            teamDataRaw = teamText ? JSON.parse(teamText) : null
          }
        } catch (e) {
          console.error('❌ Team JSON parse hatası:', e)
          teamDataRaw = null
        }

        try {
          const creatorsText = await creatorsRes.text()
          if (creatorsRes.ok) {
            creatorsData = creatorsText ? JSON.parse(creatorsText) : []
          }
        } catch (e) {
          console.error('❌ Creators JSON parse hatası:', e)
          creatorsData = []
        }

        try {
          const voiceActorsText = await voiceActorsRes.text()
          if (voiceActorsRes.ok) {
            voiceActorsData = voiceActorsText ? JSON.parse(voiceActorsText) : []
          }
        } catch (e) {
          console.error('❌ Voice Actors JSON parse hatası:', e)
          voiceActorsData = []
        }

        const streamersArray = Array.isArray(streamersData) ? streamersData : []
        const creatorsArray = Array.isArray(creatorsData) ? creatorsData : []
        const voiceActorsArray = Array.isArray(voiceActorsData) ? voiceActorsData : []
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

        setStreamers(streamersArray)
        setTeamMembers(teamArray)
        setContentCreators(creatorsArray)
        setVoiceActors(voiceActorsArray)

        // Birleşik liste oluştur
        const combined: Array<{id: string, name: string, type: 'streamer' | 'teamMember' | 'contentCreator' | 'voiceActor', role?: string}> = []
        
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

        // Content creators ekle
        creatorsArray.forEach((c: any) => {
          combined.push({
            id: c.id,
            name: c.name,
            type: 'contentCreator',
          })
        })

        // Voice actors ekle
        voiceActorsArray.forEach((va: any) => {
          combined.push({
            id: va.id,
            name: va.name,
            type: 'voiceActor',
          })
        })

        setAllMembers(combined)
      } catch (error: any) {
        console.error('Error fetching members:', error)
        setStreamers([])
        setTeamMembers([])
        setContentCreators([])
        setVoiceActors([])
        setAllMembers([])
      }
    }

    fetchData()
  }, [])

  const handleMemberChange = (memberId: string) => {
    if (!memberId) {
      setFormData({ 
        ...formData, 
        memberId: '', 
        streamerId: '', 
        teamMemberId: '', 
        contentCreatorId: '', 
        voiceActorId: '' 
      })
      return
    }

    const member = allMembers.find(m => m.id === memberId)
    if (member) {
      if (member.type === 'streamer') {
        setFormData({ 
          ...formData, 
          memberId, 
          streamerId: member.id, 
          teamMemberId: '', 
          contentCreatorId: '', 
          voiceActorId: '' 
        })
      } else if (member.type === 'teamMember') {
        setFormData({ 
          ...formData, 
          memberId, 
          streamerId: '', 
          teamMemberId: member.id, 
          contentCreatorId: '', 
          voiceActorId: '' 
        })
      } else if (member.type === 'contentCreator') {
        setFormData({ 
          ...formData, 
          memberId, 
          streamerId: '', 
          teamMemberId: '', 
          contentCreatorId: member.id, 
          voiceActorId: '' 
        })
      } else if (member.type === 'voiceActor') {
        setFormData({ 
          ...formData, 
          memberId, 
          streamerId: '', 
          teamMemberId: '', 
          contentCreatorId: '', 
          voiceActorId: member.id 
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Eğer payout seçilmişse ama kişi seçilmemişse hata ver
    if (formData.isPayout && !formData.memberId) {
      alert('Ödeme kaydı oluşturmak için "Kime Ödendi?" alanını doldurmalısınız.')
      return
    }

    setLoading(true)

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      streamerId: formData.streamerId || null,
      teamMemberId: formData.teamMemberId || null,
      contentCreatorId: formData.contentCreatorId || null,
      voiceActorId: formData.voiceActorId || null,
      isPayout: formData.isPayout,
      payoutStatus: formData.payoutStatus,
    }
    
    console.log('[Financial Form] Submitting data:', submitData)

    try {
      const endpoint = formData.isPayout ? '/api/payouts' : '/api/financial'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (res.ok) {
        const result = await res.json()
        console.log('[Financial Form] ✅ Record created:', result)
        
        // Eğer streamerId varsa, streamer profil sayfasına yönlendir
        if (result.streamerId) {
          router.push(`/streamers/${result.streamerId}`)
        } else if (result.teamMemberId) {
          // Eğer teamMemberId varsa, ekip üyesi profil sayfasına yönlendir
          router.push(`/team/${result.teamMemberId}`)
        } else if (result.contentCreatorId) {
          // Eğer contentCreatorId varsa, içerik üreticisi profil sayfasına yönlendir
          router.push(`/content-creators/${result.contentCreatorId}`)
        } else if (result.voiceActorId) {
          // Eğer voiceActorId varsa, seslendirmen profil sayfasına yönlendir
          router.push(`/team/${result.voiceActorId}`)
        } else {
          router.push('/financial')
        }
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
      <div className="px-4 py-4 sm:py-6 sm:px-0">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Yeni Finansal Kayıt</h1>
          {/* Debug bilgisi - her zaman görünür */}
          <div className="mt-3 p-3 sm:p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-xs sm:text-sm font-semibold text-yellow-800 mb-2">🔍 Debug Bilgisi:</p>
            <p className="text-xs text-yellow-700 break-words">
              Toplam: <strong>{allMembers.length}</strong> kişi | 
              Yayıncılar: <strong>{streamers.length}</strong> | 
              Ekip Üyeleri: <strong>{teamMembers.length}</strong> | 
              İçerik Üreticileri: <strong>{contentCreators.length}</strong> | 
              Seslendirmenler: <strong>{voiceActors.length}</strong>
            </p>
            <a 
              href="/api/team/debug" 
              target="_blank" 
              className="mt-2 inline-block text-xs sm:text-sm text-blue-600 hover:underline font-semibold break-words"
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
                  Kime Ödendi? {formData.isPayout && <span className="text-red-500">*</span>}
                  <span className="ml-2 text-xs text-gray-400">
                    ({allMembers.length} kişi: {streamers.length} yayıncı, {teamMembers.length} ekip üyesi, {contentCreators.length} içerik üreticisi, {voiceActors.length} seslendirmen)
                  </span>
                </label>
                <select
                  value={formData.memberId}
                  onChange={(e) => handleMemberChange(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                  disabled={loading}
                  required={formData.isPayout}
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
                      {contentCreators.length > 0 && (
                        <optgroup label="İçerik Üreticileri">
                          {contentCreators.map((creator) => (
                            <option key={`creator-${creator.id}`} value={creator.id}>
                              {creator.name} (İçerik Üreticisi)
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {voiceActors.length > 0 && (
                        <optgroup label="Seslendirmenler">
                          {voiceActors.map((actor) => (
                            <option key={`actor-${actor.id}`} value={actor.id}>
                              {actor.name} (Seslendirmen)
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

              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPayout"
                    checked={formData.isPayout}
                    onChange={(e) => {
                      setFormData({ ...formData, isPayout: e.target.checked })
                      if (!e.target.checked) {
                        // Toggle kapalıysa memberId'yi temizle
                        setFormData(prev => ({ ...prev, isPayout: false, memberId: '', streamerId: '', teamMemberId: '', contentCreatorId: '', voiceActorId: '' }))
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPayout" className="ml-2 block text-sm font-medium text-gray-700">
                    Bu bir ödeme mi? (Manuel ödeme kaydı oluştur)
                  </label>
                </div>
                {formData.isPayout && (
                  <div className="mt-3 ml-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-800 mb-2">
                      ✅ Ödeme kaydı oluşturulacak. Seçilen kişi kendi panelinde bu ödemeyi görebilecek.
                    </p>
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ödeme Durumu
                      </label>
                      <select
                        value={formData.payoutStatus}
                        onChange={(e) => setFormData({ ...formData, payoutStatus: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs border p-2"
                      >
                        <option value="paid">Ödendi</option>
                        <option value="unpaid">Ödenmedi</option>
                        <option value="partial">Kısmen Ödendi</option>
                      </select>
                    </div>
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


















