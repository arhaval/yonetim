'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { DollarSign, Video, Mic, Film, CheckCircle, User, ChevronRight, Users, TrendingUp, Wallet, CreditCard, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface PersonPayment {
  personId: string
  personName: string
  personType: 'streamer' | 'voiceActor' | 'teamMember' | 'contentCreator'
  profilePhoto?: string
  totalAmount: number
  itemCount: number
}

export default function AllPaymentsPage() {
  const router = useRouter()
  const [personPayments, setPersonPayments] = useState<PersonPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [hideZeroDebt, setHideZeroDebt] = useState(true) // Ödediklerimi gizle (varsayılan: gizli)

  useEffect(() => {
    fetchAllPayments()
  }, [])

  const fetchAllPayments = async () => {
    try {
      // Tek bir API çağrısı ile tüm verileri al
      const res = await fetch('/api/payments/summary')
      if (res.ok) {
        const data = await res.json()
        setPersonPayments(data)
      } else {
        console.error('API error:', await res.text())
        toast.error('Ödemeler yüklenemedi')
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
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

  const getPersonTypeIcon = (type: string) => {
    if (type === 'streamer') return Video
    if (type === 'voiceActor') return Mic
    if (type === 'teamMember') return Film
    return User
  }

  const getPersonTypeGradient = (type: string) => {
    if (type === 'streamer') return 'from-blue-500 to-indigo-600'
    if (type === 'voiceActor') return 'from-purple-500 to-pink-600'
    if (type === 'teamMember') return 'from-green-500 to-emerald-600'
    if (type === 'contentCreator') return 'from-orange-500 to-red-600'
    return 'from-gray-500 to-gray-600'
  }

  // Filtreleme: Borcu 0 olanları gizle/göster
  const filteredPayments = hideZeroDebt 
    ? personPayments.filter(p => p.totalAmount > 0)
    : personPayments

  const totalAmount = personPayments.reduce((sum, p) => sum + p.totalAmount, 0)
  const totalPeople = personPayments.filter(p => p.totalAmount > 0).length
  const streamersDebt = personPayments.filter(p => p.personType === 'streamer').reduce((sum, p) => sum + p.totalAmount, 0)
  const voiceActorsDebt = personPayments.filter(p => p.personType === 'voiceActor').reduce((sum, p) => sum + p.totalAmount, 0)
  const teamDebt = personPayments.filter(p => p.personType === 'teamMember').reduce((sum, p) => sum + p.totalAmount, 0)

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
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">💰 Tüm Ödemeler</h1>
                <p className="text-white/80 text-lg">Ekip üyelerinin ödemelerini tek yerden yönetin</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm font-medium mb-1">Toplam Bekleyen Borç</p>
                <p className="text-5xl font-bold">{totalAmount.toLocaleString('tr-TR')} ₺</p>
                <p className="text-white/70 text-sm mt-1">{totalPeople} kişiye ödeme bekliyor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Toplam Ekip</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{personPayments.length}</p>
                <p className="text-xs text-gray-400 mt-1">kişi kayıtlı</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Yayıncılar</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{streamersDebt.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-blue-400 mt-1">{personPayments.filter(p => p.personType === 'streamer' && p.totalAmount > 0).length} kişi</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                <Video className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Seslendirmenler</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{voiceActorsDebt.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-purple-400 mt-1">{personPayments.filter(p => p.personType === 'voiceActor' && p.totalAmount > 0).length} kişi</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                <Mic className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Video Editörler</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{teamDebt.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-green-400 mt-1">{personPayments.filter(p => p.personType === 'teamMember' && p.totalAmount > 0).length} kişi</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                <Film className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Persons List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ekip Üyeleri</h2>
                <p className="text-sm text-gray-500 mt-1">Ödeme yapmak için kişiye tıklayın</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Toggle Button: Ödediklerimi Gizle/Göster */}
                <button
                  onClick={() => setHideZeroDebt(!hideZeroDebt)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    hideZeroDebt
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {hideZeroDebt ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Ödediklerim Gizli</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Hepsini Göster</span>
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Wallet className="w-4 h-4" />
                  <span>En yüksek borç üstte</span>
                </div>
              </div>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-16 text-center">
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {hideZeroDebt ? 'Harika! 🎉' : 'Kayıt Yok'}
              </h3>
              <p className="text-gray-500">
                {hideZeroDebt 
                  ? 'Tüm ödemeler yapıldı, bekleyen ödeme yok.' 
                  : 'Henüz ekip üyesi eklenmemiş.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPayments.map((person, index) => {
                const Icon = getPersonTypeIcon(person.personType)
                const gradient = getPersonTypeGradient(person.personType)
                
                return (
                  <div
                    key={`${person.personType}-${person.personId}`}
                    onClick={() => router.push(`/payments/person/${person.personType}/${person.personId}`)}
                    className={`p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white cursor-pointer transition-all duration-200 ${
                      person.totalAmount > 0 ? '' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Rank Badge */}
                        {person.totalAmount > 0 && index < 3 && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                        
                        {/* Avatar */}
                        {person.profilePhoto ? (
                          <img 
                            src={person.profilePhoto} 
                            alt={person.personName}
                            className="w-14 h-14 rounded-2xl object-cover shadow-md"
                          />
                        ) : (
                          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md`}>
                            {person.personName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {person.personName}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${gradient} text-white`}>
                              <Icon className="w-3 h-3" />
                              {getPersonTypeLabel(person.personType)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {person.itemCount > 0 
                              ? `${person.itemCount} adet ödenmemiş iş` 
                              : 'Tüm ödemeler yapıldı ✓'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Amount & Arrow */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Toplam Borç</p>
                          <p className={`text-2xl font-bold ${
                            person.totalAmount > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {person.totalAmount > 0 
                              ? `${person.totalAmount.toLocaleString('tr-TR')} ₺`
                              : '0 ₺'}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          person.totalAmount > 0 
                            ? 'bg-red-50 text-red-500' 
                            : 'bg-green-50 text-green-500'
                        }`}>
                          {person.totalAmount > 0 
                            ? <ChevronRight className="w-6 h-6" />
                            : <CheckCircle className="w-6 h-6" />
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
