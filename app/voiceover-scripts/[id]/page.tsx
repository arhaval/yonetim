import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle, Clock, Download, Mic, User, DollarSign, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import ApproveScriptButton from './ApproveScriptButton'
import DeleteScriptButton from './DeleteScriptButton'

export default async function VoiceoverScriptDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const { id } = await Promise.resolve(params)
  let script: any = null

  try {
    script = await prisma.voiceoverScript.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        voiceActor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching script:', error)
  }

  if (!script) {
    notFound()
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link
            href="/voiceover-scripts"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Seslendirme Metinlerine dön
          </Link>
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">{script.title}</h1>
              {script.status === 'PAID' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ödendi
                </span>
              ) : script.status === 'APPROVED' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Onaylandı
                </span>
              ) : script.status === 'VOICE_UPLOADED' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 animate-pulse">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Creator Onayladı - Admin Onayı Bekliyor
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="w-4 h-4 mr-1" />
                  Beklemede
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(script.createdAt), 'dd MMMM yyyy', { locale: tr })}
              </span>
              {script.creator && (
                <>
                  <span>•</span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Oluşturan: {script.creator.name}
                  </span>
                </>
              )}
              {script.voiceActor && (
                <>
                  <span>•</span>
                  <Link
                    href={`/voice-actors/${script.voiceActor.id}`}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <Mic className="w-4 h-4 mr-1" />
                    Seslendirmen: {script.voiceActor.name}
                  </Link>
                </>
              )}
              {script.price > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center font-semibold text-green-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {script.price.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/voiceover-scripts/${script.id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Düzenle
          </Link>
          <ApproveScriptButton scriptId={script.id} currentStatus={script.status} currentPrice={script.price} />
          <DeleteScriptButton scriptId={script.id} />
        </div>

        {/* Script Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Seslendirme Metni
          </h2>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div 
              className="text-base text-gray-900 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: script.text }}
            />
          </div>
        </div>

        {/* Ses Linki */}
        {script.audioFile && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ses Linki</h2>
            <div className="flex items-center space-x-4">
              <a
                href={script.audioFile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Linki Aç
              </a>
            </div>
          </div>
        )}

        {/* Notes */}
        {script.notes && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notlar</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{script.notes}</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

