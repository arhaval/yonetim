'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { CheckCircle, Clock, DollarSign, User, FileText, CreditCard, AlertCircle, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

interface PendingPayment {
  id: string
  registryId: string
  title: string
  type: 'voice' | 'edit'
  personId: string
  personName: string
  personType: 'voiceActor' | 'streamer' | 'editor'
  amount: number
  paid: boolean
  createdAt: string
}

export default function PendingPaymentsPage() {
  const [payments, setPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // PUBLISHED durumundaki ve ödenmemiş içerikleri getir
      const res = await fetch('/api/content-registry?status=PUBLISHED')
      if (res.ok) {
        const data = await res.json()
        const registries = data.registries || []
        
        // Ödenmemiş ödemeleri listele
        const pendingPayments: PendingPayment[] = []
        
        registries.forEach((reg: any) => {
          // Seslendirme ödemesi
          if (reg.voicePrice && !reg.voicePaid) {
            const voicePerson = reg.voiceActor || reg.streamer
            if (voicePerson) {
              pendingPayments.push({
                id: `${reg.id}-voice`,
                registryId: reg.id,
                title: reg.title,
                type: 'voice',
                personId: voicePerson.id,
                personName: voicePerson.name,
                personType: reg.voiceActor ? 'voiceActor' : 'streamer',
                amount: reg.voicePrice,
                paid: false,
                createdAt: reg.createdAt,
              })
            }
          }
          
          // Kurgu ödemesi
          if (reg.editPrice && !reg.editPaid && reg.editor) {
            pendingPayments.push({
              id: `${reg.id}-edit`,
              registryId: reg.id,
              title: reg.title,
              type: 'edit',
              personId: reg.editor.id,
              personName: reg.editor.name,
              personType: 'editor',
              amount: reg.editPrice,
              paid: false,
              createdAt: reg.createdAt,
            })
          }
        })
        
        setPayments(pendingPayments)
      }
    } catch (err) {
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  // Ödeme yap
  const handlePay = async (payment: PendingPayment) => {
    if (!confirm(`${payment.personName} için ${payment.amount.toLocaleString('tr-TR')} TL ödeme yapılacak. Onaylıyor musunuz?`)) {
      return
    }

    setSubmitting(payment.id)
    try {
      // 1. ContentRegistry'de ödeme durumunu güncelle
      const updateData: any = {}
      if (payment.type === 'voice') {
        updateData.voicePaid = true
      } else {
        updateData.editPaid = true
      }

      const updateRes = await fetch(`/api/content-registry/${payment.registryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!updateRes.ok) {
        throw new Error('Ödeme durumu güncellenemedi')
      }

      // 2. Finansal kayıt oluştur
      const financialData = {
        type: 'expense',
        category: payment.type === 'voice' ? 'Seslendirme Ödemesi' : 'Kurgu Ödemesi',
        amount: payment.amount,
        description: `${payment.title} - ${payment.personName}`,
        date: new Date().toISOString(),
        // İlgili kişiye bağla
        ...(payment.personType === 'voiceActor' && { voiceActorId: payment.personId }),
        ...(payment.personType === 'streamer' && { streamerId: payment.personId }),
        ...(payment.personType === 'editor' && { teamMemberId: payment.personId }),
      }

      const financialRes = await fetch('/api/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financialData),
      })

      if (!financialRes.ok) {
        throw new Error('Finansal kayıt oluşturulamadı')
      }

      toast.success(`${payment.personName} için ödeme yapıldı ve finansal kayıtlara eklendi!`)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setSubmitting(null)
    }
  }

  // Toplam ödenmemiş tutar
  const totalPending = payments.reduce((sum, p) => sum + p.amount, 0)

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
            <h1 className="text-3xl font-bold text-gray-900">Ödeme Bekleyenler</h1>
            <p className="text-gray-600 mt-1">Onaylanmış içeriklerin ödenmemiş ödemelerini yönetin</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">Toplam Bekleyen</p>
            <p className="text-2xl font-bold text-red-700">
              {totalPending.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </p>
          </div>
        </div>

        {/* Bilgi Kutusu */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Ödeme Akışı:</p>
              <p>Ödeme yapıldığında otomatik olarak finansal kayıtlara gider olarak eklenir. Ödeme yapılmadan finansal kayıtlara düşmez.</p>
            </div>
          </div>
        </div>

        {/* Ödeme Listesi */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Wallet className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tüm ödemeler yapıldı!</h3>
            <p className="text-gray-600">Şu anda bekleyen ödeme bulunmuyor.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İçerik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kişi
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
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.type === 'voice' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {payment.type === 'voice' ? '🎙️ Seslendirme' : '🎬 Kurgu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{payment.personName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        {payment.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handlePay(payment)}
                        disabled={submitting === payment.id}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {submitting === payment.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Ödeme Yap
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

