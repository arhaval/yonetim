import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, CreditCard, Mic, Download, CheckCircle, Clock, DollarSign, 
  FileText, Mail, Phone, Calendar, TrendingUp, Briefcase, Edit, ExternalLink,
  User, Shield, BarChart3, Wallet, Receipt, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import TeamPaymentCards from './TeamPaymentCards'
import LoginCredentialsForm from '@/components/LoginCredentialsForm'
import DeleteFinancialRecordButton from './DeleteFinancialRecordButton'

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const { id } = await Promise.resolve(params)
  
  let member = null
  let voiceActor = null
  
  try {
    member = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        payments: {
          orderBy: { paidAt: 'desc' },
          take: 10,
        },
      },
    }).catch(() => null)

    if (!member) {
      voiceActor = await prisma.voiceActor.findUnique({
        where: { id },
        include: {
          scripts: {
            include: {
              creator: {
                select: { id: true, name: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
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
  const person = isVoiceActor ? voiceActor : member

  // İstatistikler
  let stats = {
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalScripts: 0,
    approvedScripts: 0,
    pendingScripts: 0,
    totalEarnings: 0,
    totalUnpaid: 0,
  }

  let financialRecords: any[] = []
  let tasks: any[] = []
  let payments: any[] = []
  let payouts: any[] = []
  let scripts: any[] = []

  if (isVoiceActor && voiceActor) {
    scripts = voiceActor.scripts || []
    stats.totalScripts = scripts.length
    stats.approvedScripts = scripts.filter(s => s.status === 'APPROVED').length
    stats.pendingScripts = scripts.filter(s => s.status === 'WAITING_VOICE' || s.status === 'VOICE_UPLOADED').length
    stats.totalEarnings = scripts
      .filter(s => s.status === 'PAID')
      .reduce((sum, s) => sum + (s.price || 0), 0)
    
    const unpaidScripts = scripts.filter(s => 
      s.status === 'APPROVED' || s.status === 'VOICE_UPLOADED'
    )
    stats.totalUnpaid = unpaidScripts.reduce((sum, s) => sum + (s.price || 0), 0)
    
    financialRecords = await prisma.financialRecord.findMany({
      where: { voiceActorId: voiceActor.id },
      orderBy: { date: 'desc' },
      take: 20,
    }).catch(() => [])
  } else if (member) {
    tasks = member.tasks || []
    payments = member.payments || []
    stats.totalTasks = tasks.length
    stats.pendingTasks = tasks.filter((t) => t.status === 'pending').length
    stats.completedTasks = tasks.filter((t) => t.status === 'completed').length

    const unpaidPayments = await prisma.teamPayment.aggregate({
      where: { teamMemberId: member.id, paidAt: null },
      _sum: { amount: true },
    }).catch(() => ({ _sum: { amount: null } }))

    financialRecords = await prisma.financialRecord.findMany({
      where: { teamMemberId: member.id },
      orderBy: { date: 'desc' },
      take: 20,
    }).catch(() => [])

    payouts = await prisma.payout.findMany({
      where: {
        recipientType: 'teamMember',
        recipientId: member.id,
        status: 'paid',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }).catch(() => [])

    stats.totalUnpaid = unpaidPayments._sum.amount || 0
    stats.totalEarnings = payments.filter(p => p.paidAt).reduce((sum, p) => sum + (p.amount || 0), 0) +
      financialRecords.filter(fr => fr.type === 'expense').reduce((sum, fr) => sum + (fr.amount || 0), 0) +
      payouts.reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />Ödendi</span>
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700"><CheckCircle className="w-3 h-3" />Onaylandı</span>
      case 'VOICE_UPLOADED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700"><Clock className="w-3 h-3" />Ses Yüklendi</span>
      case 'WAITING_VOICE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Ses Bekleniyor</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Geri Butonu */}
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Ekibe Dön</span>
        </Link>

        {/* Profil Kartı */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Gradient Header */}
          <div className={`h-32 bg-gradient-to-r ${isVoiceActor ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-indigo-600'}`} />
          
          <div className="px-8 pb-8">
            {/* Avatar & İsim */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              {person?.profilePhoto ? (
                <img
                  src={person.profilePhoto}
                  alt={person.name}
                  className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white shadow-xl"
                />
              ) : (
                <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${isVoiceActor ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-indigo-600'} flex items-center justify-center ring-4 ring-white shadow-xl`}>
                  {isVoiceActor ? (
                    <Mic className="w-12 h-12 text-white" />
                  ) : (
                    <span className="text-white font-bold text-4xl">
                      {person?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex-1 pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{person?.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${isVoiceActor ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isVoiceActor ? <Mic className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        {isVoiceActor ? 'Seslendirmen' : member?.role || 'Ekip Üyesi'}
                      </span>
                      {person?.isActive !== false && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Aktif
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!isVoiceActor && member && (
                    <div className="flex gap-2">
                      <Link
                        href={`/team/${member.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Düzenle
                      </Link>
                      <Link
                        href={`/team/${member.id}/task/new`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Görev Ekle
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {person?.email && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm font-semibold text-gray-900">{person.email}</p>
                  </div>
                </div>
              )}
              
              {person?.phone && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Telefon</p>
                    <p className="text-sm font-semibold text-gray-900">{person.phone}</p>
                  </div>
                </div>
              )}
              
              {person?.iban && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">IBAN</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">{person.iban}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Giriş Bilgileri */}
        {isVoiceActor && voiceActor ? (
          <LoginCredentialsForm type="voice-actor" id={voiceActor.id} currentEmail={voiceActor.email} />
        ) : member ? (
          <LoginCredentialsForm type="team" id={member.id} currentEmail={member.email} />
        ) : null}

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isVoiceActor ? (
            <>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalScripts}</p>
                    <p className="text-sm text-gray-500">Toplam Metin</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{stats.approvedScripts}</p>
                    <p className="text-sm text-gray-500">Onaylanan</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-600">{stats.pendingScripts}</p>
                    <p className="text-sm text-gray-500">Beklemede</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.totalEarnings.toLocaleString('tr-TR')}₺
                    </p>
                    <p className="text-sm text-gray-500">Toplam Kazanç</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
                    <p className="text-sm text-gray-500">Toplam Görev</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-600">{stats.pendingTasks}</p>
                    <p className="text-sm text-gray-500">Bekleyen</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
                    <p className="text-sm text-gray-500">Tamamlanan</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.totalEarnings.toLocaleString('tr-TR')}₺
                    </p>
                    <p className="text-sm text-gray-500">Toplam Ödeme</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Ödeme Kartları */}
        {isVoiceActor && voiceActor ? (
          <TeamPaymentCards
            totalPaid={stats.totalEarnings}
            totalUnpaid={stats.totalUnpaid}
            scripts={scripts.map(s => ({
              id: s.id,
              title: s.title,
              price: s.price || 0,
              status: s.status || 'pending',
              createdAt: s.createdAt,
              audioFile: s.audioFile,
            }))}
            financialRecords={financialRecords}
          />
        ) : member ? (
          <TeamPaymentCards
            totalPaid={stats.totalEarnings}
            totalUnpaid={stats.totalUnpaid}
            payments={payments.map(p => ({
              id: p.id,
              amount: p.amount || 0,
              paidAt: p.paidAt,
              description: p.description,
              type: p.type,
              period: p.period,
            }))}
            payouts={payouts.map(p => ({
              id: p.id,
              amount: p.amount,
              paidAt: p.paidAt || p.createdAt,
              description: p.note || 'Manuel ödeme',
              type: 'payout',
              period: null,
            }))}
            financialRecords={financialRecords}
          />
        ) : null}

        {/* İçerik Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seslendirme Metinleri veya Görevler */}
          {isVoiceActor && voiceActor ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Seslendirme Metinleri</h3>
                    <p className="text-sm text-gray-500">{scripts.length} metin</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {scripts.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Henüz metin atanmamış</p>
                  </div>
                ) : (
                  scripts.map((script) => (
                    <div key={script.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/voiceover-scripts/${script.id}`}
                            className="font-semibold text-gray-900 hover:text-amber-600 transition-colors line-clamp-1"
                          >
                            {script.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{script.text}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {getStatusBadge(script.status)}
                            {script.price > 0 && (
                              <span className="text-sm font-semibold text-emerald-600">
                                {script.price.toLocaleString('tr-TR')}₺
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {format(new Date(script.createdAt), 'dd MMM yyyy', { locale: tr })}
                            </span>
                          </div>
                        </div>
                        {script.audioFile && (
                          <a
                            href={script.audioFile}
                            download
                            className="flex-shrink-0 p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : member ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Görevler</h3>
                    <p className="text-sm text-gray-500">{tasks.length} görev</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Henüz görev eklenmemiş</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {task.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {task.status === 'completed' ? 'Tamamlandı' : task.status === 'in_progress' ? 'Devam Ediyor' : 'Bekliyor'}
                            </span>
                            {task.priority && (
                              <span className="text-xs text-gray-400">Öncelik: {task.priority}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {/* Finansal Kayıtlar */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Finansal Kayıtlar</h3>
                  <p className="text-sm text-gray-500">{financialRecords.length} kayıt</p>
                </div>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {financialRecords.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Receipt className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Henüz finansal kayıt yok</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tarih</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Tutar</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {financialRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {format(new Date(record.date), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                            {record.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {record.type === 'income' ? '+' : '-'}
                            {record.amount.toLocaleString('tr-TR')}₺
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DeleteFinancialRecordButton recordId={record.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
