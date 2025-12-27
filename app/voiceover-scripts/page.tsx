'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Archive, Calendar, User, Mic, DollarSign, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import ScriptDetailDrawer from './ScriptDetailDrawer'

interface Script {
  id: string
  title: string
  text: string
  status: string
  price: number
  audioFile: string | null
  contentType: string | null
  notes: string | null
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
  
  // Filtreler
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [voiceActorFilter, setVoiceActorFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
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
      if (voiceActorFilter !== 'all') {
        params.append('voiceActorId', voiceActorFilter)
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
  }, [page, statusFilter, voiceActorFilter, searchQuery, dateFrom, dateTo])

  useEffect(() => {
    loadScripts()
  }, [loadScripts])

  // Filtre değiştiğinde sayfayı sıfırla
  useEffect(() => {
    setPage(1)
  }, [statusFilter, voiceActorFilter, searchQuery, dateFrom, dateTo])

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

  const getStatusBadge = (script: Script) => {
    // Ses yüklendi ama onaylanmadı
    if (script.audioFile && script.status !== 'approved' && script.status !== 'paid') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Mic className="w-3 h-3 mr-1" />
          Ses Yüklendi
        </span>
      )
    }
    
    // Ses bekleniyor
    if (script.status === 'pending' && !script.audioFile) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FileText className="w-3 h-3 mr-1" />
          Ses Bekleniyor
        </span>
      )
    }
    
    // Onaylandı
    if (script.status === 'approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Onaylandı
        </span>
      )
    }
    
    // Ödendi
    if (script.status === 'paid') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ödendi
        </span>
      )
    }
    
    // Creator onayladı
    if (script.status === 'creator-approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Creator Onayladı
        </span>
      )
    }
    
    // Arşiv
    if (script.status === 'archived') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Archive className="w-3 h-3 mr-1" />
          Arşiv
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {script.status}
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

        {/* Filtre Barı */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <option value="audio-uploaded">Ses Yüklendi</option>
                <option value="pending">Ses Bekleniyor</option>
                <option value="approved">Onaylandı</option>
                <option value="paid">Ödendi</option>
                <option value="archived">Arşiv</option>
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
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
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
