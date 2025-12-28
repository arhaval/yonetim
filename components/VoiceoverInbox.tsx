'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Archive, Calendar, User, Mic, DollarSign, FileText, Loader2, Square, CheckSquare2, ExternalLink, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { toast } from 'sonner'
import ScriptDetailDrawer from '@/app/voiceover-scripts/ScriptDetailDrawer'

interface Script {
  id: string
  title: string
  text: string
  status: 'WAITING_VOICE' | 'VOICE_UPLOADED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'ARCHIVED'
  price: number | null
  audioFile: string | null // Deprecated - use voiceLink
  voiceLink: string | null // Ses linki
  contentType: string | null
  notes: string | null
  rejectionReason: string | null
  producerApproved: boolean
  producerApprovedAt: string | null
  producerApprovedBy: string | null
  adminApproved: boolean
  adminApprovedAt: string | null
  adminApprovedBy: string | null
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
  voiceActorId: string | null
  editPack: {
    token: string
    expiresAt: string
  } | null
}

interface VoiceActor {
  id: string
  name: string
}

interface VoiceoverInboxProps {
  initialFilters?: {
    creatorId?: string
    voiceActorId?: string
  }
  showBulkActions?: boolean
  title?: string
}

export default function VoiceoverInbox({ 
  initialFilters = {},
  showBulkActions = true,
  title = 'Seslendirme Metinleri'
}: VoiceoverInboxProps) {
  console.log('[VoiceoverInbox] Component mounted', { initialFilters, showBulkActions, title })
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
  const [producerApprovedFilter, setProducerApprovedFilter] = useState<string>('all') // 'all', 'true', 'false'
  const [adminApprovedFilter, setAdminApprovedFilter] = useState<string>('all') // 'all', 'true', 'false'
  const [hasPriceFilter, setHasPriceFilter] = useState<string>('all') // 'all', 'true', 'false'
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Current user ID (voice actor)
  const [currentVoiceActorId, setCurrentVoiceActorId] = useState<string | null>(null)

  // Current user ID'yi yükle
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }
    const voiceActorId = getCookie('voice-actor-id')
    setCurrentVoiceActorId(voiceActorId || null)
  }, [])

  // İşi Üstlen handler
  const handleAssignScript = async (scriptId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!currentVoiceActorId) {
      toast.error('Giriş yapmanız gerekiyor')
      return
    }

    try {
      const res = await fetch(`/api/voiceover-scripts/${scriptId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('İş üstlenildi')
        
        // Tablo refetch
        await loadScripts()
        
        // Drawer'ı aç ve script'i seç - API'den güncel script'i çek
        try {
          const scriptRes = await fetch(`/api/voiceover-scripts/${scriptId}`)
          if (scriptRes.ok) {
            const scriptData = await scriptRes.json()
            setSelectedScript(scriptData)
            setIsDrawerOpen(true)
            // voiceLink input'una odaklan
            setTimeout(() => {
              const input = document.querySelector('input[placeholder*="drive.google.com"]') as HTMLInputElement
              if (input) {
                input.focus()
              }
            }, 300)
          } else {
            // Fallback: mevcut script'i kullan
            const updatedScript = scripts.find(s => s.id === scriptId)
            if (updatedScript) {
              setSelectedScript(updatedScript)
              setIsDrawerOpen(true)
            }
          }
        } catch (err) {
          console.error('Error loading script details:', err)
          // Fallback: mevcut script'i kullan
          const updatedScript = scripts.find(s => s.id === scriptId)
          if (updatedScript) {
            setSelectedScript(updatedScript)
            setIsDrawerOpen(true)
          }
        }
      } else if (res.status === 409) {
        toast.error('Bu iş başka birine atanmış')
      } else {
        toast.error(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      console.error('Error assigning script:', error)
      toast.error('Bir hata oluştu')
    }
  }

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
        excludeArchived: (!showArchived).toString(),
      })

      // Initial filters (creatorId veya voiceActorId)
      if (initialFilters.creatorId) {
        // API'de creatorId filtresi yok, client-side filter yapacağız
      }
      if (initialFilters.voiceActorId) {
        params.append('voiceActorId', initialFilters.voiceActorId)
      }

      // Diğer filtreler
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (voiceActorFilter !== 'all') {
        params.append('voiceActorId', voiceActorFilter)
      }
      if (hasAudioLinkFilter !== 'all') {
        params.append('hasAudioLink', hasAudioLinkFilter)
      }
      if (producerApprovedFilter !== 'all') {
        params.append('producerApproved', producerApprovedFilter)
      }
      if (adminApprovedFilter !== 'all') {
        params.append('adminApproved', adminApprovedFilter)
      }
      if (hasPriceFilter !== 'all') {
        params.append('hasPrice', hasPriceFilter)
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

      const res = await fetch(`/api/voiceover-scripts?${params.toString()}`, { cache: 'no-store' })
      
      // Debug logging
      console.log('[VoiceoverInbox] API Response:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        url: `/api/voiceover-scripts?${params.toString()}`,
      })
      
      const data = await res.json()
      
      // Debug logging - response data
      console.log('[VoiceoverInbox] API Data:', {
        hasScripts: !!data.scripts,
        scriptsLength: data.scripts?.length || 0,
        pagination: data.pagination,
        error: data.error,
        fullData: data,
      })

      if (res.ok) {
        let filteredScripts = data.scripts || []
        
        console.log('[VoiceoverInbox] Filtered scripts:', {
          beforeFilter: filteredScripts.length,
          initialFilters,
        })
        
        // Client-side filter for creatorId (API'de yok)
        if (initialFilters.creatorId) {
          filteredScripts = filteredScripts.filter((s: Script) => s.creator?.id === initialFilters.creatorId)
        }
        
        console.log('[VoiceoverInbox] Final scripts:', {
          afterFilter: filteredScripts.length,
          scripts: filteredScripts,
        })
        
        setScripts(filteredScripts)
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || filteredScripts.length)
      } else {
        console.error('[VoiceoverInbox] Error loading scripts:', data.error, data)
        toast.error(data.error || 'Metinler yüklenemedi')
      }
    } catch (error) {
      console.error('Error loading scripts:', error)
      toast.error('Metinler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, voiceActorFilter, hasAudioLinkFilter, producerApprovedFilter, adminApprovedFilter, hasPriceFilter, searchQuery, dateFrom, dateTo, showArchived, initialFilters])

  useEffect(() => {
    loadScripts()
  }, [loadScripts])

  // Filtre değiştiğinde sayfayı sıfırla
  useEffect(() => {
    setPage(1)
  }, [statusFilter, voiceActorFilter, hasAudioLinkFilter, producerApprovedFilter, adminApprovedFilter, hasPriceFilter, searchQuery, dateFrom, dateTo, showArchived])

  const handleSelectScript = (scriptId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(scriptId)) {
        newSet.delete(scriptId)
      } else {
        newSet.add(scriptId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === scripts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(scripts.map(s => s.id)))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  const handleBulkAction = async (action: 'approve' | 'reject' | 'pay' | 'archive') => {
    if (selectedIds.size === 0) return

    setIsBulkActionLoading(true)
    try {
      const res = await fetch('/api/voiceover-scripts/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action,
          reason: action === 'reject' ? rejectReason : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`${selectedIds.size} kayıt başarıyla güncellendi`)
        setSelectedIds(new Set())
        setShowRejectModal(false)
        setShowApproveModal(false)
        loadScripts()
      } else {
        toast.error(data.error || 'Toplu işlem başarısız')
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Toplu işlem sırasında bir hata oluştu')
    } finally {
      setIsBulkActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      WAITING_VOICE: { label: 'Ses Bekleniyor', className: 'bg-yellow-100 text-yellow-800' },
      VOICE_UPLOADED: { label: 'Ses Yüklendi', className: 'bg-orange-100 text-orange-800' },
      APPROVED: { label: 'Onaylandı', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Reddedildi', className: 'bg-red-100 text-red-800' },
      PAID: { label: 'Ödendi', className: 'bg-blue-100 text-blue-800' },
      ARCHIVED: { label: 'Arşivlendi', className: 'bg-gray-100 text-gray-800' },
    }
    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Başlık veya metin ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="WAITING_VOICE">Ses Bekleniyor</option>
              <option value="VOICE_UPLOADED">Ses Yüklendi</option>
              <option value="APPROVED">Onaylandı</option>
              <option value="REJECTED">Reddedildi</option>
              <option value="PAID">Ödendi</option>
              <option value="ARCHIVED">Arşivlendi</option>
            </select>

            {/* Voice Actor Filter */}
            <select
              value={voiceActorFilter}
              onChange={(e) => setVoiceActorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tüm Seslendirmenler</option>
              {voiceActors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.name}
                </option>
              ))}
            </select>

            {/* Ses Linki Filter */}
            <select
              value={hasAudioLinkFilter}
              onChange={(e) => setHasAudioLinkFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Ses Linki: Tümü</option>
              <option value="true">Ses Linki: Var</option>
              <option value="false">Ses Linki: Yok</option>
            </select>

            {/* Üretici Onayı Filter */}
            <select
              value={producerApprovedFilter}
              onChange={(e) => setProducerApprovedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Üretici Onayı: Tümü</option>
              <option value="true">Üretici Onayı: Onaylı</option>
              <option value="false">Üretici Onayı: Onaysız</option>
            </select>

            {/* Admin Onayı Filter */}
            <select
              value={adminApprovedFilter}
              onChange={(e) => setAdminApprovedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Admin Onayı: Tümü</option>
              <option value="true">Admin Onayı: Onaylı</option>
              <option value="false">Admin Onayı: Onaysız</option>
            </select>

            {/* Fiyat Filter */}
            <select
              value={hasPriceFilter}
              onChange={(e) => setHasPriceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Fiyat: Tümü</option>
              <option value="true">Fiyat: Var</option>
              <option value="false">Fiyat: Yok</option>
            </select>

            {/* Date Range */}
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Başlangıç"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Bitiş"
              />
            </div>

            {/* Show Archived */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Arşivlenmişleri göster</span>
            </label>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {showBulkActions && selectedIds.size > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 z-50">
            <span>Seçili {selectedIds.size} kayıt</span>
            <button 
              onClick={() => setShowApproveModal(true)} 
              disabled={isBulkActionLoading}
              className="px-3 py-1 bg-white text-indigo-600 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Onayla
            </button>
            <button 
              onClick={() => setShowRejectModal(true)} 
              disabled={isBulkActionLoading}
              className="px-3 py-1 bg-white text-indigo-600 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Reddet
            </button>
            <button 
              onClick={() => handleBulkAction('pay')} 
              disabled={isBulkActionLoading}
              className="px-3 py-1 bg-white text-indigo-600 rounded-md text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Ödendi Yap
            </button>
            <button 
              onClick={() => handleBulkAction('archive')} 
              disabled={isBulkActionLoading}
              className="px-3 py-1 bg-white text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-800 disabled:opacity-50"
            >
              Arşivle
            </button>
            <button 
              onClick={handleClearSelection} 
              disabled={isBulkActionLoading}
              className="px-3 py-1 bg-indigo-700 text-white rounded-md text-sm font-medium hover:bg-indigo-800 disabled:opacity-50"
            >
              Seçimi Temizle
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">Toplam {total} kayıt</p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : scripts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz metin bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {showBulkActions && (
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
                    )}
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
                      Üretici Onayı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin Onayı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metin Tarihi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EditPack
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scripts.map((script) => {
                    const getEditPackUrl = (token: string) => {
                      if (typeof window === 'undefined') return ''
                      const baseUrl = window.location.origin
                      return `${baseUrl}/edit-pack/${token}`
                    }
                    const editPackUrl = script.editPack?.token 
                      ? getEditPackUrl(script.editPack.token)
                      : null
                    const isEditPackExpired = script.editPack?.expiresAt 
                      ? new Date(script.editPack.expiresAt) < new Date()
                      : false

                    return (
                      <tr
                        key={script.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedScript(script)
                          setIsDrawerOpen(true)
                        }}
                      >
                        {showBulkActions && (
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
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(script.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{script.title}</div>
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
                          {(script.voiceLink || script.audioFile) ? (
                            <a
                              href={script.voiceLink || script.audioFile || undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!script.voiceLink && !script.audioFile) {
                                  e.preventDefault()
                                }
                              }}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Var
                            </a>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Yok
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            script.producerApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {script.producerApproved ? 'Onaylı' : 'Onaysız'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            script.adminApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {script.adminApproved ? 'Onaylı' : 'Onaysız'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {script.price && script.price > 0
                              ? script.price.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                })
                              : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedScript(script)
                                setIsDrawerOpen(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Detay
                            </button>
                            {/* İşi Üstlen butonu - sadece voice actor için ve atanmamışsa göster */}
                            {currentVoiceActorId && !script.voiceActorId && (
                              <button
                                onClick={(e) => handleAssignScript(script.id, e)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
                                title="İşi Üstlen"
                              >
                                <UserPlus className="w-3 h-3 mr-1" />
                                Üstlen
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {editPackUrl && !isEditPackExpired ? (
                            <a
                              href={editPackUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                              title="EditPack Linki"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Link
                            </a>
                          ) : script.adminApproved ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                              Yok
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Sayfa {page} / {totalPages} (Toplam {total} kayıt)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Önceki
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Sonraki
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reddetme Nedeni</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              rows={4}
              placeholder="Reddetme nedenini yazın..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                disabled={!rejectReason.trim() || isBulkActionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}

      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Fiyat Girin</h3>
            <input
              type="number"
              value={approvePrice}
              onChange={(e) => setApprovePrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              placeholder="Fiyat (₺)"
              min="0"
              step="0.01"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setApprovePrice(0)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={() => handleBulkAction('approve')}
                disabled={!approvePrice || approvePrice <= 0 || isBulkActionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      {selectedScript && (
        <ScriptDetailDrawer
          script={selectedScript}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            setSelectedScript(null)
          }}
          onUpdate={() => {
            loadScripts()
          }}
        />
      )}
    </>
  )
}

