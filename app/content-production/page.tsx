'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Film, Mic, Calendar, DollarSign, User, CheckCircle, Clock, Edit, Trash2, Save, X, Video, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Work {
  id: string
  title: string
  description?: string
  contentType?: string
  status: string
  voiceActorId?: string
  voiceActor?: {
    id: string
    name: string
    profilePhoto?: string
  }
  editorId?: string
  editor?: {
    id: string
    name: string
  }
  voicePrice?: number
  editPrice?: number
  voicePaid?: boolean
  editPaid?: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function ContentProductionPage() {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<'all' | 'voice' | 'edit'>('all')

  useEffect(() => {
    fetchWorks()
  }, [])

  const fetchWorks = async () => {
    try {
      setLoading(true)
      
      // API'den TÜM kayıtları çek - type parametresi olmadan
      const res = await fetch('/api/content-registry?limit=1000', { 
        credentials: 'include' 
      })
      
      if (res.ok) {
        const data = await res.json()
        console.log('API Response:', data) // Debug için
        
        // Eğer pagination ile geliyorsa
        const items = data.registries || data
        
        // Sadece voiceActorId veya editorId olanları filtrele
        const processedWorks = (Array.isArray(items) ? items : [])
          .filter((item: any) => {
            return item.voiceActorId || item.editorId
          })
          .map((item: any) => ({
            ...item,
            type: item.voiceActorId ? 'voice' : 'edit'
          }))
        
        console.log('Processed Works:', processedWorks) // Debug için
        setWorks(processedWorks)
      } else {
        toast.error('İçerik üretim işleri yüklenemedi')
      }
    } catch (error) {
      console.error('Error fetching works:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPrice = (work: Work) => {
    setEditingId(work.id)
    const isVoice = !!work.voiceActorId
    setEditPrice(isVoice ? (work.voicePrice || 0) : (work.editPrice || 0))
  }

  const handleSavePrice = async (work: Work) => {
    try {
      const isVoice = !!work.voiceActorId
      const updateData = isVoice 
        ? { voicePrice: editPrice }
        : { editPrice: editPrice }

      const res = await fetch(`/api/content-registry/${work.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })

      if (res.ok) {
        toast.success('Ücret güncellendi')
        setEditingId(null)
        fetchWorks()
      } else {
        toast.error('Ücret güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating price:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const handleMarkPaid = async (work: Work) => {
    try {
      const isVoice = !!work.voiceActorId
      const updateData = isVoice 
        ? { voicePaid: true }
        : { editPaid: true }

      const res = await fetch(`/api/content-registry/${work.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })

      if (res.ok) {
        toast.success('Ödeme durumu güncellendi')
        fetchWorks()
      } else {
        toast.error('Ödeme durumu güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const handleDelete = async (workId: string) => {
    if (!confirm('Bu işi silmek istediğinizden emin misiniz?')) return

    try {
      const res = await fetch(`/api/content-registry/${workId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (res.ok) {
        toast.success('İş silindi')
        fetchWorks()
      } else {
        toast.error('İş silinemedi')
      }
    } catch (error) {
      console.error('Error deleting work:', error)
      toast.error('Bir hata oluştu')
    }
  }

  // Filtreleme
  const filteredWorks = works.filter(work => {
    if (activeTab === 'all') return true
    if (activeTab === 'voice') return !!work.voiceActorId
    if (activeTab === 'edit') return !!work.editorId
    return true
  })

  // İstatistikler
  const voiceWorks = works.filter(w => !!w.voiceActorId)
  const editWorks = works.filter(w => !!w.editorId)
  
  const totalVoiceAmount = voiceWorks.reduce((sum, w) => sum + (w.voicePrice || 0), 0)
  const paidVoiceAmount = voiceWorks.filter(w => w.voicePaid).reduce((sum, w) => sum + (w.voicePrice || 0), 0)
  const unpaidVoiceAmount = voiceWorks.filter(w => !w.voicePaid).reduce((sum, w) => sum + (w.voicePrice || 0), 0)
  
  const totalEditAmount = editWorks.reduce((sum, w) => sum + (w.editPrice || 0), 0)
  const paidEditAmount = editWorks.filter(w => w.editPaid).reduce((sum, w) => sum + (w.editPrice || 0), 0)
  const unpaidEditAmount = editWorks.filter(w => !w.editPaid).reduce((sum, w) => sum + (w.editPrice || 0), 0)

  const totalAmount = totalVoiceAmount + totalEditAmount
  const paidAmount = paidVoiceAmount + paidEditAmount
  const unpaidAmount = unpaidVoiceAmount + unpaidEditAmount

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
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Video className="w-10 h-10" />
                <h1 className="text-4xl font-bold">İçerik Merkezi</h1>
              </div>
              <p className="text-indigo-100">Seslendirme ve video edit işlerini yönetin</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm mb-1">Toplam İş</p>
              <p className="text-5xl font-bold">{works.length}</p>
            </div>
          </div>
        </div>

        {/* Debug Info - Geliştirme için */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Debug:</strong> Toplam {works.length} iş yüklendi 
              ({voiceWorks.length} seslendirme, {editWorks.length} video edit)
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-md border border-gray-100">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Video className="w-5 h-5" />
            Tümü ({works.length})
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Mic className="w-5 h-5" />
            Seslendirme ({voiceWorks.length})
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'edit'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Film className="w-5 h-5" />
            Video Edit ({editWorks.length})
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Toplam Tutar</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalAmount.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-gray-400 mt-1">
                  Ses: {totalVoiceAmount.toLocaleString('tr-TR')} ₺ • Edit: {totalEditAmount.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Ödenen</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{paidAmount.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-green-400 mt-1">
                  Ses: {paidVoiceAmount.toLocaleString('tr-TR')} ₺ • Edit: {paidEditAmount.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Bekleyen</p>
                <p className="text-3xl font-bold text-red-700 mt-1">{unpaidAmount.toLocaleString('tr-TR')} ₺</p>
                <p className="text-xs text-red-400 mt-1">
                  Ses: {unpaidVoiceAmount.toLocaleString('tr-TR')} ₺ • Edit: {unpaidEditAmount.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Works List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">
              {activeTab === 'all' && 'Tüm İşler'}
              {activeTab === 'voice' && 'Seslendirme İşleri'}
              {activeTab === 'edit' && 'Video Edit İşleri'}
            </h2>
          </div>

          {filteredWorks.length === 0 ? (
            <div className="p-12 text-center">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Henüz iş yok</p>
              <p className="text-sm text-gray-400 mt-2">Seslendirmenler ve video editörler iş gönderdiğinde burada görünecek</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tür
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kişi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İş Başlığı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ücret
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWorks.map((work) => {
                    const isVoice = !!work.voiceActorId
                    const person = isVoice ? work.voiceActor : work.editor
                    const price = isVoice ? work.voicePrice : work.editPrice
                    const isPaid = isVoice ? work.voicePaid : work.editPaid
                    
                    return (
                      <tr key={work.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isVoice ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Mic className="w-3 h-3" />
                              Seslendirme
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Film className="w-3 h-3" />
                              Video Edit
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {isVoice && work.voiceActor?.profilePhoto ? (
                              <img
                                src={work.voiceActor.profilePhoto}
                                alt={person?.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isVoice ? 'bg-purple-100' : 'bg-green-100'
                              }`}>
                                <User className={`w-5 h-5 ${isVoice ? 'text-purple-600' : 'text-green-600'}`} />
                              </div>
                            )}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{person?.name || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{work.title}</p>
                          {work.description && (
                            <p className="text-xs text-gray-500 mt-1">{work.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === work.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(Number(e.target.value))}
                                className={`w-28 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent ${
                                  isVoice ? 'focus:ring-purple-500' : 'focus:ring-green-500'
                                }`}
                                placeholder="Ücret"
                              />
                              <button
                                onClick={() => handleSavePrice(work)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {price ? `${price.toLocaleString('tr-TR')} ₺` : '-'}
                              </span>
                              <button
                                onClick={() => handleEditPrice(work)}
                                className={`p-1 rounded ${
                                  isVoice 
                                    ? 'text-purple-600 hover:bg-purple-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3" />
                              Ödendi
                            </span>
                          ) : (
                            <button
                              onClick={() => handleMarkPaid(work)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
                            >
                              <Clock className="w-3 h-3" />
                              Bekliyor
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(work.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete(work.id)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
