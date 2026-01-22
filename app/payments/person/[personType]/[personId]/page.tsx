'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { DollarSign, ArrowLeft, Calendar, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

interface PaymentItem {
  id: string
  type: string
  title: string
  amount: number
  date: string
  details: string
}

export default function PersonPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const personType = params.personType as string
  const personId = params.personId as string

  const [person, setPerson] = useState<any>(null)
  const [items, setItems] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    fetchPersonPayments()
  }, [])

  const fetchPersonPayments = async () => {
    try {
      const allItems: PaymentItem[] = []

      // Kişi bilgisini al
      let personData = null
      if (personType === 'streamer') {
        const res = await fetch(`/api/streamers/${personId}`)
        if (res.ok) personData = await res.json()
      } else if (personType === 'voiceActor') {
        const res = await fetch(`/api/voice-actors/${personId}`)
        if (res.ok) personData = await res.json()
      } else if (personType === 'teamMember') {
        const res = await fetch(`/api/team/${personId}`)
        if (res.ok) personData = await res.json()
      } else if (personType === 'contentCreator') {
        const res = await fetch(`/api/content-creators/${personId}`)
        if (res.ok) personData = await res.json()
      }

      setPerson(personData)

      // 1. Stream ödemeleri
      if (personType === 'streamer') {
        const streamsRes = await fetch('/api/streams?paymentStatus=pending')
        if (streamsRes.ok) {
          const streams = await streamsRes.json()
          streams
            .filter((s: any) => s.streamerId === personId)
            .forEach((stream: any) => {
              allItems.push({
                id: `stream-${stream.id}`,
                type: 'stream',
                title: stream.matchInfo || 'Yayın',
                amount: stream.streamerEarning || 0,
                date: stream.date,
                details: `${stream.duration} saat - ${stream.teamName || ''}`,
              })
            })
        }
      }

      // 2. ContentRegistry ödemeleri
      const registryRes = await fetch('/api/content-registry?status=PUBLISHED')
      if (registryRes.ok) {
        const data = await registryRes.json()
        const registries = data.registries || []

        registries.forEach((reg: any) => {
          // Seslendirme
          if (reg.voicePrice && !reg.voicePaid) {
            const voicePerson = reg.voiceActor || reg.streamer
            if (voicePerson && voicePerson.id === personId) {
              allItems.push({
                id: `voice-${reg.id}`,
                type: 'voice',
                title: reg.title,
                amount: reg.voicePrice,
                date: reg.createdAt,
                details: 'Seslendirme',
              })
            }
          }

          // Kurgu
          if (reg.editPrice && !reg.editPaid && reg.editor && reg.editor.id === personId) {
            allItems.push({
              id: `edit-${reg.id}`,
              type: 'edit',
              title: reg.title,
              amount: reg.editPrice,
              date: reg.createdAt,
              details: 'Kurgu',
            })
          }
        })
      }

      // Tarihe göre sırala (eski → yeni)
      allItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setItems(allItems)
    } catch (error) {
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount)
    if (!amount || amount <= 0) {
      toast.error('Geçerli bir tutar girin')
      return
    }

    const totalDebt = items.reduce((sum, item) => sum + item.amount, 0)
    if (amount > totalDebt) {
      toast.error('Ödeme tutarı toplam borçtan fazla olamaz')
      return
    }

    if (!confirm(`${person?.name} için ${amount.toLocaleString('tr-TR')} ₺ ödeme yapılacak. Onaylıyor musunuz?`)) {
      return
    }

    setPaying(true)
    try {
      let remaining = amount
      const paidItems: string[] = []

      // En eski işlerden başlayarak öde
      for (const item of items) {
        if (remaining <= 0) break

        const payAmount = Math.min(remaining, item.amount)
        
        // İşi öde
        if (item.type === 'stream') {
          const streamId = item.id.replace('stream-', '')
          await fetch(`/api/streams/${streamId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentStatus: 'paid' }),
          })
        } else if (item.type === 'voice') {
          const registryId = item.id.replace('voice-', '')
          await fetch(`/api/content-registry/${registryId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voicePaid: true }),
          })
        } else if (item.type === 'edit') {
          const registryId = item.id.replace('edit-', '')
          await fetch(`/api/content-registry/${registryId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ editPaid: true }),
          })
        }

        paidItems.push(item.title)
        remaining -= payAmount
      }

      // Finansal kayıt oluştur
      const financialData: any = {
        type: 'expense',
        category: 'Toplu Ödeme',
        amount: amount,
        description: `${person?.name} - Toplu ödeme (${paidItems.length} iş)`,
        date: new Date().toISOString(),
      }

      if (personType === 'streamer') {
        financialData.streamerId = personId
      } else if (personType === 'voiceActor') {
        financialData.voiceActorId = personId
      } else if (personType === 'teamMember') {
        financialData.teamMemberId = personId
      } else if (personType === 'contentCreator') {
        financialData.creatorId = personId
      }

      await fetch('/api/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financialData),
      })

      toast.success(`${amount.toLocaleString('tr-TR')} ₺ ödeme yapıldı!`)
      setPaymentAmount('')
      fetchPersonPayments()
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setPaying(false)
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/all-payments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{person?.name}</h1>
            <p className="text-gray-600 mt-1">Ödeme detayları ve işlemler</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Toplam Borç</p>
              <p className="text-4xl font-bold text-red-700 mt-1">
                {totalAmount.toLocaleString('tr-TR')} ₺
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {items.length} adet ödenmemiş iş
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <p className="text-sm text-gray-600 mb-2">Ödeme Yap</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Tutar"
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={handlePayment}
                  disabled={paying || !paymentAmount}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {paying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      Öde
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                En eski işlerden başlayarak otomatik dağıtılır
              </p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Ödenmemiş İşler</h2>
          </div>
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Tüm ödemeler yapıldı!</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detay
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(item.date), 'dd MMM yyyy', { locale: tr })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{item.details}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        {item.amount.toLocaleString('tr-TR')} ₺
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}

