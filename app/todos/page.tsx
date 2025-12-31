'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, Edit2, Save, X } from 'lucide-react'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      const response = await fetch('/api/todos')
      if (response.ok) {
        const data = await response.json()
        setTodos(data.todos || [])
      }
    } catch (error) {
      console.error('Error loading todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo }),
      })

      if (response.ok) {
        setNewTodo('')
        loadTodos()
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('Yapılacak eklenirken bir hata oluştu')
    }
  }

  const handleToggleTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}/toggle`, {
        method: 'PATCH',
      })

      if (response.ok) {
        loadTodos()
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  const handleDeleteTodo = async (id: string) => {
    if (!confirm('Bu yapılacak öğesini silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadTodos()
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
      alert('Yapılacak silinirken bir hata oluştu')
    }
  }

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editingText.trim()) return

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editingText }),
      })

      if (response.ok) {
        setEditingId(null)
        setEditingText('')
        loadTodos()
      }
    } catch (error) {
      console.error('Error updating todo:', error)
      alert('Yapılacak güncellenirken bir hata oluştu')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingText('')
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yapılacaklar</h1>
            <p className="mt-2 text-sm text-gray-600">
              Yapmanız gereken işleri buraya not alın
            </p>
          </div>
        </div>

        {/* Add Todo Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              placeholder="Yeni yapılacak ekle..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <button
              onClick={handleAddTodo}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ekle
            </button>
          </div>
        </div>

        {/* Todos List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Yapılacaklar Listesi</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {todos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 font-medium">Henüz yapılacak öğesi yok</p>
                <p className="text-sm text-gray-400 mt-2">Yukarıdan yeni bir yapılacak ekleyebilirsiniz</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    todo.completed ? 'bg-green-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTodo(todo.id)}
                      className="flex-shrink-0"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                    {editingId === todo.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(todo.id)
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(todo.id)}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p
                          className={`flex-1 text-sm font-medium ${
                            todo.completed
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {todo.text}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(todo)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 ml-9">
                    {format(new Date(todo.createdAt), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

