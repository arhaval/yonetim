'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { CheckCircle, Clock, Video, Mic, UserCircle, CheckSquare, Square, Loader2, Search, X, UserCheck } from 'lucide-react'

type PersonType = 'streamer' | 'voiceActor' | 'contentCreator' | 'teamMember' | null

interface Person {
  id: string
  name: string
  type: PersonType
  profilePhoto?: string | null
}

interface Stream {
  id: string
  date: string
  duration: number
  teamName?: string | null
  matchInfo?: string | null
  streamerEarning: number
  paymentStatus: string
  notes?: string | null
}

interface Script {
  id: string
  title: string
  price: number
  status: string
  createdAt: string
  notes?: string | null
}

interface TeamPayment {
  id: string
  amount: number
  type: string
  period: string
  description?: string | null
  createdAt: string
}

export default function PaymentApprovalPage() {
  const [selectedPersonType, setSelectedPersonType] = useState<PersonType>(null)
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [persons, setPersons] = useState<Person[]>([])
  const [filteredPersons, setFilteredPersons] = useState<Person[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [streams, setStreams] = useState<Stream[]>([])
  const [scripts, setScripts] = useState<Script[]>([])
  const [teamPayments, setTeamPayments] = useState<TeamPayment[]>([])
  const [personInfo, setPersonInfo] = useState<any>(null)
  const [selectedStreamIds, setSelectedStreamIds] = useState<Set<string>>(new Set())
  const [selectedScriptIds, setSelectedScriptIds] = useState<Set<string>>(new Set())
  const [selectedTeamPaymentIds, setSelectedTeamPaymentIds] = useState<Set<string>>(new Set())
  const [approving, setApproving] = useState(false)

  // Kişileri yükle
  useEffect(() => {
    fetchPersons()
  }, [])

  // Arama filtresi
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPersons(persons)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredPersons(
        persons.filter(p => p.name.toLowerCase().includes(query))
      )
    }
  }, [searchQuery, persons])

  const fetchPersons = async () => {
    setLoading(true)
    try {
      const [streamersRes, voiceActorsRes, creatorsRes, teamRes] = await Promise.all([
        fetch('/api/streamers'),
        fetch('/api/voice-actors'),
        fetch('/api/content-creators'),
        fetch('/api/team'),
      ])

      const allPersons: Person[] = []

      if (streamersRes.ok) {
        const streamers = await streamersRes.json()
        allPersons.push(
          ...streamers.map((s: any) => ({
            id: s.id,
            name: s.name,
            type: 'streamer' as PersonType,
            profilePhoto: s.profilePhoto,
          }))
        )
      }

      if (voiceActorsRes.ok) {
        const voiceActors = await voiceActorsRes.json()
        allPersons.push(
          ...voiceActors.map((va: any) => ({
            id: va.id,
            name: va.name,
            type: 'voiceActor' as PersonType,
            profilePhoto: va.profilePhoto,
          }))
        )
      }

      if (creatorsRes.ok) {
        const creators = await creatorsRes.json()
        allPersons.push(
          ...creators.map((c: any) => ({
            id: c.id,
            name: c.name,
            type: 'contentCreator' as PersonType,
            profilePhoto: c.profilePhoto,
          }))
        )
      }

      if (teamRes.ok) {
        const teamMembers = await teamRes.json()
        allPersons.push(
          ...teamMembers.map((tm: any) => ({
            id: tm.id,
            name: tm.name,
            type: 'teamMember' as PersonType,
            profilePhoto: tm.avatar,
          }))
        )
      }

      setPersons(allPersons)
      setFilteredPersons(allPersons)
    } catch (error) {
      console.error('Error fetching persons:', error)
    } finally {
      setLoading(false)
    }
  }

  // Kişi seçildiğinde verileri yükle
  useEffect(() => {
    if (selectedPersonType && selectedPersonId) {
      fetchPersonData()
    } else {
      setStreams([])
      setScripts([])
      setTeamPayments([])
      setPersonInfo(null)
      setSelectedStreamIds(new Set())
      setSelectedScriptIds(new Set())
      setSelectedTeamPaymentIds(new Set())
    }
  }, [selectedPersonType, selectedPersonId])

  const fetchPersonData = async () => {
    if (!selectedPersonType || !selectedPersonId) return

    setDataLoading(true)
    try {
      const url = `/api/payment-approval/${selectedPersonType}/${selectedPersonId}`
      console.log('Fetching person data:', { selectedPersonType, selectedPersonId, url })
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (res.ok) {
        console.log('Person data received:', data)
        setStreams(data.streams || [])
        setScripts(data.scripts || [])
        setTeamPayments(data.teamPayments || [])
        setPersonInfo(data.personInfo)
      } else {
        console.error('API error:', data)
        alert(data.error || 'Veri getirilemedi')
      }
    } catch (error) {
      console.error('Error fetching person data:', error)
      alert(`Veri getirilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setDataLoading(false)
    }
  }

  const handlePersonSelect = (person: Person) => {
    console.log('Person selected:', person)
    setSelectedPersonType(person.type)
    setSelectedPersonId(person.id)
    setSearchQuery('')
  }

  const handleStreamToggle = (streamId: string) => {
    const newSet = new Set(selectedStreamIds)
    if (newSet.has(streamId)) {
      newSet.delete(streamId)
    } else {
      newSet.add(streamId)
    }
    setSelectedStreamIds(newSet)
  }

  const handleScriptToggle = (scriptId: string) => {
    const newSet = new Set(selectedScriptIds)
    if (newSet.has(scriptId)) {
      newSet.delete(scriptId)
    } else {
      newSet.add(scriptId)
    }
    setSelectedScriptIds(newSet)
  }

  const handleSelectAllStreams = () => {
    if (selectedStreamIds.size === streams.length) {
      setSelectedStreamIds(new Set())
    } else {
      setSelectedStreamIds(new Set(streams.map(s => s.id)))
    }
  }

  const handleSelectAllScripts = () => {
    if (selectedScriptIds.size === scripts.length) {
      setSelectedScriptIds(new Set())
    } else {
      setSelectedScriptIds(new Set(scripts.map(s => s.id)))
    }
  }

  const handleTeamPaymentToggle = (paymentId: string) => {
    const newSet = new Set(selectedTeamPaymentIds)
    if (newSet.has(paymentId)) {
      newSet.delete(paymentId)
    } else {
      newSet.add(paymentId)
    }
    setSelectedTeamPaymentIds(newSet)
  }

  const handleSelectAllTeamPayments = () => {
    if (selectedTeamPaymentIds.size === teamPayments.length) {
      setSelectedTeamPaymentIds(new Set())
    } else {
      setSelectedTeamPaymentIds(new Set(teamPayments.map(tp => tp.id)))
    }
  }

  const handleApprove = async () => {
    if (selectedStreamIds.size === 0 && selectedScriptIds.size === 0 && selectedTeamPaymentIds.size === 0) {
      alert('Lütfen en az bir öğe seçin')
      return
    }

    const parts = []
    if (selectedStreamIds.size > 0) parts.push(`${selectedStreamIds.size} yayın`)
    if (selectedScriptIds.size > 0) parts.push(`${selectedScriptIds.size} metin`)
    if (selectedTeamPaymentIds.size > 0) parts.push(`${selectedTeamPaymentIds.size} ekip ödemesi`)

    if (!confirm(`${parts.join(', ')} ödendi olarak işaretlenecek. Devam etmek istiyor musunuz?`)) {
      return
    }

    setApproving(true)
    try {
      const res = await fetch('/api/payment-approval/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personType: selectedPersonType,
          personId: selectedPersonId,
          streamIds: Array.from(selectedStreamIds),
          scriptIds: Array.from(selectedScriptIds),
          teamPaymentIds: Array.from(selectedTeamPaymentIds),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message || 'Ödemeler başarıyla onaylandı!')
        // Verileri yeniden yükle
        fetchPersonData()
        setSelectedStreamIds(new Set())
        setSelectedScriptIds(new Set())
        setSelectedTeamPaymentIds(new Set())
      } else {
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      console.error('Error approving payments:', error)
      alert('Bir hata oluştu')
    } finally {
      setApproving(false)
    }
  }

  const getPersonTypeLabel = (type: PersonType) => {
    switch (type) {
      case 'streamer':
        return 'Yayıncı'
      case 'voiceActor':
        return 'Seslendirmen'
      case 'contentCreator':
        return 'İçerik Üreticisi'
      case 'teamMember':
        return 'Ekip Üyesi'
      default:
        return ''
    }
  }

  const getPersonTypeIcon = (type: PersonType) => {
    switch (type) {
      case 'streamer':
        return <Video className="w-4 h-4" />
      case 'voiceActor':
        return <Mic className="w-4 h-4" />
      case 'contentCreator':
        return <UserCircle className="w-4 h-4" />
      case 'teamMember':
        return <UserCheck className="w-4 h-4" />
      default:
        return null
    }
  }

  const selectedPerson = persons.find(p => p.id === selectedPersonId && p.type === selectedPersonType)

  const totalSelectedAmount = 
    streams.filter(s => selectedStreamIds.has(s.id)).reduce((sum, s) => sum + s.streamerEarning, 0) +
    scripts.filter(s => selectedScriptIds.has(s.id)).reduce((sum, s) => sum + s.price, 0) +
    teamPayments.filter(tp => selectedTeamPaymentIds.has(tp.id)).reduce((sum, tp) => sum + tp.amount, 0)

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Ödeme Onay Sistemi
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Kişiye özel yayınlar ve içerikleri seçerek ödendi olarak işaretleyin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Panel - Kişi Seçimi */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Kişi Seçin</h2>
              
              {/* Arama */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Kişi ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Kişi Listesi */}
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                  <p className="mt-2 text-sm text-gray-600">Yükleniyor...</p>
                </div>
              ) : filteredPersons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Kişi bulunamadı</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredPersons.map((person) => (
                    <button
                      key={`${person.type}-${person.id}`}
                      onClick={() => handlePersonSelect(person)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedPersonId === person.id && selectedPersonType === person.type
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {person.profilePhoto ? (
                          <img
                            src={person.profilePhoto}
                            alt={person.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                            {getPersonTypeIcon(person.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{person.name}</p>
                          <p className="text-xs text-gray-500">{getPersonTypeLabel(person.type)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sağ Panel - Öğe Listesi */}
          <div className="lg:col-span-2">
            {!selectedPersonType || !selectedPersonId ? (
              <div className="bg-white rounded-lg shadow-lg p-12 border border-gray-200 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Lütfen bir kişi seçin</p>
              </div>
            ) : dataLoading ? (
              <div className="bg-white rounded-lg shadow-lg p-12 border border-gray-200 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-gray-600">Yükleniyor...</p>
              </div>
            ) : streams.length === 0 && scripts.length === 0 && teamPayments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 border border-gray-200 text-center">
                <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Bu kişi için ödenmemiş öğe bulunamadı</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Kişi Bilgisi */}
                {personInfo && (
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-4">
                      {personInfo.profilePhoto ? (
                        <img
                          src={personInfo.profilePhoto}
                          alt={personInfo.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                          {getPersonTypeIcon(selectedPersonType)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{personInfo.name}</h3>
                        <p className="text-sm text-gray-500">{getPersonTypeLabel(selectedPersonType)}</p>
                      </div>
                      <div className="ml-auto">
                        <button
                          onClick={() => {
                            setSelectedPersonType(null)
                            setSelectedPersonId(null)
                          }}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Yayınlar */}
                {streams.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSelectAllStreams}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          {selectedStreamIds.size === streams.length ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Yayınlar ({streams.length})
                        </h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {selectedStreamIds.size} seçili
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Süre</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Takım</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maç</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Durum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {streams.map((stream) => (
                            <tr
                              key={stream.id}
                              className={`hover:bg-gray-50 cursor-pointer ${
                                selectedStreamIds.has(stream.id) ? 'bg-indigo-50' : ''
                              }`}
                              onClick={() => handleStreamToggle(stream.id)}
                            >
                              <td className="px-4 py-3">
                                {selectedStreamIds.has(stream.id) ? (
                                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-400" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {format(new Date(stream.date), 'dd MMM yyyy', { locale: tr })}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{stream.duration} saat</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{stream.teamName || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{stream.matchInfo || '-'}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-right text-indigo-600">
                                {stream.streamerEarning.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Bekliyor
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Seslendirme Metinleri */}
                {scripts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSelectAllScripts}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          {selectedScriptIds.size === scripts.length ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Seslendirme Metinleri ({scripts.length})
                        </h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {selectedScriptIds.size} seçili
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oluşturulma</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Durum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {scripts.map((script) => (
                            <tr
                              key={script.id}
                              className={`hover:bg-gray-50 cursor-pointer ${
                                selectedScriptIds.has(script.id) ? 'bg-indigo-50' : ''
                              }`}
                              onClick={() => handleScriptToggle(script.id)}
                            >
                              <td className="px-4 py-3">
                                {selectedScriptIds.has(script.id) ? (
                                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-400" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{script.title}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-right text-indigo-600">
                                {script.price.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Bekliyor
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Ekip Ödemeleri */}
                {teamPayments.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSelectAllTeamPayments}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          {selectedTeamPaymentIds.size === teamPayments.length ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Ekip Ödemeleri ({teamPayments.length})
                        </h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {selectedTeamPaymentIds.size} seçili
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dönem</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Durum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {teamPayments.map((payment) => (
                            <tr
                              key={payment.id}
                              className={`hover:bg-gray-50 cursor-pointer ${
                                selectedTeamPaymentIds.has(payment.id) ? 'bg-indigo-50' : ''
                              }`}
                              onClick={() => handleTeamPaymentToggle(payment.id)}
                            >
                              <td className="px-4 py-3">
                                {selectedTeamPaymentIds.has(payment.id) ? (
                                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-400" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{payment.period}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {payment.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{payment.description || '-'}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-right text-indigo-600">
                                {payment.amount.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Bekliyor
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Onay Butonu */}
                {(selectedStreamIds.size > 0 || selectedScriptIds.size > 0 || selectedTeamPaymentIds.size > 0) && (
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky bottom-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {[
                            selectedStreamIds.size > 0 && `${selectedStreamIds.size} yayın`,
                            selectedScriptIds.size > 0 && `${selectedScriptIds.size} metin`,
                            selectedTeamPaymentIds.size > 0 && `${selectedTeamPaymentIds.size} ekip ödemesi`,
                          ].filter(Boolean).join(', ')} seçildi
                        </p>
                        <p className="text-lg font-semibold text-indigo-600 mt-1">
                          Toplam: {totalSelectedAmount.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={handleApprove}
                        disabled={approving}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                      >
                        {approving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Onaylanıyor...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Seçilenleri Ödendi Olarak İşaretle
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

