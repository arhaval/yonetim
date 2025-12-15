'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { Plus, Check, X, DollarSign } from 'lucide-react'
import ApproveStreamButton from '@/components/ApproveStreamButton'
import StreamCostModal from '@/components/StreamCostModal'

type FilterType = 'monthly' | 'total'
type TabType = 'all' | 'pending'

export default function StreamsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [filter, setFilter] = useState<FilterType>('monthly')
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(true)
  const [streams, setStreams] = useState<any[]>([])
  const [pendingStreams, setPendingStreams] = useState<any[]>([])
  const [selectedStream, setSelectedStream] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (activeTab === 'all') {
      fetchData()
    } else if (activeTab === 'pending') {
      fetchPendingStreams()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, selectedMonth, activeTab])

  const fetchData = async () => {
    if (activeTab !== 'all') return
    
    setLoading(true)
    try {
      const response = await fetch('/api/streams/list')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        let filteredStreams = data
        if (filter === 'monthly') {
          filteredStreams = data.filter((stream: any) => {
            try {
              const streamMonth = format(new Date(stream.date), 'yyyy-MM')
              return streamMonth === selectedMonth
            } catch {
              return false
            }
          })
        }
        setStreams(filteredStreams)
      } else {
        console.error('API returned non-array data:', data)
        setStreams([])
      }
    } catch (error) {
      console.error('Error fetching streams:', error)
      setStreams([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingStreams = async () => {
    if (activeTab !== 'pending') return
    
    setLoading(true)
    try {
      const response = await fetch('/api/streams/pending')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setPendingStreams(data)
      } else {
        console.error('API returned non-array data:', data)
        setPendingStreams([])
      }
    } catch (error) {
      console.error('Error fetching pending streams:', error)
      setPendingStreams([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = () => {
    fetchData()
    fetchPendingStreams()
  }

  const getMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = format(date, 'yyyy-MM')
      const label = format(date, 'MMMM yyyy', { locale: tr })
      options.push({ value, label })
    }
    return options
  }

  if (loading && streams.length === 0 && pendingStreams.length === 0) {
    return (
      <Layout>
        <div className="px-4 py-6 sm:px-0">
          <p>Yükleniyor...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yayınlar</h1>
            <p className="mt-2 text-sm text-gray-600">
              Tüm yayınları görüntüleyin ve takip edin
            </p>
          </div>
          <Link
            href="/streams/new"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Yayın
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-100">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tüm Yayınlar
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Onay Bekleyen
              {pendingStreams.length > 0 && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'pending'
                    ? 'bg-white/20 text-white'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {pendingStreams.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Filters - Sadece Tüm Yayınlar sekmesinde göster */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-semibold text-gray-700">Filtre:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="monthly">Aylık</option>
                  <option value="total">Toplam</option>
                </select>
              </div>
              {filter === 'monthly' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-semibold text-gray-700">Ay:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {getMonthOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tüm Yayınlar Tab */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
                <p className="text-gray-500 font-medium">Henüz yayın eklenmemiş</p>
              </div>
            ) : (
              streams.map((stream) => {
                const teams = stream.teams ? JSON.parse(stream.teams) : []
                return (
                  <div key={stream.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative">
                    <Link
                      href={`/streamers/${stream.streamerId}`}
                      className="block"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #08d9d6 0%, #ff2e63 100%)' }}>
                                <span className="text-white font-bold text-sm">Y</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#08d9d6] transition-colors">
                                  {stream.streamer.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(stream.date), 'dd MMM yyyy', { locale: tr })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                            {stream.duration} saat
                          </span>
                        </div>

                        {stream.matchInfo && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {stream.matchInfo}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {stream.teamName ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border" style={{ backgroundColor: 'rgba(8, 217, 214, 0.1)', borderColor: '#08d9d6' + '40', color: '#252a34' }}>
                              {stream.teamName}
                            </span>
                          ) : teams.length > 0 ? (
                            teams.map((team: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border" style={{ backgroundColor: 'rgba(8, 217, 214, 0.1)', borderColor: '#08d9d6' + '40', color: '#252a34' }}
                              >
                                {team}
                              </span>
                            ))
                          ) : null}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Maliyet</span>
                            {stream.streamerEarning > 0 ? (
                              <span className="text-lg font-bold" style={{ color: '#ff2e63' }}>
                                {stream.streamerEarning.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            ) : stream.cost > 0 ? (
                              <span className="text-lg font-bold" style={{ color: '#ff2e63' }}>
                                {stream.cost.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Girilmemiş</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    {/* Silme Butonu */}
                    <div className="absolute top-4 right-4 z-10">
                      <DeleteButton
                        id={stream.id}
                        type="stream"
                        onDelete={() => {
                          fetchData()
                          fetchPendingStreams()
                        }}
                        compact={true}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Onay Bekleyen Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
              <h2 className="text-lg font-bold text-gray-900">Onay Bekleyen Yayınlar</h2>
            </div>
            {pendingStreams.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 font-medium">Onay bekleyen yayın bulunmuyor</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingStreams.map((stream) => (
                  <div key={stream.id} className="px-6 py-5 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-gray-900 mb-2">
                              {stream.matchInfo || 'Yayın'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span>
                                <span className="font-semibold">Yayıncı:</span>{' '}
                                <Link
                                  href={`/streamers/${stream.streamerId}`}
                                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                >
                                  {stream.streamer.name}
                                </Link>
                              </span>
                              <span>
                                <span className="font-semibold">Tarih:</span>{' '}
                                {format(new Date(stream.date), 'dd MMMM yyyy', { locale: tr })}
                              </span>
                              <span>
                                <span className="font-semibold">Süre:</span>{' '}
                                <span className="font-medium">{stream.duration} saat</span>
                              </span>
                              {stream.teamName && (
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                  {stream.teamName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <ApproveStreamButton 
                          streamId={stream.id}
                          onUpdate={handleUpdate}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
