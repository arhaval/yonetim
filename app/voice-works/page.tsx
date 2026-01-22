'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Mic, Calendar, DollarSign, User, CheckCircle, Clock, Edit, Trash2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface VoiceWork {
  id: string
  title: string
  voiceActorId: string
  voiceActor: {
    id: string
    name: string
    profilePhoto?: string
  }
  voicePrice: number
  voicePaid: boolean
  createdAt: string
  updatedAt: string
}

export default function VoiceWorksPage() {
  const [works, setWorks] = useState<VoiceWork[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)

  useEffect(() => {
    fetchWorks()
  }, [])

  const fetchWorks = async () => {
    try {
      const res = await fetch('/api/content-registry?type=voice')
      if (res.ok) {
        const data = await res.json()
        setWorks(data)
      } else {
        toast.error('Seslendirme işleri yüklenemedi')
      }
    } catch (error) {
      console.error('Error fetching voice works:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPrice = (work: VoiceWork) => {
    setEditingId(work.id)
    setEditPrice(work.voicePrice || 0)
  }

  const handleSavePrice = async (workId: string) => {
    try {
      const res = await fetch(`/api/content-registry/${workId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voicePrice: editPrice })
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

  const handleDelete = async (workId: string) => {
    if (!confirm('Bu işi silmek istediğinizden emin misiniz?')) return

    try {
      const res = await fetch(`/api/content-registry/${workId}`, {
        method: 'DELETE'
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

  const totalAmount = works.reduce((sum, w) => sum + (w.voicePrice || 0), 0)
  const paidAmount = works.filter(w => w.voicePaid).reduce((sum, w) => sum + (w.voicePrice || 0), 0)
  const unpaidAmount = works.filter(w => !w.voicePaid).reduce((sum, w) => sum + (w.voicePrice || 0), 0)

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Mic className="w-10 h-10" />
                <h1 className="text-4xl font-bold">Seslendirme İşleri</h1>
              </div>
              <p className="text-purple-100">Seslendirmenlerin yaptığı işleri yönetin</p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm mb-1">Toplam İş</p>
              <p className="text-5xl font-bold">{works.length}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Toplam Tutar</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalAmount.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Ödenen</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{paidAmount.toLocaleString('tr-TR')} ₺</p>
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
            <h2 className="text-lg font-bold text-gray-900">Tüm İşler</h2>
          </div>

          {works.length === 0 ? (
            <div className="p-12 text-center">
              <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Henüz seslendirme işi yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seslendirmen
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
                  {works.map((work) => (
                    <tr key={work.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {work.voiceActor.profilePhoto ? (
                            <img
                              src={work.voiceActor.profilePhoto}
                              alt={work.voiceActor.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                          )}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{work.voiceActor.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{work.title}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === work.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(Number(e.target.value))}
                              className="w-28 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Ücret"
                            />
                            <button
                              onClick={() => handleSavePrice(work.id)}
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
                              {work.voicePrice ? `${work.voicePrice.toLocaleString('tr-TR')} ₺` : '-'}
                            </span>
                            <button
                              onClick={() => handleEditPrice(work)}
                              className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {work.voicePaid ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            Ödendi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Clock className="w-3 h-3" />
                            Bekliyor
                          </span>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

