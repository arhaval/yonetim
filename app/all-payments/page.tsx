'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { DollarSign, Video, Mic, Film, CheckCircle, Clock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

interface Payment {
  id: string
  type: 'stream' | 'voice' | 'edit' | 'extra'
  title: string
  personName: string
  personId: string
  personType: string
  amount: number
  date: string
  details: string
}

export default function AllPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)

  useEffect(() => {
    fetchAllPayments()
  }, [])

  const fetchAllPayments = async () => {
    try {
      const allPayments: Payment[] = []

      // 1. Stream ödemeleri (yayınlar)
      const streamsRes = await fetch('/api/streams?paymentStatus=pending')
      if (streamsRes.ok) {
        const streams = await streamsRes.json()
        streams.forEach((stream: any) => {
          allPayments.push({
            id: `stream-${stream.id}`,
            type: 'stream',
            title: stream.matchInfo || 'Yayın',
            personName: stream.streamer?.name || 'Bilinmeyen',
            personId: stream.streamerId,
            personType: 'streamer',
            amount: stream.streamerEarning || 0,
            date: stream.date,
            details: `${stream.duration} saat - ${stream.teamName || ''}`,
          })
        })
      }

      // 2. ContentRegistry ödemeleri (ses)
      const registryRes = await fetch('/api/content-registry?status=PUBLISHED')
      if (registryRes.ok) {
        const data = await registryRes.json()
        const registries = data.registries || []
        
        registries.forEach((reg: any) => {
          // Seslendirme ödemesi
          if (reg.voicePrice && !reg.voicePaid) {
            const voicePerson = reg.voiceActor || reg.streamer
            if (voicePerson) {
              allPayments.push({
                id: `voice-${reg.id}`,
                type: 'voice',
                title: reg.title,
                personName: voicePerson.name,
                personId: voicePerson.id,
                personType: reg.voiceActor ? 'voiceActor' : 'streamer',
                amount: reg.voicePrice,
                date: reg.createdAt,
                details: 'Seslendirme',
              })
            }
          }
          
          // Kurgu ödemesi
          if (reg.editPrice && !reg.editPaid && reg.editor) {
            allPayments.push({
              id: `edit-${reg.id}`,
              type: 'edit',
              title: reg.title,
              personName: reg.editor.name,
              personId: reg.editor.id,
              personType: 'editor',
              amount: reg.editPrice,
              date: reg.createdAt,
              details: 'Kurgu',
            })
          }
        })
      }

      // 3. Ekstra iş talepleri (onaylanmış olanlar)
      const extraWorkRes = await fetch('/api/extra-work-requests?status=approved')
      if (extraWorkRes.ok) {
        const data = await extraWorkRes.json()
        const requests = data.requests || []
        
        requests.forEach((req: any) => {
          const person = req.contentCreator || req.voiceActor || req.streamer || req.teamMember
          if (person) {
            const workTypeLabels: any = {
              VOICE: 'Seslendirme',
              EDIT: 'Kurgu',
              STREAM: 'Yayın',
              CONTENT: 'İçerik',
              OTHER: 'Diğer',
            }
            
            allPayments.push({
              id: `extra-${req.id}`,
              type: 'extra',
              title: workTypeLabels[req.workType] || 'Ekstra İş',
              personName: person.name,
              personId: person.id,
              personType: req.contentCreatorId ? 'contentCreator' : req.voiceActorId ? 'voiceActor' : req.streamerId ? 'streamer' : 'teamMember',
              amount: req.amount,
              date: req.createdAt,
              details: req.description,
            })
          }
        })
      }

      // Tarihe göre sırala (eski → yeni)
      allPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      setPayments(allPayments)
    } catch (error) {
      toast.error('Ödemeler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (payment: Payment) => {
    if (!confirm(`${payment.personName} için ${payment.amount.toLocaleString('tr-TR')} TL ödeme yapılacak. Onaylıyor musunuz?`)) {
      return
    }

    setPaying(payment.id)
    try {
      if (payment.type === 'stream') {
        // Stream ödemesi
        const streamId = payment.id.replace('stream-', '')
        const res = await fetch(`/api/streams/${streamId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus: 'paid' }),
        })

        if (!res.ok) throw new Error('Ödeme güncellenemedi')

        // Finansal kayıt oluştur
        await fetch('/api/financial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'expense',
            category: 'Yayın Ödemesi',
            amount: payment.amount,
            description: `${payment.title} - ${payment.personName}`,
            date: new Date().toISOString(),
            streamerId: payment.personId,
          }),
        })

        toast.success('Yayın ödemesi yapıldı!')
      } else if (payment.type === 'voice' || payment.type === 'edit') {
        // ContentRegistry ödemesi
        const registryId = payment.id.replace('voice-', '').replace('edit-', '')
        const updateData: any = {}
        
        if (payment.type === 'voice') {
          updateData.voicePaid = true
        } else {
          updateData.editPaid = true
        }

        const res = await fetch(`/api/content-registry/${registryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })

        if (!res.ok) throw new Error('Ödeme güncellenemedi')

        // Finansal kayıt oluştur
        const financialData: any = {
          type: 'expense',
          category: payment.type === 'voice' ? 'Seslendirme Ödemesi' : 'Kurgu Ödemesi',
          amount: payment.amount,
          description: `${payment.title} - ${payment.personName}`,
          date: new Date().toISOString(),
        }

        if (payment.personType === 'voiceActor') {
          financialData.voiceActorId = payment.personId
        } else if (payment.personType === 'streamer') {
          financialData.streamerId = payment.personId
        } else if (payment.personType === 'editor') {
          financialData.teamMemberId = payment.personId
        }

        await fetch('/api/financial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(financialData),
        })

        toast.success('Ödeme yapıldı!')
      } else if (payment.type === 'extra') {
        // Ekstra iş talebi ödemesi
        const requestId = payment.id.replace('extra-', '')
        const res = await fetch(`/api/extra-work-requests/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paid' }),
        })

        if (!res.ok) throw new Error('Ödeme güncellenemedi')

        // Finansal kayıt oluştur
        const financialData: any = {
          type: 'expense',
          category: 'Ekstra İş Ödemesi',
          amount: payment.amount,
          description: `${payment.title} - ${payment.personName} - ${payment.details}`,
          date: new Date().toISOString(),
        }

        if (payment.personType === 'contentCreator') {
          financialData.creatorId = payment.personId
        } else if (payment.personType === 'voiceActor') {
          financialData.voiceActorId = payment.personId
        } else if (payment.personType === 'streamer') {
          financialData.streamerId = payment.personId
        } else if (payment.personType === 'teamMember') {
          financialData.teamMemberId = payment.personId
        }

        await fetch('/api/financial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(financialData),
        })

        toast.success('Ekstra iş ödemesi yapıldı!')
      }

      fetchAllPayments()
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setPaying(null)
    }
  }

  const getIcon = (type: string) => {
    if (type === 'stream') return Video
    if (type === 'voice') return Mic
    if (type === 'edit') return Film
    return DollarSign
  }

  const getColor = (type: string) => {
    if (type === 'stream') return 'bg-blue-100 text-blue-800'
    if (type === 'voice') return 'bg-purple-100 text-purple-800'
    if (type === 'edit') return 'bg-green-100 text-green-800'
    return 'bg-orange-100 text-orange-800'
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)

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
            <p className="text-gray-600 mt-1">Yayın, seslendirme ve kurgu ödemelerini tek yerden yönetin</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4">
            <p className="text-sm text-red-600 font-medium">Toplam Bekleyen</p>
            <p className="text-3xl font-bold text-red-700">
              {totalAmount.toLocaleString('tr-TR')} ₺
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Yayın Ödemeleri</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {payments.filter(p => p.type === 'stream').length}
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
                <p className="text-sm text-gray-600">Seslendirme</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {payments.filter(p => p.type === 'voice').length}
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
                <p className="text-sm text-gray-600">Kurgu</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {payments.filter(p => p.type === 'edit').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Film className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tüm ödemeler yapıldı!</h3>
            <p className="text-gray-600">Şu anda bekleyen ödeme bulunmuyor.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İçerik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kişi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => {
                  const Icon = getIcon(payment.type)
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColor(payment.type)}`}>
                          <Icon className="w-4 h-4 mr-1" />
                          {payment.type === 'stream' ? 'Yayın' : payment.type === 'voice' ? 'Ses' : 'Kurgu'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{payment.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{payment.personName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{payment.details}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {format(new Date(payment.date), 'dd MMM yyyy', { locale: tr })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-lg font-semibold text-gray-900">
                          {payment.amount.toLocaleString('tr-TR')} ₺
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handlePay(payment)}
                          disabled={paying === payment.id}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {paying === payment.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              İşleniyor...
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Ödeme Yap
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

