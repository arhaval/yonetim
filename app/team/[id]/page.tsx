import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, CreditCard, AlertCircle, Mic, Download, CheckCircle, Clock, DollarSign, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import TeamPaymentCards from './TeamPaymentCards'

export default async function TeamMemberDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Önce ekip üyesi olarak kontrol et
  let member = null
  let voiceActor = null
  
  try {
    member = await prisma.teamMember.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
        payments: {
          orderBy: { paidAt: 'asc' },
        },
      },
    }).catch(() => null)

    // Eğer ekip üyesi değilse, seslendirmen olarak kontrol et
    if (!member) {
      voiceActor = await prisma.voiceActor.findUnique({
        where: { id: params.id },
        include: {
          scripts: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      }).catch(() => null)
    }

    if (!member && !voiceActor) {
      notFound()
    }
  } catch (error) {
    console.error('Error fetching team member:', error)
    notFound()
  }

  const isVoiceActor = !!voiceActor

  // Seslendirmen için ödeme ve metin bilgileri
  let totalUnpaid = 0
  let pendingTasks = 0
  let completedTasks = 0
  let totalScripts = 0
  let approvedScripts = 0
  let pendingScripts = 0
  let totalEarnings = 0

  if (isVoiceActor && voiceActor) {
    totalScripts = voiceActor.scripts.length
    approvedScripts = voiceActor.scripts.filter(s => s.status === 'approved').length
    pendingScripts = voiceActor.scripts.filter(s => s.status === 'pending').length
    totalEarnings = voiceActor.scripts
      .filter(s => s.status === 'paid')
      .reduce((sum, s) => sum + s.price, 0)
    
    // Ödenmemiş metinler için toplam ücret (onaylanmış veya ses dosyası yüklenmiş pending olanlar)
    const unpaidScripts = voiceActor.scripts.filter(s => 
      s.status === 'approved' || (s.status === 'pending' && s.audioFile)
    )
    totalUnpaid = unpaidScripts.reduce((sum, s) => sum + (s.price || 0), 0)
  } else if (member) {
    pendingTasks = member.tasks.filter((t) => t.status === 'pending').length
    completedTasks = member.tasks.filter(
      (t) => t.status === 'completed'
    ).length

    // Ödenmemiş paraları hesapla
    const unpaidPayments = await prisma.teamPayment.aggregate({
      where: {
        teamMemberId: member.id,
        paidAt: null,
      },
      _sum: { amount: true },
    }).catch(() => ({ _sum: { amount: null } }))

    totalUnpaid = unpaidPayments._sum.amount || 0
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link
            href="/team"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← {isVoiceActor ? 'Ekip üyelerine' : 'Ekip üyelerine'} dön
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isVoiceActor && voiceActor ? (
                <>
                  {voiceActor.profilePhoto ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg ring-2 ring-pink-200">
                      <img
                        src={voiceActor.profilePhoto}
                        alt={voiceActor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg ring-2 ring-pink-200">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{voiceActor.name}</h1>
                    {voiceActor.email && (
                      <p className="mt-1 text-sm text-gray-600">{voiceActor.email}</p>
                    )}
                    {voiceActor.phone && (
                      <p className="text-sm text-gray-600">{voiceActor.phone}</p>
                    )}
                  </div>
                </>
              ) : member ? (
                <>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
                    <p className="mt-2 text-sm text-gray-600">{member.role}</p>
                    {member.iban && (
                      <div className="mt-3 inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-600 font-medium">IBAN</p>
                          <p className="text-sm text-gray-900 font-mono font-semibold">
                            {member.iban}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
            <div className="flex space-x-3">
              {isVoiceActor && voiceActor ? (
                // Seslendirmenler için şimdilik edit butonu yok
                null
              ) : member ? (
                <>
                  <Link
                    href={`/team/${member.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Düzenle
                  </Link>
                  <Link
                    href={`/team/${member.id}/task/new`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Görev Ekle
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {isVoiceActor && voiceActor ? (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Metin
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {totalScripts}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Onaylanan
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">
                      {approvedScripts}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Beklemede
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                      {pendingScripts}
                    </dd>
                  </dl>
                </div>
              </div>
              <TeamPaymentCards
                totalPaid={totalEarnings}
                totalUnpaid={totalUnpaid}
                scripts={voiceActor.scripts.map(s => ({
                  id: s.id,
                  title: s.title,
                  price: s.price,
                  status: s.status,
                  createdAt: s.createdAt,
                  audioFile: s.audioFile,
                }))}
              />
            </>
          ) : member ? (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Görev
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {member.tasks.length}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Bekleyen
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                      {pendingTasks}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tamamlanan
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">
                      {completedTasks}
                    </dd>
                  </dl>
                </div>
              </div>
              <TeamPaymentCards
                totalPaid={member.payments.filter(p => p.paidAt).reduce((sum, p) => sum + p.amount, 0)}
                totalUnpaid={totalUnpaid}
                payments={member.payments.map(p => ({
                  id: p.id,
                  amount: p.amount,
                  paidAt: p.paidAt,
                  description: p.description,
                  type: p.type,
                  period: p.period,
                }))}
              />
            </>
          ) : null}
        </div>

        {isVoiceActor && voiceActor ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Seslendirme Metinleri */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-pink-600" />
                  Seslendirme Metinleri
                </h3>
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {voiceActor.scripts.map((script) => (
                      <li key={script.id} className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Link
                                href={`/voiceover-scripts/${script.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-pink-600"
                              >
                                {script.title}
                              </Link>
                              {script.status === 'paid' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Ödendi
                                </span>
                              ) : script.status === 'approved' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Onaylandı
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Beklemede
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{script.text}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}</span>
                              {script.price > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold text-green-600">
                                    {script.price.toLocaleString('tr-TR', {
                                      style: 'currency',
                                      currency: 'TRY',
                                    })}
                                  </span>
                                </>
                              )}
                              {script.creator && (
                                <>
                                  <span>•</span>
                                  <span>İçerik Üreticisi: {script.creator.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {script.audioFile && (
                            <div className="ml-4">
                              <a
                                href={script.audioFile}
                                download
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-medium rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                İndir
                              </a>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {voiceActor.scripts.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Henüz metin atanmamış
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ödeme Özeti */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Ödeme Özeti
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <p className="text-sm font-medium text-gray-600 mb-1">Toplam Kazanç</p>
                    <p className="text-2xl font-bold text-green-600">
                      {totalEarnings.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ödenen metinler</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
                    <p className="text-sm font-medium text-gray-600 mb-1">Ödenmemiş</p>
                    <p className="text-2xl font-bold text-red-600">
                      {totalUnpaid.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Bekleyen ödeme</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Metin Durumları:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Onaylanan:</span>
                        <span className="font-semibold text-green-600">{approvedScripts}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Beklemede:</span>
                        <span className="font-semibold text-yellow-600">{pendingScripts}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Toplam:</span>
                        <span className="font-semibold text-gray-900">{totalScripts}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : member ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Görevler
                </h3>
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {member.tasks.map((task) => (
                      <li key={task.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {task.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  task.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : task.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {task.status === 'completed'
                                  ? 'Tamamlandı'
                                  : task.status === 'in_progress'
                                  ? 'Devam Ediyor'
                                  : 'Bekliyor'}
                              </span>
                              {task.priority && (
                                <span className="text-xs text-gray-500">
                                  Öncelik: {task.priority}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {member.tasks.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Henüz görev eklenmemiş
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Ödemeler
                </h3>
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {member.payments.map((payment) => (
                      <li key={payment.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payment.type} - {payment.period}
                            </p>
                            {payment.description && (
                              <p className="text-sm text-gray-500">
                                {payment.description}
                              </p>
                            )}
                            {payment.paidAt && (
                              <p className="text-sm text-gray-500">
                                {format(new Date(payment.paidAt), 'dd MMM yyyy', {
                                  locale: tr,
                                })}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {payment.amount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </p>
                            {!payment.paidAt && (
                              <p className="text-xs text-red-600">Ödenmedi</p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {member.payments.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Henüz ödeme kaydı yok
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}

