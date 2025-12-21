import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, CreditCard, AlertCircle, Mic, Download, CheckCircle, Clock, DollarSign, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import TeamPaymentCards from './TeamPaymentCards'
import LoginCredentialsForm from '@/components/LoginCredentialsForm'

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const { id } = await Promise.resolve(params)
  // Önce ekip üyesi olarak kontrol et
  let member = null
  let voiceActor = null
  
  try {
    member = await prisma.teamMember.findUnique({
      where: { id },
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
        where: { id },
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
  let financialRecords: any[] = []

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
    
    // Voice Actor için finansal kayıtları çek
    financialRecords = await prisma.financialRecord.findMany({
      where: {
        voiceActorId: voiceActor.id,
      },
      orderBy: { date: 'desc' },
    }).catch(() => [])
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

    // Finansal kayıtları getir (bu ekip üyesine ait olanlar)
    financialRecords = await prisma.financialRecord.findMany({
      where: {
        teamMemberId: member.id,
      },
      orderBy: { date: 'desc' },
    }).catch(() => [])

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
                      <div className="mt-2 flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span className="text-xs text-green-600 font-medium">📧 Email:</span>
                        <p className="text-sm text-gray-900 font-semibold">
                          {voiceActor.email}
                        </p>
                        <span className="text-xs text-green-600">(Giriş için)</span>
                      </div>
                    )}
                    {!voiceActor.email && (
                      <div className="mt-2 flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                        <span className="text-xs text-yellow-600 font-medium">⚠️ Giriş bilgileri eklenmemiş</span>
                      </div>
                    )}
                    {voiceActor.phone && (
                      <p className="mt-2 text-sm text-gray-600">{voiceActor.phone}</p>
                    )}
                    {voiceActor.iban && (
                      <div className="mt-3 inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-600 font-medium">IBAN</p>
                          <p className="text-sm text-gray-900 font-mono font-semibold">
                            {voiceActor.iban}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : member ? (
                <>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg ring-2 ring-blue-200">
                    <span className="text-white font-bold text-2xl">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
                    <p className="mt-2 text-sm text-gray-600">{member.role}</p>
                    {member.email && (
                      <div className="mt-2 flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span className="text-xs text-green-600 font-medium">📧 Email:</span>
                        <p className="text-sm text-gray-900 font-semibold">
                          {member.email}
                        </p>
                        <span className="text-xs text-green-600">(Giriş için)</span>
                      </div>
                    )}
                    {!member.email && (
                      <div className="mt-2 flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                        <span className="text-xs text-yellow-600 font-medium">⚠️ Giriş bilgileri eklenmemiş</span>
                      </div>
                    )}
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

        {/* Giriş Bilgileri */}
        {isVoiceActor && voiceActor ? (
          <LoginCredentialsForm
            type="voice-actor"
            id={voiceActor.id}
            currentEmail={voiceActor.email}
          />
        ) : member ? (
          <LoginCredentialsForm
            type="team"
            id={member.id}
            currentEmail={member.email}
          />
        ) : null}

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
                financialRecords={financialRecords}
              />
            </>
          ) : null}
        </div>

        {isVoiceActor && voiceActor ? (
          <>
            {/* Voice Actor için ödeme kartları */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
              <TeamPaymentCards
                totalPaid={totalEarnings}
                totalUnpaid={totalUnpaid}
                payments={[]}
                scripts={voiceActor.scripts.map(s => ({
                  id: s.id,
                  title: s.title,
                  price: s.price || 0,
                  status: s.status,
                  createdAt: s.createdAt,
                  audioFile: s.audioFile,
                }))}
                financialRecords={financialRecords}
              />
            </div>

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

            {/* Finansal Kayıtlar */}
            {((member || voiceActor) && financialRecords.length > 0) && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Finansal Kayıtlar ({financialRecords.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tarih
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Açıklama
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tutar
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durum
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {financialRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {format(new Date(record.date), 'dd MMM yyyy', { locale: tr })}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {record.category}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {record.description || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold">
                              <span className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                {record.type === 'income' ? '+' : '-'}
                                {record.amount.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                  maximumFractionDigits: 0,
                                })}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                ✅ Ödenmiş
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Layout>
  )
}

