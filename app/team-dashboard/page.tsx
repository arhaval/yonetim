'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, CheckCircle2, Clock, Calendar, DollarSign, CreditCard, AlertCircle, ClipboardList, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import Link from 'next/link'
import { AppShell } from '@/components/shared/AppShell'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'

export default function TeamDashboardPage() {
  const router = useRouter()
  const [member, setMember] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [pendingEdits, setPendingEdits] = useState<any[]>([]) // Kurgu bekleyen işler
  const [payments, setPayments] = useState<any[]>([])
  const [financialRecords, setFinancialRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEdit, setSelectedEdit] = useState<any>(null)
  const [editLink, setEditLink] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    totalTasks: 0,
    unpaidAmount: 0,
  })

  useEffect(() => {
    checkAuth()
    
    // Her 30 saniyede bir verileri yenile (finansal kayıtlar için)
    const interval = setInterval(() => {
      if (member?.id) {
        loadData(member.id)
      }
    }, 30000) // 30 saniye

    return () => clearInterval(interval)
  }, [member])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/team-auth/me')
      const data = await res.json()

      if (!data.teamMember) {
        router.push('/team-login')
        return
      }

      setMember(data.teamMember)
      // Cookie'deki team-member-id'yi kullan (daha güvenilir)
      const memberId = data.teamMember.id
      loadData(memberId)
    } catch (error) {
      router.push('/team-login')
    }
  }

  const loadData = async (memberId: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log(`[Team Dashboard] Loading data for member ID: ${memberId}`)
      
      // Timeout wrapper
      const fetchWithTimeout = (url: string, timeout = 10000) => {
        return Promise.race([
          fetch(url, { credentials: 'include' }),
          new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          ),
        ])
      }

      const errorResponse = { ok: false, status: 500, json: async () => ({ error: 'Timeout' }) } as Response

      const [tasksRes, paymentsRes, financialRes] = await Promise.all([
        fetchWithTimeout(`/api/team/${memberId}/tasks`).catch(() => errorResponse),
        fetchWithTimeout(`/api/team/${memberId}/payments`).catch(() => errorResponse),
        fetchWithTimeout(`/api/team/${memberId}/financial`).catch(() => errorResponse),
      ])

      const tasksData = await tasksRes.json().catch(() => ({ error: 'Parse error' }))
      const paymentsData = await paymentsRes.json().catch(() => ({ error: 'Parse error' }))
      const financialData = await financialRes.json().catch(() => ({ error: 'Parse error' }))

      if (tasksRes.ok) {
        setTasks(tasksData.tasks || [])
        const pending = (tasksData.tasks || []).filter((t: any) => t.status === 'pending').length
        const completed = (tasksData.tasks || []).filter((t: any) => t.status === 'completed').length
        setStats(prev => ({
          ...prev,
          pendingTasks: pending,
          completedTasks: completed,
          totalTasks: tasksData.tasks?.length || 0,
        }))
      }

      if (paymentsRes.ok) {
        // Birleşik ödemeler (hem TeamPayment hem FinancialRecord payout)
        const allPayments = paymentsData.payments || []
        setPayments(allPayments)
        const unpaid = allPayments
          .filter((p: any) => p.status === 'unpaid' || !p.paidAt)
          .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
        setStats(prev => ({ ...prev, unpaidAmount: unpaid }))
      } else {
        console.error(`[Team Dashboard] Payments error:`, paymentsRes.status, paymentsData)
        setPayments([])
      }

      if (financialRes.ok) {
        console.log(`[Team Dashboard] Financial records loaded:`, financialData.financialRecords?.length || 0)
        setFinancialRecords(financialData.financialRecords || [])
      } else {
        console.error(`[Team Dashboard] Financial records error:`, financialRes.status, financialData)
        setFinancialRecords([])
      }

      // Kurgu bekleyen işleri yükle (ContentRegistry'den)
      try {
        const editsRes = await fetch('/api/content-registry?status=VOICE_READY')
        const editsData = await editsRes.json()
        if (editsRes.ok) {
          // Sadece bu editöre atanan işleri filtrele
          const myEdits = (editsData.registries || []).filter(
            (edit: any) => edit.editor?.id === memberId
          )
          setPendingEdits(myEdits)
        }
      } catch (e) {
        console.error('Error loading pending edits:', e)
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      setError(error.message || 'Veriler yüklenirken bir hata oluştu')
      setFinancialRecords([])
      setPayments([])
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/team-auth/logout', { method: 'POST' })
    router.push('/team-login')
  }

  // Kurgu linkini gönder
  const handleSubmitEdit = async () => {
    if (!selectedEdit || !editLink.trim()) {
      alert('Kurgu linki boş olamaz')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/content-registry/${selectedEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editLink: editLink,
          status: 'REVIEW', // Admin onayına düşsün
        }),
      })

      if (res.ok) {
        alert('Kurgu başarıyla gönderildi! Admin onayı bekliyor.')
        setShowEditModal(false)
        setSelectedEdit(null)
        setEditLink('')
        loadData(member.id)
      } else {
        const data = await res.json()
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !member) {
    return (
      <AppShell role="team" user={member}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error && !loading) {
    return (
      <AppShell role="team" user={member}>
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Veri Yüklenemedi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              if (member?.id) loadData(member.id)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </AppShell>
    )
  }

  if (!member) {
    return null
  }

  return (
    <AppShell role="team" user={member}>
      <PageHeader
        title={`Hoş geldiniz, ${member.name}`}
        description="İşlerinizi ve ödemelerinizi görüntüleyin"
      />

      <div className="space-y-6">
          {/* Kurgu Bekleyen İşler */}
          {pendingEdits.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-purple-800">Kurgu Bekleyen İşler</h2>
                  <p className="text-sm text-purple-600">{pendingEdits.length} adet iş sizden kurgu bekliyor</p>
                </div>
              </div>
              <div className="space-y-3">
                {pendingEdits.map((edit) => (
                  <div
                    key={edit.id}
                    className="bg-white rounded-xl p-4 border border-purple-200 hover:border-purple-400 transition cursor-pointer"
                    onClick={() => {
                      setSelectedEdit(edit)
                      setEditLink('')
                      setShowEditModal(true)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{edit.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          {edit.editDeadline && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Teslim: {format(new Date(edit.editDeadline), 'dd MMM', { locale: tr })}
                            </span>
                          )}
                          {edit.voiceActor && (
                            <span>🎙️ {edit.voiceActor.name}</span>
                          )}
                          {edit.creator && (
                            <span>✍️ {edit.creator.name}</span>
                          )}
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                        Kurgu Teslim Et
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Toplam Görev</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Bekleyen</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingTasks}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Tamamlanan</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Ödenmemiş
              </p>
              <p className="text-3xl font-bold text-red-600">
                {stats.unpaidAmount.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {/* IBAN Info */}
          {member.iban && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">IBAN</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">{member.iban}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tasks & Payments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-teal-600" />
                Görevlerim
              </h2>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task: any) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`badge ${
                              task.status === 'completed'
                                ? 'badge-success'
                                : task.status === 'in_progress'
                                ? 'badge-primary'
                                : 'badge-warning'
                            }`}
                          >
                            {task.status === 'completed'
                              ? 'Tamamlandı'
                              : task.status === 'in_progress'
                              ? 'Devam Ediyor'
                              : 'Bekliyor'}
                          </span>
                          {task.priority && (
                            <span className="badge badge-gray">
                              {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                            </span>
                          )}
                        </div>
                      </div>
                      {task.dueDate && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {format(new Date(task.dueDate), 'dd MMM', { locale: tr })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">Henüz görev yok</p>
                )}
              </div>
            </div>

            {/* Payments */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Ödemelerim
              </h2>
              <div className="space-y-3">
                {payments.slice(0, 10).map((payment: any) => (
                  <div
                    key={payment.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            {payment.title || (payment.type === 'salary' ? 'Maaş' : payment.type === 'bonus' ? 'Bonus' : payment.type === 'commission' ? 'Komisyon' : 'Ödeme')}
                          </p>
                          {payment.source && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              payment.source === 'financial' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {payment.source === 'financial' ? 'Finansal' : 'İş Ödemesi'}
                            </span>
                          )}
                        </div>
                        {payment.period && (
                          <p className="text-sm text-gray-600 mt-1">{payment.period}</p>
                        )}
                        {payment.description && (
                          <p className="text-xs text-gray-500 mt-1">{payment.description}</p>
                        )}
                        {payment.status === 'paid' || payment.paidAt ? (
                          <p className="text-xs text-green-600 mt-1">
                            Ödendi: {format(new Date(payment.occurredAt || payment.paidAt), 'dd MMM yyyy', { locale: tr })}
                          </p>
                        ) : (
                          <p className="text-xs text-red-600 mt-1">Ödenmedi</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {payment.amount.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </p>
                        {payment.status === 'unpaid' || (!payment.paidAt && payment.status !== 'paid') && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                            Ödenmedi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">Henüz ödeme kaydı yok</p>
                )}
              </div>
            </div>
          </div>

          {/* Finansal Kayıtlar */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Finansal Kayıtlar ({financialRecords.length})
            </h2>
            {financialRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {financialRecords.map((record: any) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(record.date), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {record.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {record.description || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          <span className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {record.type === 'income' ? '+' : '-'}
                            {record.amount.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            ✅ Ödenmiş
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Henüz finansal kayıt bulunmamaktadır.
              </p>
            )}
          </div>
        </div>

      {/* Kurgu Teslim Modal */}
      {showEditModal && selectedEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">{selectedEdit.title}</h3>
              <p className="text-sm text-gray-500 mt-1">Kurguyu tamamlayın ve admin onayına gönderin</p>
            </div>
            <div className="p-6 space-y-4">
              {/* Ses Linki */}
              {selectedEdit.voiceLink && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-2">Ses Dosyası:</p>
                  <a 
                    href={selectedEdit.voiceLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {selectedEdit.voiceLink}
                  </a>
                </div>
              )}

              {/* Metin */}
              {selectedEdit.scriptText && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">Metin:</p>
                  <div 
                    className="text-sm text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEdit.scriptText }}
                  />
                </div>
              )}

              {selectedEdit.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Notlar:</p>
                  <p className="text-sm text-yellow-700">{selectedEdit.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kurgu Linki *
                </label>
                <input
                  type="url"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Kurgu dosyasını Google Drive, Dropbox vb. yükleyip linkini yapıştırın
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500 space-y-1">
                  {selectedEdit.voiceActor && (
                    <p>🎙️ Seslendirmen: <strong>{selectedEdit.voiceActor.name}</strong></p>
                  )}
                  {selectedEdit.creator && (
                    <p>✍️ Metin: <strong>{selectedEdit.creator.name}</strong></p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedEdit(null)
                      setEditLink('')
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSubmitEdit}
                    disabled={submitting || !editLink.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Gönderiliyor...' : 'Kurguyu Teslim Et'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
