import RoleAwareLayout from '@/components/RoleAwareLayout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle, Clock, ExternalLink, Mic, User, DollarSign, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import ApproveScriptButton from './ApproveScriptButton'
import CreatorApproveButton from './CreatorApproveButton'
import DeleteScriptButton from './DeleteScriptButton'
import { canViewVoiceover, canProducerApprove } from '@/lib/voiceover-permissions'

export default async function VoiceoverScriptDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const { id } = await Promise.resolve(params)
  
  // Cookie'lerden kullanıcı bilgilerini al
  const cookieStore = await cookies()
  const userId = cookieStore.get('user-id')?.value
  const creatorId = cookieStore.get('creator-id')?.value
  const voiceActorId = cookieStore.get('voice-actor-id')?.value

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

  // Yetki kontrolü - server-side guard
  const canView = await canViewVoiceover(userId, creatorId, voiceActorId, script)
  if (!canView) {
    notFound() // Güvenlik için 404 döndür
  }

  return (
    <RoleAwareLayout backUrl="/voiceover-scripts" backLabel="Seslendirme Metinlerine dön">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
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
              {script.price && script.price > 0 && (
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

        {/* Actions */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Link
            href={`/voiceover-scripts/${script.id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Düzenle
          </Link>
          
          {/* Creator Approve Button - Sadece creator için ve WAITING_VOICE status'ünde */}
          {(() => {
            const canApprove = creatorId && script.creatorId === creatorId && script.status === 'WAITING_VOICE' && !script.producerApproved
            return canApprove ? (
              <CreatorApproveButton 
                scriptId={script.id} 
              />
            ) : null
          })()}
          
          {/* Admin Approve Button - Sadece admin için görünür */}
          {(() => {
            const userRoleCookie = cookieStore.get('user-role')?.value
            const isAdmin = userId && userRoleCookie?.toLowerCase() === 'admin'
            // Admin için VOICE_UPLOADED (creator onayladı) veya APPROVED (fiyat girip ödendi olarak işaretle) status'lerinde göster
            const shouldShow = isAdmin && (script.status === 'VOICE_UPLOADED' || script.status === 'APPROVED')
            return shouldShow ? (
              <ApproveScriptButton scriptId={script.id} currentStatus={script.status} currentPrice={script.price || 0} />
            ) : null
          })()}
          
          {/* Delete Button - Sadece admin için */}
          {(() => {
            const userRoleCookie = cookieStore.get('user-role')?.value
            const isAdmin = userId && userRoleCookie?.toLowerCase() === 'admin'
            return isAdmin ? <DeleteScriptButton scriptId={script.id} /> : null
          })()}
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
        {(script.voiceLink || script.audioFile) && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ses Linki</h2>
            <div className="flex items-center space-x-4">
              <a
                href={script.voiceLink || script.audioFile || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                onClick={(e) => {
                  if (!script.voiceLink && !script.audioFile) {
                    e.preventDefault()
                  }
                }}
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
    </RoleAwareLayout>
  )
}

