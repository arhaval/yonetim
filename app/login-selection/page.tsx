'use client'

import Link from 'next/link'
import { Video, Mic, UserCheck } from 'lucide-react'

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-white rounded-lg p-2">
              <img 
                src="/arhaval-logo.png?v=2" 
                alt="Arhaval Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Arhaval Denetim Merkezi
            </h1>
            <p className="text-sm text-gray-500">
              Hesap türünüzü seçin
            </p>
          </div>

          {/* Login Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Streamer Login */}
            <Link
              href="/streamer-login"
              className="group relative flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Video className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Yayıncı Girişi</h3>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Content Creator Login */}
            <Link
              href="/creator-login"
              className="group relative flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">İçerik Üreticisi</h3>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Voice Actor Login */}
            <Link
              href="/voice-actor-login"
              className="group relative flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                <Mic className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Seslendirmen</h3>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Team Member Login */}
            <Link
              href="/team-login"
              className="group relative flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all duration-200 md:col-span-2"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                <UserCheck className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Ekip Üyesi</h3>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

