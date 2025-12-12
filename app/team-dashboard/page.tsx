'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, CheckCircle2, Clock, Calendar, DollarSign, CreditCard, AlertCircle, Task, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import Link from 'next/link'

export default function TeamDashboardPage() {
  const router = useRouter()
  const [member, setMember] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    totalTasks: 0,
    unpaidAmount: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/team-auth/me')
      const data = await res.json()

      if (!data.member) {
        router.push('/team-login')
        return
      }

      setMember(data.member)
      loadData(data.member.id)
    } catch (error) {
      router.push('/team-login')
    }
  }

  const loadData = async (memberId: string) => {
    try {
      const [tasksRes, paymentsRes] = await Promise.all([
        fetch(`/api/team/${memberId}/tasks`),
        fetch(`/api/team/${memberId}/payments`),
      ])

      const tasksData = await tasksRes.json()
      const paymentsData = await paymentsRes.json()

      if (tasksRes.ok) {
        setTasks(tasksData.tasks || [])
        const pending = (tasksData.tasks || []).filter((t: any) => t.status === 'pending').length
        const completed = (tasksData.tasks || []).filter((t: any) => t.status === 'completed').length
        setStats(prev => ({
          ...prev,
          pendingTasks: pending,
          completedTasks: completed,
          totalTasks: tasksData.tasks?.length || 0,
        }))
      }

      if (paymentsRes.ok) {
        setPayments(paymentsData.payments || [])
        const unpaid = (paymentsData.payments || [])
          .filter((p: any) => !p.paidAt)
          .reduce((sum: number, p: any) => sum + p.amount, 0)
        setStats(prev => ({ ...prev, unpaidAmount: unpaid }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/team-auth/logout', { method: 'POST' })
    router.push('/team-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!member) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{member.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Task className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Toplam Görev</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Bekleyen</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingTasks}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">Tamamlanan</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Ödenmemiş
              </p>
              <p className="text-3xl font-bold text-red-600">
                {stats.unpaidAmount.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {/* IBAN Info */}
          {member.iban && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">IBAN</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">{member.iban}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tasks & Payments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-teal-600" />
                Görevlerim
              </h2>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task: any) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`badge ${
                              task.status === 'completed'
                                ? 'badge-success'
                                : task.status === 'in_progress'
                                ? 'badge-primary'
                                : 'badge-warning'
                            }`}
                          >
                            {task.status === 'completed'
                              ? 'Tamamlandı'
                              : task.status === 'in_progress'
                              ? 'Devam Ediyor'
                              : 'Bekliyor'}
                          </span>
                          {task.priority && (
                            <span className="badge badge-gray">
                              {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                            </span>
                          )}
                        </div>
                      </div>
                      {task.dueDate && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {format(new Date(task.dueDate), 'dd MMM', { locale: tr })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">Henüz görev yok</p>
                )}
              </div>
            </div>

            {/* Payments */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Ödemelerim
              </h2>
              <div className="space-y-3">
                {payments.slice(0, 5).map((payment: any) => (
                  <div
                    key={payment.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {payment.type === 'salary' ? 'Maaş' : payment.type === 'bonus' ? 'Bonus' : 'Komisyon'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{payment.period}</p>
                        {payment.description && (
                          <p className="text-xs text-gray-500 mt-1">{payment.description}</p>
                        )}
                        {payment.paidAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Ödendi: {format(new Date(payment.paidAt), 'dd MMM yyyy', { locale: tr })}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {payment.amount.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                          })}
                        </p>
                        {!payment.paidAt && (
                          <span className="badge badge-danger mt-1">Ödenmedi</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">Henüz ödeme kaydı yok</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


