'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus, User, Mail, Shield, Mic, Video, Camera, Pencil, AlertCircle, Phone, CreditCard, Search, Filter, MoreVertical, ExternalLink, TrendingUp, Users, DollarSign } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import DeleteButton from '@/components/DeleteButton'
import { useRouter } from 'next/navigation'

interface UnifiedMember {
  id: string
  name: string
  email: string
  phone?: string
  iban?: string
  role: string
  type: 'team' | 'streamer' | 'content-creator' | 'voice-actor'
  profilePhoto?: string | null
  isActive?: boolean
}

export default function TeamPage() {
  const router = useRouter()
  const [members, setMembers] = useState<UnifiedMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAllMembers()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const fetchAllMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const fetchWithTimeout = (url: string, timeout = 8000) => {
        return Promise.race([
          fetch(url, { 
            cache: 'force-cache',
            next: { revalidate: 30 }
          }),
          new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          ),
        ])
      }

      const [teamRes, creatorsRes, voiceRes, streamersRes] = await Promise.all([
        fetchWithTimeout('/api/team').catch(() => ({ ok: false, json: async () => ({ error: 'Timeout' }) })),
        fetchWithTimeout('/api/content-creators').catch(() => ({ ok: false, json: async () => ({ error: 'Timeout' }) })),
        fetchWithTimeout('/api/voice-actors').catch(() => ({ ok: false, json: async () => ({ error: 'Timeout' }) })),
        fetchWithTimeout('/api/streamers').catch(() => ({ ok: false, json: async () => ({ error: 'Timeout' }) })),
      ])

      let combinedMembers: UnifiedMember[] = []

      if (teamRes?.ok) {
        const data = await teamRes.json()
        combinedMembers.push(...(Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id, name: item.name, email: item.email,
          phone: item.phone, iban: item.iban,
          role: item.role || 'Yönetici', type: 'team' as const,
          profilePhoto: item.avatar, isActive: true
        })))
      }
      if (creatorsRes?.ok) {
        const data = await creatorsRes.json()
        combinedMembers.push(...(Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id, name: item.name, email: item.email,
          phone: item.phone, iban: item.iban,
          role: 'İçerik Üreticisi', type: 'content-creator' as const,
          profilePhoto: item.profilePhoto, isActive: item.isActive
        })))
      }
      if (voiceRes?.ok) {
        const data = await voiceRes.json()
        combinedMembers.push(...(Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id, name: item.name, email: item.email,
          phone: item.phone, iban: item.iban,
          role: 'Seslendirmen', type: 'voice-actor' as const,
          profilePhoto: item.profilePhoto, isActive: item.isActive
        })))
      }
      if (streamersRes?.ok) {
        const data = await streamersRes.json()
        combinedMembers.push(...(Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id, name: item.name, email: item.email,
          phone: item.phone, iban: item.iban,
          role: 'Yayıncı', type: 'streamer' as const,
          profilePhoto: item.profilePhoto, isActive: item.isActive
        })))
      }

      setMembers(combinedMembers)
      
      if (combinedMembers.length === 0 && !teamRes?.ok && !creatorsRes?.ok && !voiceRes?.ok && !streamersRes?.ok) {
        setError('Tüm API istekleri başarısız oldu')
      }
    } catch (error: any) {
      console.error('Veriler çekilemedi:', error)
      setError(error.message || 'Veriler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (member: UnifiedMember) => {
    if (member.type === 'team') router.push(`/team/${member.id}`)
    else if (member.type === 'content-creator') router.push(`/content-creators/${member.id}`)
    else if (member.type === 'voice-actor') router.push(`/voice-actors/${member.id}`)
    else if (member.type === 'streamer') router.push(`/streamers/${member.id}`)
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'team': 
        return { 
          icon: Shield, 
          color: 'from-blue-500 to-indigo-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          label: 'Ekip'
        }
      case 'content-creator': 
        return { 
          icon: Video, 
          color: 'from-purple-500 to-pink-600',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          label: 'İçerik Üreticisi'
        }
      case 'voice-actor': 
        return { 
          icon: Mic, 
          color: 'from-amber-500 to-orange-600',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          label: 'Seslendirmen'
        }
      case 'streamer': 
        return { 
          icon: Camera, 
          color: 'from-rose-500 to-red-600',
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-700',
          borderColor: 'border-rose-200',
          label: 'Yayıncı'
        }
      default: 
        return { 
          icon: User, 
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          label: 'Üye'
        }
    }
  }

  // Filtreleme
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || member.type === filterType
    return matchesSearch && matchesFilter
  })

  // İstatistikler
  const stats = {
    total: members.length,
    team: members.filter(m => m.type === 'team').length,
    creators: members.filter(m => m.type === 'content-creator').length,
    voiceActors: members.filter(m => m.type === 'voice-actor').length,
    streamers: members.filter(m => m.type === 'streamer').length,
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Ekip yükleniyor...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-8 text-center max-w-md shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Veri Yüklenemedi</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null)
                fetchAllMembers()
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Ekip Yönetimi
            </h1>
            <p className="mt-1 text-gray-500">
              Tüm ekip üyelerini tek bir yerden yönetin
            </p>
          </div>
          
          {/* Yeni Kişi Ekle Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Kişi Ekle
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                <div className="p-2">
                  {[
                    { href: '/team/new', icon: Shield, label: 'Ekip Üyesi', color: 'blue' },
                    { href: '/voice-actors/new', icon: Mic, label: 'Seslendirmen', color: 'amber' },
                    { href: '/streamers/new', icon: Camera, label: 'Yayıncı', color: 'rose' },
                    { href: '/content-creators/new', icon: Video, label: 'İçerik Üreticisi', color: 'purple' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-${item.color}-100 flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                      </div>
                      <span className="font-medium text-gray-700">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Toplam', value: stats.total, icon: Users, color: 'blue' },
            { label: 'Ekip', value: stats.team, icon: Shield, color: 'indigo' },
            { label: 'İçerik Üreticisi', value: stats.creators, icon: Video, color: 'purple' },
            { label: 'Seslendirmen', value: stats.voiceActors, icon: Mic, color: 'amber' },
            { label: 'Yayıncı', value: stats.streamers, icon: Camera, color: 'rose' },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arama ve Filtre */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="İsim, email veya rol ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">Tümü</option>
              <option value="team">Ekip</option>
              <option value="content-creator">İçerik Üreticisi</option>
              <option value="voice-actor">Seslendirmen</option>
              <option value="streamer">Yayıncı</option>
            </select>
            
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Üye Listesi */}
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sonuç Bulunamadı</h3>
            <p className="text-gray-500">Arama kriterlerinize uygun üye bulunamadı.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => {
              const config = getTypeConfig(member.type)
              const Icon = config.icon
              
              return (
                <div
                  key={`${member.type}-${member.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300"
                >
                  {/* Üst Gradient Bar */}
                  <div className={`h-2 bg-gradient-to-r ${config.color}`} />
                  
                  <div className="p-6">
                    {/* Profil */}
                    <div className="flex items-start gap-4 mb-4">
                      {member.profilePhoto ? (
                        <img 
                          src={member.profilePhoto} 
                          alt={member.name}
                          className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-100"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                          <span className="text-white font-bold text-xl">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">{member.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${config.bgColor} ${config.textColor} mt-1`}>
                          <Icon className="w-3 h-3" />
                          {member.role}
                        </span>
                      </div>
                    </div>
                    
                    {/* İletişim Bilgileri */}
                    <div className="space-y-2 mb-4">
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.iban && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-xs truncate">{member.iban}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Aksiyonlar */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(member)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Profil
                      </button>
                      <DeleteButton id={member.id} type={member.type} onDelete={fetchAllMembers} compact={true} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Üye</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">İletişim</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IBAN</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMembers.map((member) => {
                    const config = getTypeConfig(member.type)
                    const Icon = config.icon
                    
                    return (
                      <tr 
                        key={`${member.type}-${member.id}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {member.profilePhoto ? (
                              <img 
                                src={member.profilePhoto} 
                                alt={member.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                <span className="text-white font-bold text-sm">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="font-semibold text-gray-900">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                            <Icon className="w-3 h-3" />
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {member.email && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {member.iban ? (
                            <span className="font-mono text-xs text-gray-600">{member.iban}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <DeleteButton id={member.id} type={member.type} onDelete={fetchAllMembers} compact={true} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
