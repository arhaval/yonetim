import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, FileText, CheckCircle, Clock, Download, Mic } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import AudioLink from './AudioLink'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function VoiceoverScriptsPage() {
  let scripts: any[] = []
  
  try {
    scripts = await prisma.voiceoverScript.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        voiceActor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error: any) {
    console.error('Error fetching scripts:', error)
    // Prisma Client henüz generate edilmemiş olabilir
    if (error.message?.includes('voiceoverScript') || error.message?.includes('findMany')) {
      console.error('Prisma Client needs to be regenerated. Please run: npx prisma generate')
    }
  }

  const creatorApprovedScripts = scripts.filter(s => s.status === 'creator-approved')
  const otherScripts = scripts.filter(s => s.status !== 'creator-approved')

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Seslendirme Metinleri
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Tüm seslendirme metinlerini görüntüleyin ve yönetin
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/voiceover-scripts/new"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Metin Oluştur
            </Link>
          </div>
        </div>

        {/* Creator Onayı Bekleyenler */}
        {creatorApprovedScripts.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl shadow-xl overflow-hidden border-2 border-orange-300">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-100 to-yellow-100 border-b border-orange-200">
              <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                İçerik Üreticisi Onayı Bekleyen Sesler ({creatorApprovedScripts.length})
              </h2>
              <p className="mt-1 text-sm text-orange-700">Fiyat girip onaylayın</p>
            </div>
            <div className="divide-y divide-orange-200">
              {creatorApprovedScripts.map((script) => (
                <Link
                  key={script.id}
                  href={`/voiceover-scripts/${script.id}`}
                  className="block px-6 py-4 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-600">{script.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-900 animate-pulse">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Creator Onayladı - Admin Onayı Bekliyor
                        </span>
                        {script.audioFile && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Download className="w-3 h-3 mr-1" />
                            Ses Yüklendi
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{script.text}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{format(new Date(script.createdAt), 'dd MMMM yyyy', { locale: tr })}</span>
                        {script.creator && (
                          <>
                            <span>•</span>
                            <span>Oluşturan: {script.creator.name}</span>
                          </>
                        )}
                        {script.voiceActor && (
                          <>
                            <span>•</span>
                            <span className="flex items-center">
                              <Mic className="w-3 h-3 mr-1" />
                              {script.voiceActor.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {script.audioFile && (
                      <div className="ml-4">
                        <AudioLink audioFile={script.audioFile} />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Diğer Metinler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherScripts.length === 0 && creatorApprovedScripts.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Henüz metin eklenmemiş</p>
            </div>
          ) : (
            otherScripts.map((script) => {
              // HTML içeriğini temizle (sadece metin al)
              const textContent = script.text?.replace(/<[^>]*>/g, '').substring(0, 150) || ''
              
              return (
                <Link
                  key={script.id}
                  href={`/voiceover-scripts/${script.id}`}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#08d9d6] transition-colors line-clamp-2 mb-3">
                          {script.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {script.status === 'paid' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ödendi
                            </span>
                          ) : script.status === 'approved' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Onaylandı
                            </span>
                          ) : script.status === 'creator-approved' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Creator Onayladı
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Beklemede
                            </span>
                          )}
                          {script.audioFile && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <Download className="w-3 h-3 mr-1" />
                              Ses Yüklendi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {textContent && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{textContent}...</p>
                    )}

                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}</span>
                      </div>
                      {script.contentType && (
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border" style={{ 
                            backgroundColor: script.contentType === 'reels' ? 'rgba(255, 46, 99, 0.1)' : script.contentType === 'kısa' ? 'rgba(8, 217, 214, 0.1)' : 'rgba(37, 42, 52, 0.1)',
                            borderColor: script.contentType === 'reels' ? '#ff2e63' + '40' : script.contentType === 'kısa' ? '#08d9d6' + '40' : '#252a34' + '40',
                            color: '#252a34'
                          }}>
                            {script.contentType === 'reels' ? 'Reels' : script.contentType === 'kısa' ? 'Kısa Video' : 'Uzun Video'}
                          </span>
                        </div>
                      )}
                      {script.creator && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Oluşturan: <span className="font-medium text-gray-700">{script.creator.name}</span></span>
                        </div>
                      )}
                      {script.voiceActor && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Mic className="w-3 h-3" />
                          <span>Seslendirmen: <span className="font-medium text-gray-700">{script.voiceActor.name}</span></span>
                        </div>
                      )}
                      {script.price > 0 && (
                        <div className="pt-2">
                          <span className="text-sm font-bold" style={{ color: '#08d9d6' }}>
                            {script.price.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {script.audioFile && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <AudioLink audioFile={script.audioFile} />
                      </div>
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}

