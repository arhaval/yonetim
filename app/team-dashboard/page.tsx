'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, DollarSign, CheckCircle2, Clock, Film, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import toast from 'react-hot-toast'

interface Work {
  id: string
  title: string
  editPrice: number
  editPaid: boolean
  status: string
  createdAt: string
}

export default function TeamDashboardPage() {
  const router = useRouter()
  const [member, setMember] = useState<any>(null)
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/team-auth/me')
      const data = await res.json()

      if (!data.teamMember) {
        router.push('/team-login')
        return
      }

      setMember(data.teamMember)
      loadData(data.teamMember.id)
    } catch (error) {
      toast.error('Oturum bilgileri yüklenemedi')
      router.push('/team-login')
    }
  }

  const loadData = async (memberId: string) => {
    try {
      const res = await fetch(`/api/team/${memberId}/tasks`)
      const data = await res.json()
      if (res.ok) {
        setWorks(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading works:', error)
      toast.error('İş kayıtları yüklenemedi')
      setWorks([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/team-auth/logout', { method: 'POST' })
      router.push('/team-login')
    } catch (error) {
      router.push('/team-login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!member) return null

  const paidEarnings = works.filter(w => w.editPaid).reduce((sum, work) => sum + (work.editPrice || 0), 0)
  const totalEarnings = paidEarnings
  const pendingEarnings = works.filter(w => !w.editPaid).reduce((sum, work) => sum + (work.editPrice || 0), 0)
  const completedWorks = works.filter((w: any) => w.status === 'COMPLETED' || w.status === 'APPROVED').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hoş geldiniz, {member.name}</h1>
              <p className="text-gray-600">İş ve kazanç bilgilerinizi buradan takip edebilirsiniz</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/submit-work')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                İş Gönder
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistikler */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Kazanç</p>
                <p className="text-2xl font-bold text-gray-900">₺{totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ödenen</p>
                <p className="text-2xl font-bold text-gray-900">₺{paidEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bekleyen Ödeme</p>
                <p className="text-2xl font-bold text-gray-900">₺{pendingEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Film className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tamamlanan İş</p>
                <p className="text-2xl font-bold text-gray-900">{completedWorks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Son İşler */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Son İşlerim</h2>
          </div>
          <div className="p-6">
            {works.length === 0 ? (
              <div className="text-center py-12">
                <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Henüz iş kaydı bulunmuyor</p>
                <button
                  onClick={() => router.push('/submit-work')}
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  İlk İşini Gönder
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tarih</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Başlık</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Durum</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Kazanç</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Ödeme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.slice(0, 10).map((work: any) => (
                      <tr key={work.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(work.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="py-3 px-4 text-sm">{work.title || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            work.status === 'COMPLETED' || work.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {work.status === 'COMPLETED' ? 'Tamamlandı' :
                             work.status === 'APPROVED' ? 'Onaylandı' :
                             work.status === 'PENDING' ? 'Beklemede' : work.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          {work.editPrice ? `₺${work.editPrice.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            work.editPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {work.editPaid ? 'Ödendi' : 'Bekliyor'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
