import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Video, Users, DollarSign, CheckCircle2, Mic } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TeamPage() {
  let members: any[] = []
  let streamers: any[] = []
  let voiceActors: any[] = []
  
  try {
    [members, streamers, voiceActors] = await Promise.all([
      prisma.teamMember.findMany({
        include: {
          _count: {
            select: {
              tasks: true,
              payments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      prisma.streamer.findMany({
        include: {
          _count: {
            select: {
              streams: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      prisma.voiceActor.findMany({
        include: {
          _count: {
            select: {
              scripts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
    ])
  } catch (error) {
    console.error('Error fetching team data:', error)
    // Boş array'ler zaten set edildi, devam et
  }

  // Tüm üyeleri birleştir (ekip üyeleri + yayıncılar + seslendirmenler)
  const allMembers = [
    ...members.map((m) => ({ ...m, type: 'team' as const })),
    ...streamers.map((s) => ({ ...s, type: 'streamer' as const })),
    ...voiceActors.map((v) => ({ ...v, type: 'voice-actor' as const })),
  ].sort((a, b) => {
    // Tarihe göre sırala (en yeni önce)
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Ekip Üyeleri</h1>
            <p className="mt-2 text-sm text-gray-600">
              Ekip üyelerini görüntüleyin ve yönetin
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-3">
            <Link
              href="/team/new"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Üye
            </Link>
            <Link
              href="/voice-actors/new"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-pink-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pink-700"
            >
              <Mic className="w-4 h-4 mr-2" />
              Yeni Seslendirmen
            </Link>
          </div>
        </div>

        {allMembers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Henüz ekip üyesi yok</h3>
            <p className="mt-2 text-sm text-gray-500">
              İlk ekip üyesini eklemek için yukarıdaki butonu kullanın
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allMembers.map((member) => (
              <Link
                key={member.id}
                href={
                  member.type === 'team' 
                    ? `/team/${member.id}` 
                    : member.type === 'streamer'
                    ? `/streamers/${member.id}`
                    : `/team/${member.id}` // Seslendirmenler de ekip detay sayfasına gider
                }
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {(member.type === 'streamer' || member.type === 'voice-actor') && member.profilePhoto ? (
                          <img
                            src={member.profilePhoto}
                            alt={member.name}
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-md"
                          />
                        ) : (
                          <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-md ${
                            member.type === 'streamer' 
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                              : member.type === 'voice-actor'
                              ? 'bg-gradient-to-br from-pink-500 to-rose-600'
                              : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                          }`}>
                            {member.type === 'voice-actor' ? (
                              <Mic className="w-7 h-7 text-white" />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {member.name}
                        </h3>
                        {member.type === 'team' && member.role && (
                          <p className="text-sm text-gray-500 mt-0.5">{member.role}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {member.type === 'streamer' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200">
                          <Video className="w-3 h-3 mr-1.5" />
                          Yayıncı
                        </span>
                      ) : member.type === 'voice-actor' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border border-pink-200">
                          <Mic className="w-3 h-3 mr-1.5" />
                          Seslendirmen
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200">
                          <Users className="w-3 h-3 mr-1.5" />
                          Ekip
                        </span>
                      )}
                      {!member.isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Pasif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                    {member.type === 'team' ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Görevler</p>
                            <p className="text-lg font-bold text-gray-900">{member._count?.tasks || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ödemeler</p>
                            <p className="text-lg font-bold text-gray-900">{member._count?.payments || 0}</p>
                          </div>
                        </div>
                        {member.baseSalary !== undefined && member.baseSalary !== null && (
                          <div className="col-span-2 mt-2 pt-4 border-t border-gray-50">
                            <p className="text-xs text-gray-500 mb-1">Maaş</p>
                            <p className="text-xl font-bold text-gray-900">
                              {member.baseSalary.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                                minimumFractionDigits: 0,
                              })}
                            </p>
                          </div>
                        )}
                      </>
                    ) : member.type === 'voice-actor' ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-pink-50 rounded-lg">
                            <Mic className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Metinler</p>
                            <p className="text-lg font-bold text-gray-900">{member._count?.scripts || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ödemeler</p>
                            <p className="text-lg font-bold text-gray-900">-</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Video className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Yayınlar</p>
                            <p className="text-lg font-bold text-gray-900">{member._count?.streams || 0}</p>
                          </div>
                        </div>
                        {member.hourlyRate && member.hourlyRate > 0 ? (
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                              <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Saatlik</p>
                              <p className="text-lg font-bold text-gray-900">
                                {member.hourlyRate.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                  minimumFractionDigits: 0,
                                })}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <DollarSign className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Ücret</p>
                              <p className="text-lg font-bold text-gray-400">-</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}




