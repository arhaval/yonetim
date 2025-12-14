'use client'

import { useState } from 'react'
import { Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react'

interface LoginCredentialsFormProps {
  type: 'streamer' | 'team' | 'voice-actor'
  id: string
  currentEmail?: string | null
  onUpdate?: () => void
}

export default function LoginCredentialsForm({
  type,
  id,
  currentEmail,
  onUpdate,
}: LoginCredentialsFormProps) {
  const [email, setEmail] = useState(currentEmail || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const apiPath = 
        type === 'streamer' ? `/api/streamers/${id}` :
        type === 'team' ? `/api/team/${id}` :
        `/api/voice-actors/${id}`

      const res = await fetch(apiPath, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim() || undefined,
          password: password.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setPassword('')
        if (onUpdate) {
          onUpdate()
        }
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      console.error('Error updating credentials:', error)
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Lock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Giriş Bilgileri</h3>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-600">Giriş bilgileri başarıyla güncellendi!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ornek@email.com"
          />
          <p className="mt-1 text-xs text-gray-500">
            {type === 'streamer' && 'Yayıncı /streamer-login sayfasından giriş yapabilir'}
            {type === 'team' && 'Ekip üyesi /team-login sayfasından giriş yapabilir'}
            {type === 'voice-actor' && 'Seslendirmen /voice-actor-login sayfasından giriş yapabilir'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Lock className="w-4 h-4 inline mr-1" />
            Yeni Şifre
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Şifre değiştirmek istemiyorsanız boş bırakın"
          />
          <p className="mt-1 text-xs text-gray-500">
            Şifre değiştirmek istemiyorsanız boş bırakın
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Güncelleniyor...' : 'Giriş Bilgilerini Güncelle'}
        </button>
      </form>
    </div>
  )
}

