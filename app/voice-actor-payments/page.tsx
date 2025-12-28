'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ArrowLeft, DollarSign, CheckCircle, Clock, Calendar, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

export default function VoiceActorPaymentsPage() {
  const router = useRouter()
  const [voiceActor, setVoiceActor] = useState<any>(null)
  const [scripts, setScripts] = useState<any[]>([])
  const [financialRecords, setFinancialRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalUnpaid: 0,
    totalScripts: 0,
    approvedScripts: 0,
    pendingScripts: 0,
    paidScripts: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/voice-actor-auth/me', { cache: 'no-store' })
      const data = await res.json()

      if (!data.voiceActor) {
        router.push('/voice-actor-login')
        return
      }

      setVoiceActor(data.voiceActor)
      loadPayments(data.voiceActor.id)
    } catch (error) {
      router.push('/voice-actor-login')
    } finally {
      setLoading(false)
    }
  }

  const loadPayments = async (voiceActorId: string) => {
    try {
      // Scripts'i çek
      const scriptsRes = await fetch(`/api/voiceover-scripts?voiceActorId=${voiceActorId}&excludeArchived=true`, {
        cache: 'no-store',
      })
      const scriptsData = await scriptsRes.json()
      
      if (scriptsRes.ok && scriptsData.scripts) {
        const allScripts = scriptsData.scripts
        setScripts(allScripts)

        // İstatistikleri hesapla
        const paidScripts = allScripts.filter((s: any) => s.status === 'PAID')
        const approvedScripts = allScripts.filter((s: any) => s.status === 'APPROVED')
        const pendingScripts = allScripts.filter((s: any) => 
          s.status === 'WAITING_VOICE' || s.status === 'VOICE_UPLOADED'
        )
        
        const totalEarnings = paidScripts.reduce((sum: number, s: any) => sum + (s.price || 0), 0)
        const unpaidScripts = allScripts.filter((s: any) => 
          s.status === 'APPROVED' || s.status === 'VOICE_UPLOADED'
        )
        const totalUnpaid = unpaidScripts.reduce((sum: number, s: any) => sum + (s.price || 0), 0)

        setStats({
          totalEarnings,
          totalUnpaid,
          totalScripts: allScripts.length,
          approvedScripts: approvedScripts.length,
          pendingScripts: pendingScripts.length,
          paidScripts: paidScripts.length,
        })
      }

      // Financial records'u çek
      const financialRes = await fetch(`/api/financial?voiceActorId=${voiceActorId}&filter=all`, {
        cache: 'no-store',
      })
      const financialData = await financialRes.json()
      
      if (financialRes.ok) {
        // API response format: { records: [...] } veya direkt array
        const records = financialData.records || financialData || []
        setFinancialRecords(records)
      }
    } catch (error) {
      console.error('Error loading payments:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/voice-actor-auth/logout', { method: 'POST' })
    router.push('/voice-actor-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!voiceActor) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/voice-actor-dashboard"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard'a Dön
              </Link>
              <div className="flex items-center space-x-4 ml-4">
                {voiceActor.profilePhoto ? (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-2 ring-pink-200">
                    <img
                      src={voiceActor.profilePhoto}
                      alt={voiceActor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg ring-2 ring-pink-200">
                    <span className="text-white font-bold text-lg">
                      {voiceActor.name?.charAt(0).toUpperCase() || 'V'}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {voiceActor.name}
                  </h1>
                  <p className="text-sm text-gray-600">Ödemelerim</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Toplam Kazanç</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalEarnings.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.paidScripts} ödenen metin</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-red-600" />
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Ödenmemiş</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.totalUnpaid.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.approvedScripts} onaylanan metin</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Toplam Metin</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalScripts}</p>
            <p className="text-xs text-gray-500 mt-1">Tüm metinler</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Beklemede</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingScripts}</p>
            <p className="text-xs text-gray-500 mt-1">Ses bekleniyor</p>
          </div>
        </div>

        {/* Ödenen Metinler */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Ödenen Metinler ({stats.paidScripts})
            </h2>
          </div>
          <div className="overflow-x-auto">
            {scripts.filter(s => s.status === 'PAID').length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Henüz ödenen metin bulunmuyor</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ücret
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oluşturulma Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme Tarihi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scripts
                    .filter(s => s.status === 'PAID')
                    .map((script) => (
                      <tr key={script.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/voiceover-scripts/${script.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                          >
                            {script.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ödendi
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-green-600">
                            {script.price
                              ? script.price.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                })
                              : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {script.updatedAt
                            ? format(new Date(script.updatedAt), 'dd MMM yyyy', { locale: tr })
                            : '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Bekleyen Ödemeler */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Bekleyen Ödemeler ({stats.approvedScripts})
            </h2>
          </div>
          <div className="overflow-x-auto">
            {scripts.filter(s => s.status === 'APPROVED' || s.status === 'VOICE_UPLOADED').length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Bekleyen ödeme bulunmuyor</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ücret
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oluşturulma Tarihi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scripts
                    .filter(s => s.status === 'APPROVED' || s.status === 'VOICE_UPLOADED')
                    .map((script) => (
                      <tr key={script.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/voiceover-scripts/${script.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                          >
                            {script.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" />
                            {script.status === 'APPROVED' ? 'Onaylandı' : 'Ses Yüklendi'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-yellow-600">
                            {script.price
                              ? script.price.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                })
                              : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Finansal Kayıtlar */}
        {financialRecords.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Finansal Kayıtlar ({financialRecords.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(record.date), 'dd MMM yyyy', { locale: tr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {record.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                        <span className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {record.type === 'income' ? '+' : '-'}
                          {record.amount.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

