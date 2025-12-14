import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Video, Image, Eye, Heart, MessageCircle, Share2, Bookmark, Calendar, ExternalLink, User, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

export default async function ContentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  let content = null
  
  try {
    content = await prisma.content.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }).catch(() => null)

    if (!content) {
      notFound()
    }
  } catch (error) {
    console.error('Error fetching content:', error)
    notFound()
  }

  // İçerik tipini belirle
  let contentType = ''
  if (content.platform === 'YouTube') {
    contentType = content.type === 'shorts' ? 'Shorts' : 'Video'
  } else if (content.platform === 'Instagram') {
    contentType = content.type === 'reel' ? 'Reels' : 'Gönderi'
  } else {
    contentType = content.type === 'shorts' ? 'Shorts' : content.type === 'reel' ? 'Reels' : content.type === 'post' ? 'Gönderi' : 'Video'
  }

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
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                content.platform === 'YouTube' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {content.platform}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                contentType === 'Shorts' || contentType === 'Reels'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {contentType}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(content.publishDate), 'dd MMMM yyyy', { locale: tr })}
              </span>
              {content.creator && (
                <>
                  <span>•</span>
                  <Link
                    href={`/content-creators/${content.creator.id}`}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <User className="w-4 h-4 mr-1" />
                    {content.creator.name}
                  </Link>
                </>
              )}
              {content.url && (
                <>
                  <span>•</span>
                  <a
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    İçeriği Görüntüle
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Son Güncelleme Tarihi */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border-l-4" style={{ borderColor: '#08d9d6' }}>
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5" style={{ color: '#08d9d6' }} />
            <div>
              <p className="text-sm font-medium text-gray-600">Son Güncelleme</p>
              <p className="text-sm font-semibold text-gray-900">
                {format(new Date(content.updatedAt), 'dd MMMM yyyy, HH:mm', { locale: tr })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Görüntülenme</p>
                <p className="text-2xl font-bold text-indigo-600 mt-2">{formatNumber(content.views || 0)}</p>
              </div>
              <Eye className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Beğeni</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{formatNumber(content.likes || 0)}</p>
              </div>
              <Heart className="w-10 h-10 text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yorum</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatNumber(content.comments || 0)}</p>
              </div>
              <MessageCircle className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          {content.platform === 'Instagram' && (
            <>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Paylaşım</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{formatNumber(content.shares || 0)}</p>
                  </div>
                  <Share2 className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Kaydetme</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">{formatNumber(content.saves || 0)}</p>
                  </div>
                  <Bookmark className="w-10 h-10 text-purple-400" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notes */}
        {content.notes && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notlar</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{content.notes}</p>
          </div>
        )}
      </div>
    </Layout>
  )
}



