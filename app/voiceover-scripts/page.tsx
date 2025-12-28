'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import VoiceoverInbox from '@/components/VoiceoverInbox'

export default function VoiceoverScriptsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Seslendirme Metinleri
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Tüm seslendirme metinlerini görüntüleyin ve yönetin
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/voiceover-scripts/new"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Metin Oluştur
            </Link>
          </div>
        </div>

        <VoiceoverInbox
          initialFilters={{}}
          showBulkActions={true}
          title="Seslendirme Metinleri"
        />
      </div>
    </Layout>
  )
}
