'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Archive, Calendar, User, Mic, DollarSign, FileText, Loader2, Square, CheckSquare2 } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { toast } from 'sonner'
import ScriptDetailDrawer from './ScriptDetailDrawer'

interface Script {
  id: string
  title: string
  text: string
  status: 'WAITING_VOICE' | 'VOICE_UPLOADED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'ARCHIVED'
  price: number
  audioFile: string | null
  contentType: string | null
  notes: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string
  } | null
  voiceActor: {
    id: string
    name: string
  } | null
}

interface VoiceActor {
  id: string
  name: string
}

export default function VoiceoverScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [voiceActors, setVoiceActors] = useState<VoiceActor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approvePrice, setApprovePrice] = useState<number>(0)
  // Filtreler
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [voiceActorFilter, setVoiceActorFilter] = useState<string>('all')
  const [hasAudioLinkFilter, setHasAudioLinkFilter] = useState<string>('all') // 'all', 'true', 'false'
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20


  // Seslendirmenleri yükle
  useEffect(() => {
    const loadVoiceActors = async () => {
      try {
        const res = await fetch('/api/voice-actors', { cache: 'default' })
        const data = await res.json()
        if (res.ok && Array.isArray(data)) {
          setVoiceActors(data)
        }
      } catch (error) {
        console.error('Error loading voice actors:', error)
      }
    }
    loadVoiceActors()
  }, [])

  // Scripts yükle
  const loadScripts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      // ARCHIVED varsayılan olarak gösterilmez
      if (!showArchived) {
        params.append('excludeArchived', 'true')
      }
      if (voiceActorFilter !== 'all') {
        params.append('voiceActorId', voiceActorFilter)
      }
      if (hasAudioLinkFilter !== 'all') {
        params.append('hasAudioLink', hasAudioLinkFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (dateFrom) {
        params.append('dateFrom', dateFrom)
      }
      if (dateTo) {
        params.append('dateTo', dateTo)
      }

      const res = await fetch(`/api/voiceover-scripts?${params.toString()}`, { cache: 'default' })
      const data = await res.json()

      if (res.ok) {
        setScripts(data.scripts || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || 0)
      } else {
        console.error('Error loading scripts:', data.error)
      }
    } catch (error) {
      console.error('Error loading scripts:', error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, voiceActorFilter, hasAudioLinkFilter, searchQuery, dateFrom, dateTo, showArchived])

  useEffect(() => {
    loadScripts()
  }, [loadScripts])

  // Filtre değiştiğinde sayfayı sıfırla
  useEffect(() => {
    setPage(1)
  }, [statusFilter, voiceActorFilter, hasAudioLinkFilter, searchQuery, dateFrom, dateTo])

  const handleRowClick = (script: Script) => {
    setSelectedScript(script)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedScript(null)
    // Drawer kapandıktan sonra listeyi yenile
    setTimeout(() => {
      loadScripts()
    }, 300)
  }

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === scripts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(scripts.map(s => s.id)))
    }
  }

  const handleSelectScript = (scriptId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(scriptId)) {
      newSelected.delete(scriptId)
    } else {
      newSelected.add(scriptId)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkAction = async (action: 'approve' | 'reject' | 'pay' | 'archive', reason?: string, price?: number) => {
    if (selectedIds.size === 0) {
      toast.error('Lütfen en az bir kayıt seçin')
      return
    }

    setIsBulkActionLoading(true)

    try {
      const res = await fetch('/api/voiceover-scripts/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action,
          reason,
          price,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Optimistic update
        setScripts(prevScripts => {
          return prevScripts.map(script => {
            if (selectedIds.has(script.id)) {
              switch (action) {
                case 'approve':
                  return { ...script, status: 'APPROVED' as const, price: price || script.price }
                case 'reject':
                  return { ...script, status: 'REJECTED' as const, rejectionReason: reason || null }
                case 'pay':
                  return { ...script, status: 'PAID' as const }
                case 'archive':
                  return { ...script, status: 'ARCHIVED' as const }
                default:
                  return script
              }
            }
            return script
          })
        })

        toast.success(data.message || `${selectedIds.size} kayıt başarıyla işlendi`)
        setSelectedIds(new Set())
        setShowRejectModal(false)
        setShowApproveModal(false)
        setRejectReason('')
        setApprovePrice(0)
        
        // Listeyi yenile
        setTimeout(() => {
          loadScripts()
        }, 500)
      } else {
        toast.error(data.error || 'İşlem başarısız oldu')
        if (data.results?.failed && data.results.failed.length > 0) {
          const failedMessages = data.results.failed.map((f: any) => `${f.id}: ${f.reason}`).join('\n')
          toast.error(`Başarısız kayıtlar:\n${failedMessages}`)
        }
      }
    } catch (error: any) {
      console.error('Error performing bulk action:', error)
      toast.error('İşlem sırasında bir hata oluştu')
    } finally {
      setIsBulkActionLoading(false)
    }
  }

  const getStatusBadge = (script: Script) => {
    const statusConfig = {
      WAITING_VOICE: {
        label: 'Ses Bekleniyor',
        icon: FileText,
        className: 'bg-yellow-100 text-yellow-800',
      },
      VOICE_UPLOADED: {
        label: 'Ses Yüklendi',
        icon: Mic,
        className: 'bg-purple-100 text-purple-800',
      },
      APPROVED: {
        label: 'Onaylandı',
        icon: CheckCircle,
        className: 'bg-blue-100 text-blue-800',
      },
      REJECTED: {
        label: 'Reddedildi',
        icon: XCircle,
        className: 'bg-red-100 text-red-800',
      },
      PAID: {
        label: 'Ödendi',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800',
      },
      ARCHIVED: {
        label: 'Arşiv',
        icon: Archive,
        className: 'bg-gray-100 text-gray-800',
      },
    }

    const config = statusConfig[script.status] || {
      label: script.status,
      icon: FileText,
      className: 'bg-gray-100 text-gray-800',
    }

    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
        title={script.status === 'REJECTED' && script.rejectionReason ? script.rejectionReason : undefined}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Seslendirme Metinleri
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Tüm seslendirme metinlerini görüntüleyin ve yönetin ({total} kayıt)
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/voiceover-scripts/new"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Metin Oluştur
            </Link>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-indigo-900">
                  Seçili {selectedIds.size} kayıt
                </span>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                >
                  Seçimi Temizle
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={isBulkActionLoading}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Onayla
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isBulkActionLoading}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reddet
                </button>
                <button
                  onClick={() => handleBulkAction('pay')}
                  disabled={isBulkActionLoading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Ödendi İşaretle
                </button>
                <button
                  onClick={() => handleBulkAction('archive')}
                  disabled={isBulkActionLoading}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Arşivle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowRejectModal(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Reddetme Nedeni</h3>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reddetme nedenini girin..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                  />
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => {
                      if (rejectReason.trim()) {
                        handleBulkAction('reject', rejectReason)
                      } else {
                        toast.error('Lütfen reddetme nedeni girin')
                      }
                    }}
                    disabled={isBulkActionLoading || !rejectReason.trim()}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reddet
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(false)
                      setRejectReason('')
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowApproveModal(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Onaylama Ücreti</h3>
                  <input
                    type="number"
                    value={approvePrice || ''}
                    onChange={(e) => setApprovePrice(parseFloat(e.target.value) || 0)}
                    placeholder="Ücret girin (₺)"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">Seçili {selectedIds.size} kayıt için aynı ücret uygulanacak</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => {
                      if (approvePrice > 0) {
                        handleBulkAction('approve', undefined, approvePrice)
                      } else {
                        toast.error('Lütfen geçerli bir ücret girin')
                      }
                    }}
                    disabled={isBulkActionLoading || approvePrice <= 0}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => {
                      setShowApproveModal(false)
                      setApprovePrice(0)
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtre Barı */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Durum Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="all">Tümü</option>
                <option value="VOICE_UPLOADED">Ses Yüklendi</option>
                <option value="WAITING_VOICE">Ses Bekleniyor</option>
                <option value="REJECTED">Reddedildi</option>
                <option value="APPROVED">Onaylandı</option>
                <option value="PAID">Ödendi</option>
                {showArchived && <option value="ARCHIVED">Arşiv</option>}
              </select>
            </div>

            {/* Seslendiren Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seslendiren
              </label>
              <select
                value={voiceActorFilter}
                onChange={(e) => setVoiceActorFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="all">Tümü</option>
                {voiceActors.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tarih Başlangıç */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Tarih Bitiş */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Arama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arama
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Başlık veya metin..."
                  className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
          {/* Arşiv Toggle */}
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="showArchived"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="showArchived" className="ml-2 text-sm text-gray-700">
              Arşivlenmiş kayıtları göster
            </label>
          </div>
        </div>

        {/* Tablo */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="ml-3 text-gray-600">Yükleniyor...</span>
          </div>
        ) : scripts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Henüz metin bulunamadı</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center"
                        title={selectedIds.size === scripts.length ? 'Tümünü kaldır' : 'Tümünü seç'}
                      >
                        {selectedIds.size === scripts.length ? (
                          <CheckSquare2 className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oluşturan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seslendiren
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ses Linki
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksiyonlar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scripts.map((script) => (
                    <tr
                      key={script.id}
                      onClick={() => handleRowClick(script)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedIds.has(script.id) ? 'bg-indigo-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectScript(script.id)
                          }}
                          className="flex items-center justify-center"
                        >
                          {selectedIds.has(script.id) ? (
                            <CheckSquare2 className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(script)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {script.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {script.creator?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {script.voiceActor?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {script.audioFile ? (
                          <a
                            href={script.audioFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Link Var
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Link Yok
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {script.price > 0
                            ? script.price.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRowClick(script)
                          }}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Detay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:justify-end">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Önceki
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
                <div className="hidden sm:flex sm:items-center">
                  <p className="text-sm text-gray-700">
                    Sayfa <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drawer */}
        {selectedScript && (
          <ScriptDetailDrawer
            script={selectedScript}
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            onUpdate={loadScripts}
          />
        )}
      </div>
    </Layout>
  )
}
