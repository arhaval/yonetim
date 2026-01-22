'use client'

import { useRouter } from 'next/navigation'
import { Video, Mic, Film, User } from 'lucide-react'

export default function GirisPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Arhaval Yönetim</h1>
          <p className="text-xl text-gray-600">Giriş yapmak için rolünüzü seçin</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Admin */}
          <button
            onClick={() => router.push('/login')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-indigo-500 hover:scale-105"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Admin</h2>
            <p className="text-gray-600 text-sm">Yönetim Paneli</p>
          </button>

          {/* Yayıncı */}
          <button
            onClick={() => router.push('/streamer-login')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500 hover:scale-105"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Yayıncı</h2>
            <p className="text-gray-600 text-sm">Yayın Ekle & Takip</p>
          </button>

          {/* Seslendirmen */}
          <button
            onClick={() => router.push('/voice-actor-login')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500 hover:scale-105"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Seslendirmen</h2>
            <p className="text-gray-600 text-sm">İş Ekle & Takip</p>
          </button>

          {/* Video Editör */}
          <button
            onClick={() => router.push('/team-login')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500 hover:scale-105"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Film className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Video Editör</h2>
            <p className="text-gray-600 text-sm">İş Ekle & Takip</p>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Giriş bilgilerinizi unuttuysan mı? Admin ile iletişime geç.
          </p>
        </div>
      </div>
    </div>
  )
}

