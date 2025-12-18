'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Video, Mic, UserCheck, Shield } from 'lucide-react'

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 sm:p-12 space-y-10 border border-white/20">
          {/* Logo & Header */}
          <div className="text-center">
            <div className="mx-auto w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl mb-6 bg-white p-4 ring-4 ring-white/20">
              <Image 
                src="/arhaval-logo.png" 
                alt="Arhaval Logo" 
                width={120}
                height={120}
                className="w-full h-full object-contain"
                priority
                unoptimized
              />
            </div>
            <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Arhaval Denetim Merkezi
            </h1>
            <p className="text-xl text-white/90 font-medium">
              Giriş yapmak için hesap türünüzü seçin
            </p>
          </div>

          {/* Login Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {/* Admin Login */}
            <Link
              href="/admin-login"
              className="group relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-8 shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 border border-white/10"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm ring-2 ring-white/30 group-hover:ring-white/50 transition-all">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Admin Girişi</h3>
                  <p className="text-sm text-white/70"></p>
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
              className="group relative bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 rounded-2xl p-8 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 border border-white/10"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm ring-2 ring-white/30 group-hover:ring-white/50 transition-all">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Yayıncı Girişi</h3>
                  <p className="text-sm text-white/70"></p>
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
              className="group relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 rounded-2xl p-8 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 border border-white/10"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm ring-2 ring-white/30 group-hover:ring-white/50 transition-all">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">İçerik Üreticisi</h3>
                  <p className="text-sm text-white/70"></p>
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
              className="group relative bg-gradient-to-br from-pink-600 via-pink-700 to-rose-700 rounded-2xl p-8 shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 border border-white/10"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm ring-2 ring-white/30 group-hover:ring-white/50 transition-all">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Seslendirmen</h3>
                  <p className="text-sm text-white/70"></p>
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
              className="group relative bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700 rounded-2xl p-8 shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 border border-white/10 md:col-span-2"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm ring-2 ring-white/30 group-hover:ring-white/50 transition-all">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">Ekip Üyesi</h3>
                  <p className="text-sm text-white/70"></p>
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

