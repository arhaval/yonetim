'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus, User, Mail, Shield, Mic, Video, Camera } from 'lucide-react'
import { useState, useEffect } from 'react'
import DeleteButton from '@/components/DeleteButton'

// Farklı tiplerdeki üyeleri tek bir yapıda toplamak için interface
interface UnifiedMember {
  id: string
  name: string
  email: string
  role: string // Ekranda görünecek ünvan
  type: 'team' | 'streamer' | 'content-creator' | 'voice-actor' // Silme butonu için tip
  profilePhoto?: string | null
  isActive?: boolean
}

export default function TeamPage() {
  const [members, setMembers] = useState<UnifiedMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllMembers()
  }, [])

  const fetchAllMembers = async () => {
    try {
      setLoading(true)
      
      // Tüm API'lerden verileri aynı anda çekelim
      const [teamRes, creatorsRes, voiceRes, streamersRes] = await Promise.all([
        fetch('/api/team').catch(() => null),
        fetch('/api/content-creators').catch(() => null),
        fetch('/api/voice-actors').catch(() => null),
        fetch('/api/streamers').catch(() => null)
      ])

      let combinedMembers: UnifiedMember[] = []

      // 1. Ekip Üyelerini Ekle
      if (teamRes?.ok) {
        const data = await teamRes.json()
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          role: item.role || 'Ekip Üyesi', // Yönetici, Editör vb.
          type: 'team' as const,
          profilePhoto: item.avatar, // Team tablosunda avatar olabilir
          isActive: true
        }))
        combinedMembers = [...combinedMembers, ...mapped]
      }

      // 2. İçerik Üreticilerini Ekle
      if (creatorsRes?.ok) {
        const data = await creatorsRes.json()
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          role: 'İçerik Üreticisi',
          type: 'content-creator' as const,
          profilePhoto: item.profilePhoto,
          isActive: item.isActive
        }))
        combinedMembers = [...combinedMembers, ...mapped]
      }

      // 3. Seslendirmenleri Ekle
      if (voiceRes?.ok) {
        const data = await voiceRes.json()
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          role: 'Seslendirmen',
          type: 'voice-actor' as const,
          profilePhoto: item.profilePhoto,
          isActive: item.isActive
        }))
        combinedMembers = [...combinedMembers, ...mapped]
      }

      // 4. Yayıncıları Ekle (İstersen bunu çıkarabilirsin)
      if (streamersRes?.ok) {
        const data = await streamersRes.json()
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          role: 'Yayıncı',
          type: 'streamer' as const,
          profilePhoto: item.profilePhoto,
          isActive: item.isActive
        }))
        combinedMembers = [...combinedMembers, ...mapped]
      }

      setMembers(combinedMembers)
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  // Rolüne göre ikon getiren fonksiyon
  const getRoleIcon = (type: string) => {
    switch (type) {
      case 'team': return <Shield className="w-5 h-5 text-blue-500" />
      case 'content-creator': return <Video className="w-5 h-5 text-purple-500" />
      case 'voice-actor': return <Mic className="w-5 h-5 text-yellow-500" />
      case 'streamer': return <Camera className="w-5 h-5 text-pink-500" />
      default: return <User className="w-5 h-5 text-gray-500" />
    }
  }

  // Rolüne göre renk getiren fonksiyon
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
        <div className="space-y-6">
          <p>Yükleniyor...</p>
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
              Tüm Ekip
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Yöneticiler, İçerik Üreticileri, Seslendirmenler ve Yayıncılar
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            {/* Buradaki buton sadece Admin/Yönetici eklemek içindir */}
            <Link
              href="/team/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yönetici Ekle
            </Link>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz kimse yok
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Sisteme yeni kişiler ekleyerek başlayın.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={`${member.type}-${member.id}`}
                className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-full flex items-center justify-between p-6 space-x-6">
                  <div className="flex-1 truncate">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-gray-900 text-sm font-medium truncate">
                        {member.name}
                      </h3>
                      <span className={`flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(member.type)}`}>
                        {member.role}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-500 text-sm truncate flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {member.email}
                    </p>
                  </div>
                  {member.profilePhoto ? (
                    <img
                      className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 object-cover"
                      src={member.profilePhoto}
                      alt=""
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getRoleIcon(member.type)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="-mt-px flex divide-x divide-gray-200">
                    <div className="w-0 flex-1 flex">
                      <div className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500">
                         {/* Pasiflik kontrolü sadece bazı tiplerde var */}
                         {member.isActive === false && <span className="text-red-500 mr-2">(Pasif)</span>}
                         <span className="text-gray-500">{member.type === 'team' ? 'Yönetim' : 'Personel'}</span>
                      </div>
                    </div>
                    <div className="w-0 flex-1 flex">
                       <div className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg">
                          {/* SİLME BUTONU - Herkesi kendi tipine göre silecek */}
                          <DeleteButton 
                            id={member.id} 
                            type={member.type} 
                            onDelete={fetchAllMembers} // Sildikten sonra listeyi yenile
                            compact={false} 
                          />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}