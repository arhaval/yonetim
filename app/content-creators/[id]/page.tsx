import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Video, FileText, Mail, Phone, Globe, Calendar, Eye, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import CreateScriptButton from './CreateScriptButton'

export default async function ContentCreatorDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const creator = await prisma.contentCreator.findUnique({
    where: { id: params.id },
    include: {
      contents: {
        orderBy: { publishDate: 'asc' },
      },
      scripts: {
        orderBy: { createdAt: 'asc' },
        include: {
          voiceActor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          contents: true,
          scripts: true,
        },
      },
    },
  })

  if (!creator) {
    notFound()
  }

  // İstatistikleri hesapla
  const totalViews = creator.contents.reduce((sum, c) => sum + (c.views || 0), 0)
  const totalLikes = creator.contents.reduce((sum, c) => sum + (c.likes || 0), 0)
  const totalComments = creator.contents.reduce((sum, c) => sum + (c.comments || 0), 0)
  const totalShares = creator.contents.reduce((sum, c) => sum + (c.shares || 0), 0)
  const totalSaves = creator.contents.reduce((sum, c) => sum + (c.saves || 0), 0)

  // Sayıları formatla
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link
            href="/content"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            İçeriklere dön
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              {creator.profilePhoto ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-lg border-4 border-white">
                  <img
                    src={creator.profilePhoto}
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-white/20 flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-3xl font-bold text-white">
                    {creator.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{creator.name}</h1>
                <div className="flex items-center space-x-4 text-white/90 text-sm">
                  {creator.platform && (
                    <span className="flex items-center">
                      <Video className="w-4 h-4 mr-1" />
                      {creator.platform}
                    </span>
                  )}
                  {creator.email && (
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {creator.email}
                    </span>
                  )}
                  {creator.phone && (
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {creator.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-white">
                <div className="text-sm opacity-90">Durum</div>
                <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  creator.isActive
                    ? 'bg-green-500/20 text-white border border-green-300/30'
                    : 'bg-red-500/20 text-white border border-red-300/30'
                }`}>
                  {creator.isActive ? 'Aktif' : 'Pasif'}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Toplam İçerik</div>
                <div className="text-xl font-bold text-gray-900">{creator._count.contents}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Toplam Metin</div>
                <div className="text-xl font-bold text-gray-900">{creator._count.scripts}</div>
              </div>
              {creator.channelUrl && (
                <div>
                  <div className="text-sm text-gray-600">Kanal</div>
                  <a
                    href={creator.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 inline-flex items-center text-sm font-medium"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Kanalı Aç
                  </a>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600">Kayıt Tarihi</div>
                <div className="text-sm font-medium text-gray-900">
                  {format(new Date(creator.createdAt), 'dd MMMM yyyy', { locale: tr })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {creator.contents.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Görüntülenme</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">{formatNumber(totalViews)}</p>
                </div>
                <Eye className="w-10 h-10 text-indigo-400" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Beğeni</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{formatNumber(totalLikes)}</p>
                </div>
                <Heart className="w-10 h-10 text-red-400" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Yorum</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{formatNumber(totalComments)}</p>
                </div>
                <MessageCircle className="w-10 h-10 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Paylaşım</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{formatNumber(totalShares)}</p>
                </div>
                <Share2 className="w-10 h-10 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Kaydetme</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{formatNumber(totalSaves)}</p>
                </div>
                <Bookmark className="w-10 h-10 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {creator.notes && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notlar</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{creator.notes}</p>
          </div>
        )}

        {/* Contents */}
        {creator.contents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">İçerikler ({creator.contents.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {creator.contents.map((content) => (
                <div
                  key={content.id}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/content/${content.id}`}
                      className="flex-1"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{content.title}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          content.platform === 'YouTube' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {content.platform}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          content.type === 'shorts' || content.type === 'reel'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {content.type === 'reel' ? 'Reels' : content.type === 'shorts' ? 'Shorts' : content.type === 'post' ? 'Gönderi' : 'Video'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(content.publishDate), 'dd MMM yyyy', { locale: tr })}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {formatNumber(content.views || 0)}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {formatNumber(content.likes || 0)}
                        </span>
                      </div>
                    </Link>
                    <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                      <CreateScriptButton
                        contentId={content.id}
                        contentTitle={content.title}
                        creatorId={creator.id}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scripts */}
        {creator.scripts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Seslendirme Metinleri ({creator.scripts.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {creator.scripts.map((script) => (
                <Link
                  key={script.id}
                  href={`/voiceover-scripts/${script.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{script.title}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          script.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : script.status === 'paid'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {script.status === 'approved' ? 'Onaylandı' : script.status === 'paid' ? 'Ödendi' : 'Beklemede'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </span>
                        {script.voiceActor && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {script.voiceActor.name}
                          </span>
                        )}
                        {script.price && (
                          <span className="flex items-center">
                            <span className="font-medium text-gray-700">
                              {script.price.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {creator.contents.length === 0 && creator.scripts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Henüz içerik veya metin eklenmemiş</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

