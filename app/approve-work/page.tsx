'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import PageHeader from '@/components/PageHeader'
import { CheckCircle, XCircle, Clock, Mic, Video } from 'lucide-react'
import toast from 'react-hot-toast'

interface WorkSubmission {
  id: string
  workType: string
  workName: string
  description: string | null
  status: string
  cost: number | null
  adminNotes: string | null
  createdAt: string
  voiceActor: { id: string; name: string } | null
  teamMember: { id: string; name: string; role: string } | null
}

export default function ApproveWorkPage() {
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ cost: string; adminNotes: string }>({
    cost: '',
    adminNotes: '',
  })

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/work-submissions?status=pending')
      const data = await res.json()
      setSubmissions(data.submissions || [])
    } catch (error) {
      toast.error('İşler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (submission: WorkSubmission) => {
    setEditingId(submission.id)
    setEditData({
      cost: submission.cost?.toString() || '',
      adminNotes: submission.adminNotes || '',
    })
  }

  const handleApprove = async (id: string) => {
    if (!editData.cost || parseFloat(editData.cost) <= 0) {
      toast.error('Lütfen geçerli bir maliyet girin')
      return
    }

    setProcessingId(id)

    try {
      const res = await fetch(`/api/work-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          cost: parseFloat(editData.cost),
          adminNotes: editData.adminNotes,
        }),
      })

      if (res.ok) {
        toast.success('İş onaylandı! Tüm Ödemeler listesine eklendi.')
        setSubmissions(submissions.filter((s) => s.id !== id))
        setEditingId(null)
        setEditData({ cost: '', adminNotes: '' })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Onaylanamadı')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const getWorkTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SHORT_VOICE: '🎙️ Kısa Ses',
      LONG_VOICE: '🎙️ Uzun Ses',
      SHORT_VIDEO: '🎬 Kısa Video',
      LONG_VIDEO: '🎬 Uzun Video',
    }
    return labels[type] || type
  }

  const getSubmitterName = (submission: WorkSubmission) => {
    if (submission.voiceActor) return submission.voiceActor.name
    if (submission.teamMember) return submission.teamMember.name
    return 'Bilinmeyen'
  }

  const getSubmitterRole = (submission: WorkSubmission) => {
    if (submission.voiceActor) return 'Seslendirmen'
    if (submission.teamMember) return submission.teamMember.role || 'Video Editör'
    return ''
  }

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
      <PageHeader
        title="Bekleyen İşler"
        description="Gönderilen işleri inceleyin, maliyet girin ve onaylayın"
      />

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Bekleyen İş Yok</h3>
          <p className="text-gray-600">Şu anda onay bekleyen iş bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {submission.voiceActor ? (
                        <Mic className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Video className="w-5 h-5 text-indigo-600" />
                      )}
                      <h3 className="text-xl font-bold text-gray-900">{submission.workName}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">{getSubmitterName(submission)}</span>
                      <span className="text-gray-400">•</span>
                      <span>{getSubmitterRole(submission)}</span>
                      <span className="text-gray-400">•</span>
                      <span>{getWorkTypeLabel(submission.workType)}</span>
                      <span className="text-gray-400">•</span>
                      <span>{new Date(submission.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    Bekliyor
                  </span>
                </div>

                {submission.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{submission.description}</p>
                  </div>
                )}

                {editingId === submission.id ? (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maliyet (₺) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editData.cost}
                          onChange={(e) => setEditData({ ...editData, cost: e.target.value })}
                          placeholder="örn: 500"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Notları (Opsiyonel)
                        </label>
                        <input
                          type="text"
                          value={editData.adminNotes}
                          onChange={(e) => setEditData({ ...editData, adminNotes: e.target.value })}
                          placeholder="İç not..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditData({ cost: '', adminNotes: '' })
                        }}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handleApprove(submission.id)}
                        disabled={processingId === submission.id}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processingId === submission.id ? 'Onaylanıyor...' : 'Onayla'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={() => handleEdit(submission)}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
                    >
                      Maliyet Gir & Onayla
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

