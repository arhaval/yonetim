'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { ArrowLeft, Save, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

interface Todo {
  id: string
  text: string
  completed: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export default function TodoDetailPage() {
  const router = useRouter()
  const params = useParams()
  const todoId = params.id as string
  
  const [todo, setTodo] = useState<Todo | null>(null)
  const [notes, setNotes] = useState('')
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTodo()
  }, [todoId])

  const loadTodo = async () => {
    try {
      const response = await fetch(`/api/todos/${todoId}`)
      if (response.ok) {
        const data = await response.json()
        setTodo(data.todo)
        setNotes(data.todo.notes || '')
        setCompleted(data.todo.completed)
      } else {
        alert('Yapılacak bulunamadı')
        router.push('/todos')
      }
    } catch (error) {
      console.error('Error loading todo:', error)
      alert('Yapılacak yüklenirken bir hata oluştu')
      router.push('/todos')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, completed }),
      })

      if (response.ok) {
        alert('Notlar kaydedildi')
        router.push('/todos')
      } else {
        throw new Error('Kaydetme başarısız')
      }
    } catch (error) {
      console.error('Error saving todo:', error)
      alert('Notlar kaydedilirken bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleCompleted = async () => {
    const newCompleted = !completed
    setCompleted(newCompleted)
    
    try {
      const response = await fetch(`/api/todos/${todoId}/toggle`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        setCompleted(completed) // Geri al
        throw new Error('Güncelleme başarısız')
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
      alert('Durum güncellenirken bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!todo) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-gray-500 font-medium">Yapılacak bulunamadı</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/todos')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yapılacak Detayı</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Oluşturulma: {format(new Date(todo.createdAt), 'dd MMMM yyyy, HH:mm', { locale: tr })}
            </p>
          </div>
        </div>

        {/* Todo Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-start gap-4 mb-6">
            <button
              onClick={handleToggleCompleted}
              className="flex-shrink-0 mt-1"
            >
              {completed ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <Circle className="w-8 h-8 text-gray-400" />
              )}
            </button>
            <div className="flex-1">
              <h2 className={`text-xl font-bold mb-2 ${
                completed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'
              }`}>
                {todo.text}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {completed ? 'Tamamlandı' : 'Devam ediyor'}
              </p>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Notlar
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bu yapılacak ile ilgili notlarınızı buraya yazın..."
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm font-medium bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[200px] resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => router.push('/todos')}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span>Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

