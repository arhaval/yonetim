'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import Link from 'next/link'
import { 
  ArrowLeft, CreditCard, Mic, CheckCircle, Clock, 
  Mail, Phone, Shield, Wallet, Briefcase, FileText, AlertCircle
} from 'lucide-react'

interface PersonData {
  id: string
  name: string
  email?: string
  phone?: string
  iban?: string
  role?: string
  avatar?: string
  profilePhoto?: string
  isActive?: boolean
}

interface TaskData {
  id: string
  title: string
  description?: string
  status: string
  createdAt: string
}

interface ScriptData {
  id: string
  title: string
  status: string
  price?: number
  createdAt: string
}

interface FinancialData {
  id: string
  type: string
  category?: string
  amount: number
  date: string
  description?: string
}

export default function TeamMemberDetailPage() {
  const params = useParams()
  const id = params?.id as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVoiceActor, setIsVoiceActor] = useState(false)
  const [person, setPerson] = useState<PersonData | null>(null)
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [scripts, setScripts] = useState<ScriptData[]>([])
  const [financials, setFinancials] = useState<FinancialData[]>([])
  const [stats, setStats] = useState({
    totalItems: 0,
    completed: 0,
    pending: 0,
    totalEarnings: 0,
    unpaidAmount: 0,
  })

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Paralel olarak tüm API'leri dene
      const [teamRes, voiceRes, streamerRes, creatorRes] = await Promise.all([
        fetch(`/api/team/${id}`).catch(() => null),
        fetch(`/api/voice-actors/${id}`).catch(() => null),
        fetch(`/api/streamers/${id}`).catch(() => null),
        fetch(`/api/content-creators/${id}`).catch(() => null),
      ])
      
      // TeamMember olarak kontrol et
      if (teamRes?.ok) {
        const data = await teamRes.json()
        if (data && data.id) {
          setPerson({
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            iban: data.iban,
            role: data.role || 'Ekip Üyesi',
            avatar: data.avatar,
          })
          setIsVoiceActor(false)
          
          // Görevleri al
          const tasksRes = await fetch(`/api/team/${id}/tasks`).catch(() => null)
          if (tasksRes?.ok) {
            const tasksData = await tasksRes.json()
            setTasks(Array.isArray(tasksData) ? tasksData : [])
          }
          
          // Finansal kayıtları al
          const finRes = await fetch(`/api/financial?teamMemberId=${id}`).catch(() => null)
          if (finRes?.ok) {
            const finData = await finRes.json()
            const records = Array.isArray(finData) ? finData : (finData.records || [])
            setFinancials(records)
            
            // İstatistikleri hesapla
            const earnings = records
              .filter((r: any) => r.type === 'expense')
              .reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
            
            setStats(prev => ({
              ...prev,
              totalItems: tasks.length,
              completed: tasks.filter(t => t.status === 'completed').length,
              pending: tasks.filter(t => t.status === 'pending').length,
              totalEarnings: earnings,
            }))
          }
          setLoading(false)
          return
        }
      }
      
      // VoiceActor olarak kontrol et
      if (voiceRes?.ok) {
        const data = await voiceRes.json()
        if (data && data.id) {
          setPerson({
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            iban: data.iban,
            role: 'Seslendirmen',
            profilePhoto: data.profilePhoto,
            isActive: data.isActive,
          })
          setIsVoiceActor(true)
          
          // Scriptleri al
          const scriptsRes = await fetch(`/api/voiceover-scripts?voiceActorId=${id}`).catch(() => null)
          if (scriptsRes?.ok) {
            const scriptsData = await scriptsRes.json()
            const scriptsList = Array.isArray(scriptsData) ? scriptsData : (scriptsData.scripts || [])
            setScripts(scriptsList)
            
            // İstatistikleri hesapla
            const completed = scriptsList.filter((s: any) => s.status === 'APPROVED' || s.status === 'PAID').length
            const pending = scriptsList.filter((s: any) => s.status === 'WAITING_VOICE' || s.status === 'VOICE_UPLOADED').length
            const earnings = scriptsList
              .filter((s: any) => s.status === 'PAID')
              .reduce((sum: number, s: any) => sum + (s.price || 0), 0)
            const unpaid = scriptsList
              .filter((s: any) => s.status === 'APPROVED')
              .reduce((sum: number, s: any) => sum + (s.price || 0), 0)
            
            setStats({
              totalItems: scriptsList.length,
              completed,
              pending,
              totalEarnings: earnings,
              unpaidAmount: unpaid,
            })
          }
          
          // Finansal kayıtları al
          const finRes = await fetch(`/api/financial?voiceActorId=${id}`).catch(() => null)
          if (finRes?.ok) {
            const finData = await finRes.json()
            setFinancials(Array.isArray(finData) ? finData : (finData.records || []))
          }
          setLoading(false)
          return
        }
      }
      
      // Streamer olarak kontrol et
      if (streamerRes?.ok) {
        const data = await streamerRes.json()
        if (data && data.id) {
          setPerson({
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            iban: data.iban,
            role: 'Yayıncı',
            profilePhoto: data.profilePhoto,
            isActive: data.isActive,
          })
          setIsVoiceActor(false)
          
          // Finansal kayıtları al
          const finRes = await fetch(`/api/financial?streamerId=${id}`).catch(() => null)
          if (finRes?.ok) {
            const finData = await finRes.json()
            const records = Array.isArray(finData) ? finData : (finData.records || [])
            setFinancials(records)
            
            const earnings = records
              .filter((r: any) => r.type === 'expense')
              .reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
            
            setStats(prev => ({
              ...prev,
              totalEarnings: earnings,
            }))
          }
          setLoading(false)
          return
        }
      }
      
      // ContentCreator olarak kontrol et
      if (creatorRes?.ok) {
        const data = await creatorRes.json()
        if (data && data.id) {
          setPerson({
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            iban: data.iban,
            role: 'İçerik Üreticisi',
            profilePhoto: data.profilePhoto,
            isActive: data.isActive,
          })
          setIsVoiceActor(false)
          
          // Finansal kayıtları al
          const finRes = await fetch(`/api/financial?contentCreatorId=${id}`).catch(() => null)
          if (finRes?.ok) {
            const finData = await finRes.json()
            const records = Array.isArray(finData) ? finData : (finData.records || [])
            setFinancials(records)
            
            const earnings = records
              .filter((r: any) => r.type === 'expense')
              .reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
            
            setStats(prev => ({
              ...prev,
              totalEarnings: earnings,
            }))
          }
          setLoading(false)
          return
        }
      }
      
      // Hiçbiri bulunamadı
      setError('Kişi bulunamadı')
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Tarih formatlama
  const formatDate = (date: string) => {
    try {
      const d = new Date(date)
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
      return `${d.getDate()} ${months[d.getMonth()]}`
    } catch {
      return '-'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  if (error || !person) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Hata</h1>
          <p className="text-gray-500 mb-4">{error || 'Kişi bulunamadı'}</p>
          <Link href="/team" className="text-blue-600 hover:underline">
            ← Ekibe Dön
          </Link>
        </div>
      </Layout>
    )
  }

  const profilePhoto = isVoiceActor ? person.profilePhoto : person.avatar

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Geri Butonu */}
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Ekibe Dön
        </Link>

        {/* Profil Kartı */}
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <div className={`h-24 bg-gradient-to-r ${isVoiceActor ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-indigo-600'}`} />
          
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={person.name}
                  className="w-24 h-24 rounded-xl object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${isVoiceActor ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-indigo-600'} flex items-center justify-center ring-4 ring-white shadow-lg`}>
                  {isVoiceActor ? (
                    <Mic className="w-10 h-10 text-white" />
                  ) : (
                    <span className="text-white font-bold text-3xl">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex-1 pb-1">
                <h1 className="text-2xl font-bold text-gray-900">{person.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${isVoiceActor ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {isVoiceActor ? <Mic className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {person.role}
                  </span>
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              {person.email && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{person.email}</p>
                  </div>
                </div>
              )}
              
              {person.phone && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Telefon</p>
                    <p className="text-sm font-medium text-gray-900">{person.phone}</p>
                  </div>
                </div>
              )}
              
              {person.iban && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">IBAN</p>
                    <p className="text-sm font-mono font-medium text-gray-900">{person.iban}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${isVoiceActor ? 'bg-amber-100' : 'bg-blue-100'} flex items-center justify-center`}>
                {isVoiceActor ? <FileText className="w-5 h-5 text-amber-600" /> : <Briefcase className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                <p className="text-xs text-gray-500">{isVoiceActor ? 'Toplam Metin' : 'Toplam Görev'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-gray-500">Tamamlanan</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-gray-500">Bekleyen</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">
                  {stats.totalEarnings.toLocaleString('tr-TR')}₺
                </p>
                <p className="text-xs text-gray-500">Toplam Ödeme</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ödenmemiş Tutar Uyarısı */}
        {stats.unpaidAmount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">Ödenmemiş Tutar</p>
                <p className="text-sm text-red-600">Onaylanmış ama ödenmemiş işler</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {stats.unpaidAmount.toLocaleString('tr-TR')}₺
            </p>
          </div>
        )}

        {/* İçerik Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Görevler / Metinler */}
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {isVoiceActor ? <FileText className="w-4 h-4 text-amber-600" /> : <Briefcase className="w-4 h-4 text-blue-600" />}
                {isVoiceActor ? 'Seslendirme Metinleri' : 'Görevler'}
              </h3>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {isVoiceActor ? (
                scripts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">Henüz metin yok</div>
                ) : (
                  scripts.map((script) => (
                    <div key={script.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{script.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              script.status === 'PAID' ? 'bg-green-100 text-green-700' :
                              script.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {script.status === 'PAID' ? 'Ödendi' : 
                               script.status === 'APPROVED' ? 'Onaylandı' : 'Bekliyor'}
                            </span>
                            {script.price && script.price > 0 && (
                              <span className="text-xs text-emerald-600 font-medium">
                                {script.price.toLocaleString('tr-TR')}₺
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                tasks.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">Henüz görev yok</div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-3 hover:bg-gray-50">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {task.status === 'completed' ? 'Tamamlandı' : 
                           task.status === 'in_progress' ? 'Devam Ediyor' : 'Bekliyor'}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* Ödeme Geçmişi */}
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                Ödeme Geçmişi
              </h3>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {financials.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">Henüz ödeme yok</div>
              ) : (
                financials.map((record) => (
                  <div key={record.id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.category || record.description || 'Ödeme'}</p>
                      <p className="text-xs text-gray-500">{formatDate(record.date)}</p>
                    </div>
                    <span className="font-semibold text-emerald-600">
                      {record.amount.toLocaleString('tr-TR')}₺
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
