'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { DollarSign, Video, Mic, Film, CheckCircle, User, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface PersonPayment {
  personId: string
  personName: string
  personType: 'streamer' | 'voiceActor' | 'teamMember' | 'contentCreator'
  totalAmount: number
  itemCount: number
  items: Array<{
    id: string
    type: string
    title: string
    amount: number
    date: string
  }>
}

export default function AllPaymentsPage() {
  const router = useRouter()
  const [personPayments, setPersonPayments] = useState<PersonPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllPayments()
  }, [])

  const fetchAllPayments = async () => {
    try {
      const personMap = new Map<string, PersonPayment>()

      // Önce tüm ekip üyelerini ekle (borcu 0 olanlar da görünsün)
      // 1. Tüm yayıncıları ekle
      const streamersRes = await fetch('/api/streamers')
      if (streamersRes.ok) {
        const streamers = await streamersRes.json()
        streamers.forEach((streamer: any) => {
          const key = `streamer-${streamer.id}`
          personMap.set(key, {
            personId: streamer.id,
            personName: streamer.name,
            personType: 'streamer',
            totalAmount: 0,
            itemCount: 0,
            items: [],
          })
        })
      }

      // 2. Tüm seslendirmenleri ekle
      const voiceActorsRes = await fetch('/api/voice-actors')
      if (voiceActorsRes.ok) {
        const voiceActors = await voiceActorsRes.json()
        voiceActors.forEach((va: any) => {
          const key = `voiceActor-${va.id}`
          personMap.set(key, {
            personId: va.id,
            personName: va.name,
            personType: 'voiceActor',
            totalAmount: 0,
            itemCount: 0,
            items: [],
          })
        })
      }

      // 3. Tüm video editörleri ekle
      const teamRes = await fetch('/api/team')
      if (teamRes.ok) {
        const team = await teamRes.json()
        team.forEach((member: any) => {
          const key = `teamMember-${member.id}`
          personMap.set(key, {
            personId: member.id,
            personName: member.name,
            personType: 'teamMember',
            totalAmount: 0,
            itemCount: 0,
            items: [],
          })
        })
      }

      // 4. Tüm içerik üreticilerini ekle
      const creatorsRes = await fetch('/api/content-creators')
      if (creatorsRes.ok) {
        const creators = await creatorsRes.json()
        creators.forEach((creator: any) => {
          const key = `contentCreator-${creator.id}`
          personMap.set(key, {
            personId: creator.id,
            personName: creator.name,
            personType: 'contentCreator',
            totalAmount: 0,
            itemCount: 0,
            items: [],
          })
        })
      }

      // Şimdi ödenmemiş işleri ekle
      // 1. Stream ödemeleri (yayınlar)
      const streamsRes = await fetch('/api/streams?paymentStatus=pending')
      if (streamsRes.ok) {
        const streams = await streamsRes.json()
        streams.forEach((stream: any) => {
          if (!stream.streamer || !stream.streamerEarning) return
          
          const key = `streamer-${stream.streamerId}`
          const person = personMap.get(key)
          if (person) {
            person.totalAmount += stream.streamerEarning
            person.itemCount += 1
            person.items.push({
              id: stream.id,
              type: 'stream',
              title: stream.matchInfo || 'Yayın',
              amount: stream.streamerEarning,
              date: stream.date,
            })
          }
        })
      }

      // 2. ContentRegistry ödemeleri (ses + edit)
      const registryRes = await fetch('/api/content-registry?status=PUBLISHED')
      if (registryRes.ok) {
        const data = await registryRes.json()
        const registries = data.registries || []
        
        registries.forEach((reg: any) => {
          // Seslendirme ödemesi
          if (reg.voicePrice && !reg.voicePaid) {
            const voicePerson = reg.voiceActor || reg.streamer
            if (voicePerson) {
              const personType = reg.voiceActor ? 'voiceActor' : 'streamer'
              const key = `${personType}-${voicePerson.id}`
              const person = personMap.get(key)
              
              if (person) {
                person.totalAmount += reg.voicePrice
                person.itemCount += 1
                person.items.push({
                  id: reg.id,
                  type: 'voice',
                  title: reg.title,
                  amount: reg.voicePrice,
                  date: reg.createdAt,
                })
              }
            }
          }
          
          // Kurgu ödemesi
          if (reg.editPrice && !reg.editPaid && reg.editor) {
            const key = `teamMember-${reg.editor.id}`
            const person = personMap.get(key)
            
            if (person) {
              person.totalAmount += reg.editPrice
              person.itemCount += 1
              person.items.push({
                id: reg.id,
                type: 'edit',
                title: reg.title,
                amount: reg.editPrice,
                date: reg.createdAt,
              })
            }
          }
        })
      }

      // 3. Ekstra iş talepleri
      const extraWorkRes = await fetch('/api/extra-work-requests?status=approved')
      if (extraWorkRes.ok) {
        const data = await extraWorkRes.json()
        const requests = data.requests || []
        
        requests.forEach((req: any) => {
          const reqPerson = req.contentCreator || req.voiceActor || req.streamer || req.teamMember
          if (!reqPerson) return
          
          const personType = req.contentCreatorId ? 'contentCreator' : 
                           req.voiceActorId ? 'voiceActor' : 
                           req.streamerId ? 'streamer' : 'teamMember'
          const key = `${personType}-${reqPerson.id}`
          const person = personMap.get(key)
          
          if (person) {
            person.totalAmount += req.amount
            person.itemCount += 1
            person.items.push({
              id: req.id,
              type: 'extra',
              title: req.workType,
              amount: req.amount,
              date: req.createdAt,
            })
          }
        })
      }

      // 4. İş gönderimleri
      const workSubmissionsRes = await fetch('/api/work-submissions?status=approved')
      if (workSubmissionsRes.ok) {
        const data = await workSubmissionsRes.json()
        const submissions = data.submissions || []
        
        submissions.forEach((sub: any) => {
          const subPerson = sub.voiceActor || sub.teamMember
          if (!subPerson || !sub.cost) return
          
          const personType = sub.voiceActorId ? 'voiceActor' : 'teamMember'
          const key = `${personType}-${subPerson.id}`
          const person = personMap.get(key)
          
          if (person) {
            person.totalAmount += sub.cost
            person.itemCount += 1
            person.items.push({
              id: sub.id,
              type: 'work',
              title: sub.workName,
              amount: sub.cost,
              date: sub.createdAt,
            })
          }
        })
      }

      // Map'i array'e çevir ve sırala
      const personsArray = Array.from(personMap.values())
      personsArray.sort((a, b) => b.totalAmount - a.totalAmount) // En çok borcu olan üstte
      
      setPersonPayments(personsArray)
    } catch (error) {
      toast.error('Ödemeler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const getPersonTypeLabel = (type: string) => {
    if (type === 'streamer') return 'Yayıncı'
    if (type === 'voiceActor') return 'Seslendirmen'
    if (type === 'teamMember') return 'Video Editör'
    if (type === 'contentCreator') return 'İçerik Üreticisi'
    return 'Ekip Üyesi'
  }

  const getPersonTypeColor = (type: string) => {
    if (type === 'streamer') return 'bg-blue-100 text-blue-800'
    if (type === 'voiceActor') return 'bg-purple-100 text-purple-800'
    if (type === 'teamMember') return 'bg-green-100 text-green-800'
    if (type === 'contentCreator') return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  const totalAmount = personPayments.reduce((sum, p) => sum + p.totalAmount, 0)

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tüm Bekleyen Ödemeler</h1>
            <p className="text-gray-600 mt-1">Ekip üyelerinin ödemelerini kişi bazlı yönetin</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4">
            <p className="text-sm text-red-600 font-medium">Toplam Bekleyen</p>
            <p className="text-3xl font-bold text-red-700">
              {totalAmount.toLocaleString('tr-TR')} ₺
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Kişi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {personPayments.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Yayıncılar</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {personPayments.filter(p => p.personType === 'streamer').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Seslendirmenler</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {personPayments.filter(p => p.personType === 'voiceActor').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Video Editörler</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {personPayments.filter(p => p.personType === 'teamMember').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Persons List */}
        {personPayments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tüm ödemeler yapıldı!</h3>
            <p className="text-gray-600">Şu anda bekleyen ödeme bulunmuyor.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {personPayments.map((person) => (
                <div
                  key={`${person.personType}-${person.personId}`}
                  onClick={() => router.push(`/payments/person/${person.personType}/${person.personId}`)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {person.personName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {person.personName}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPersonTypeColor(person.personType)}`}>
                            {getPersonTypeLabel(person.personType)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {person.itemCount} adet ödenmemiş iş
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Toplam Borç</p>
                        <p className="text-2xl font-bold text-red-600">
                          {person.totalAmount.toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
