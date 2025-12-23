'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus, User, Mail, Shield, Mic, Video, Camera, Pencil, AlertCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import DeleteButton from '@/components/DeleteButton'
import { useRouter } from 'next/navigation'

interface UnifiedMember {
  id: string
  name: string
  email: string
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
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAllMembers()
  }, [])

  // Dropdown menüyü dışarı tıklanınca kapat
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
      
      // Timeout wrapper - daha kısa timeout
      const fetchWithTimeout = (url: string, timeout = 5000) => {
        return Promise.race([
          fetch(url, { 
            cache: 'force-cache', // Cache kullan
            next: { revalidate: 30 } // 30 saniye cache
          }),
          new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          ),
        ])
      }

      // Paralel API çağrıları - cache ile
      const [teamRes, creatorsRes, voiceRes, streamersRes] = await Promise.all([
        fetchWithTimeout('/api/team').catch(() => ({ ok: false, json: async () => ({ error: 'Timeout' }) })),
        fetchWithTimeout('/api/content-creators').catch(() => ({ ok: false, json: async () => ({ error: 'Timeout' }) })),
        fetchWithTimeout('/api/voice-actors').catch(() => ({ ok: false, json: async () => ({ error: 'Timeout' }) })),
        fetchWithTimeout('/api/streamers').catch(() => ({ ok: false, json: async () => ({ error: 'Timeout' }) })),
      ])

      let combinedMembers: UnifiedMember[] = []

      // Verileri birleştirme
      if (teamRes?.ok) {
        const data = await teamRes.json()
        combinedMembers.push(...(Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id, name: item.name, email: item.email,
          role: item.role || 'Yönetici', type: 'team' as const,
          profilePhoto: item.avatar, isActive: true
        })))
      }
      if (creatorsRes?.ok) {
        const data = await creatorsRes.json()
        combinedMembers.push(...(Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id, name: item.name, email: item.email,
          role: 'İçerik Üreticisi', type: 'content-creator' as const,
          profilePhoto: item.profilePhoto, isActive: item.isActive
        })))
      }
      if (voiceRes?.ok) {
        const data = await voiceRes.json()
        combinedMembers.push(...(Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id, name: item.name, email: item.email,
          role: 'Seslendirmen', type: 'voice-actor' as const,
          profilePhoto: item.profilePhoto, isActive: item.isActive
        })))
      }
      if (streamersRes?.ok) {
        const data = await streamersRes.json()
        combinedMembers.push(...(Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id, name: item.name, email: item.email,
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
    // Düzenleme sayfalarına yönlendirme
    if (member.type === 'team') router.push(`/team/${member.id}`)
    else if (member.type === 'content-creator') router.push(`/content-creators/${member.id}`)
    else if (member.type === 'voice-actor') router.push(`/voice-actors/${member.id}`)
    else if (member.type === 'streamer') router.push(`/streamers/${member.id}`)
  }

  const getRoleIcon = (type: string) => {
    switch (type) {
      case 'team': return <Shield className="w-5 h-5 text-blue-500" />
      case 'content-creator': return <Video className="w-5 h-5 text-purple-500" />
      case 'voice-actor': return <Mic className="w-5 h-5 text-yellow-500" />
      case 'streamer': return <Camera className="w-5 h-5 text-pink-500" />
      default: return <User className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleBadgeColor = (type: string) => {
    switch (type) {
      case 'team': return 'bg-blue-100 text-blue-800'
      case 'content-creator': return 'bg-purple-100 text-purple-800'
      case 'voice-actor': return 'bg-yellow-100 text-yellow-800'
      case 'streamer': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Veri Yüklenemedi</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null)
                fetchAllMembers()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tüm Ekip Yönetimi
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Ekip üyeleri, yayıncılar, içerik üreticileri ve seslendirmenleri buradan yönetin.
            </p>
          </div>
          
          {/* DROPDOWN MENÜ İLE EKLEME BUTONLARI */}
          <div className="mt-4 sm:mt-0" ref={dropdownRef}>
            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Yeni Kişi Ekle
                  <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {showDropdown && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu">
            <Link
              href="/team/new"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setShowDropdown(false)}
            >
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-500" />
                        Ekip Üyesi
                      </div>
            </Link>
            <Link
              href="/voice-actors/new"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex items-center">
                        <Mic className="w-4 h-4 mr-2 text-yellow-500" />
                        Seslendirmen
                      </div>
                    </Link>
                    <Link
                      href="/streamers/new"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex items-center">
                        <Camera className="w-4 h-4 mr-2 text-pink-500" />
                        Yayıncı
                      </div>
                    </Link>
                    <Link
                      href="/content-creators/new"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setShowDropdown(false)}
            >
                      <div className="flex items-center">
                        <Video className="w-4 h-4 mr-2 text-purple-500" />
                        İçerik Üreticisi
                      </div>
            </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LİSTE */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={`${member.type}-${member.id}`}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center flex-1 min-w-0 cursor-pointer" onClick={() => handleEdit(member)}>
                      <div className="flex-shrink-0">
                      {member.profilePhoto ? (
                        <img className="h-12 w-12 rounded-full object-cover" src={member.profilePhoto} alt="" />
                        ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          {getRoleIcon(member.type)}
                        </div>
                            )}
                          </div>
                    <div className="ml-4 truncate">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-indigo-600 truncate">{member.name}</p>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(member.type)}`}>
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>{member.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button onClick={() => handleEdit(member)} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-full">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <DeleteButton id={member.id} type={member.type} onDelete={fetchAllMembers} compact={true} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          </div>
      </div>
    </Layout>
  )
}