'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Users, Video, Mic, UserCheck, Shield } from 'lucide-react'

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#1e293b' }}>
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 space-y-8">
          {/* Logo & Header */}
          <div className="text-center">
            <div className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg mb-4 bg-white p-3">
              <Image 
                src="/arhaval-logo.png" 
                alt="Arhaval Logo" 
                width={96}
                height={96}
                className="w-full h-full object-contain"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
            <h1 className="text-4xl font-bold" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Arhaval Denetim Merkezi
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Giriş yapmak için hesap türünüzü seçin
            </p>
          </div>

          {/* Login Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Admin Login */}
            <Link
              href="/admin-login"
              className="group relative bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Admin Girişi</h3>
                  <p className="text-sm text-white/80">Yönetici hesabı ile giriş yapın</p>
                </div>
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Streamer Login */}
            <Link
              href="/streamer-login"
              className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Yayıncı Girişi</h3>
                  <p className="text-sm text-white/80">Yayıncı hesabı ile giriş yapın</p>
                </div>
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Content Creator Login */}
            <Link
              href="/creator-login"
              className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">İçerik Üreticisi</h3>
                  <p className="text-sm text-white/80">İçerik üreticisi hesabı ile giriş yapın</p>
                </div>
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Voice Actor Login */}
            <Link
              href="/voice-actor-login"
              className="group relative bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Seslendirmen</h3>
                  <p className="text-sm text-white/80">Seslendirmen hesabı ile giriş yapın</p>
                </div>
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Team Member Login */}
            <Link
              href="/team-login"
              className="group relative bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Ekip Üyesi</h3>
                  <p className="text-sm text-white/80">Ekip üyesi hesabı ile giriş yapın</p>
                </div>
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Normal User Login */}
            <Link
              href="/login"
              className="group relative bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Genel Giriş</h3>
                  <p className="text-sm text-white/80">Diğer kullanıcılar için giriş</p>
                </div>
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

