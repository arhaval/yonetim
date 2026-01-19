import Layout from '@/components/Layout'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, CreditCard, Mic, Download, CheckCircle, Clock, 
  Mail, Phone, Edit, Shield, Wallet, Receipt, Briefcase, FileText
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Tarih formatlama fonksiyonu
function formatDate(date: Date | string): string {
  try {
    const d = new Date(date)
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    return `${d.getDate()} ${months[d.getMonth()]}`
  } catch {
    return '-'
  }
}

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  let resolvedParams: { id: string }
  
  try {
    resolvedParams = await Promise.resolve(params)
  } catch {
    notFound()
  }
  
  const { id } = resolvedParams
  
  if (!id) {
    notFound()
  }
  
  let member: any = null
  let voiceActor: any = null
  let financialRecords: any[] = []
  let tasks: any[] = []
  let scripts: any[] = []
  
  try {
    // Önce TeamMember olarak ara
    member = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    }).catch(() => null)

    // Bulunamadıysa VoiceActor olarak ara
    if (!member) {
      voiceActor = await prisma.voiceActor.findUnique({
        where: { id },
        include: {
          scripts: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      }).catch(() => null)
    }

    if (!member && !voiceActor) {
      notFound()
    }

    // Finansal kayıtları al
    if (voiceActor) {
      financialRecords = await prisma.financialRecord.findMany({
        where: { voiceActorId: voiceActor.id },
        orderBy: { date: 'desc' },
        take: 20,
      }).catch(() => [])
      scripts = voiceActor.scripts || []
    } else if (member) {
      financialRecords = await prisma.financialRecord.findMany({
        where: { teamMemberId: member.id },
        orderBy: { date: 'desc' },
        take: 20,
      }).catch(() => [])
      tasks = member.tasks || []
    }
  } catch (error) {
    console.error('Error fetching team member:', error)
    notFound()
  }

  const isVoiceActor = !!voiceActor
  const person = isVoiceActor ? voiceActor : member
  const profilePhoto = isVoiceActor ? voiceActor?.profilePhoto : member?.avatar
  const personName = person?.name || 'İsimsiz'
  const personEmail = person?.email
  const personPhone = person?.phone
  const personIban = person?.iban

  // İstatistikler
  const stats = {
    totalItems: isVoiceActor ? scripts.length : tasks.length,
    completed: isVoiceActor 
      ? scripts.filter((s: any) => s.status === 'APPROVED' || s.status === 'PAID').length
      : tasks.filter((t: any) => t.status === 'completed').length,
    pending: isVoiceActor
      ? scripts.filter((s: any) => s.status === 'WAITING_VOICE' || s.status === 'VOICE_UPLOADED').length
      : tasks.filter((t: any) => t.status === 'pending').length,
    totalEarnings: financialRecords
      .filter((fr: any) => fr.type === 'expense')
      .reduce((sum: number, fr: any) => sum + (fr.amount || 0), 0),
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Geri Butonu */}
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ekibe Dön</span>
        </Link>

        {/* Profil Kartı */}
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <div className={`h-24 bg-gradient-to-r ${isVoiceActor ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-indigo-600'}`} />
          
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-12">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={personName}
                  className="w-24 h-24 rounded-xl object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${isVoiceActor ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-indigo-600'} flex items-center justify-center ring-4 ring-white shadow-lg`}>
                  {isVoiceActor ? (
                    <Mic className="w-10 h-10 text-white" />
                  ) : (
                    <span className="text-white font-bold text-3xl">
                      {personName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex-1 pb-1">
                <h1 className="text-2xl font-bold text-gray-900">{personName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${isVoiceActor ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {isVoiceActor ? <Mic className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {isVoiceActor ? 'Seslendirmen' : member?.role || 'Ekip Üyesi'}
                  </span>
                </div>
              </div>

              {!isVoiceActor && member && (
                <div className="flex gap-2">
                  <Link
                    href={`/team/${member.id}/edit`}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                  >
                    <Edit className="w-4 h-4" />
                    Düzenle
                  </Link>
                  <Link
                    href={`/team/${member.id}/task/new`}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    <Plus className="w-4 h-4" />
                    Görev
                  </Link>
                </div>
              )}
            </div>

            {/* İletişim Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              {personEmail && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{personEmail}</p>
                  </div>
                </div>
              )}
              
              {personPhone && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Telefon</p>
                    <p className="text-sm font-medium text-gray-900">{personPhone}</p>
                  </div>
                </div>
              )}
              
              {personIban && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">IBAN</p>
                    <p className="text-sm font-mono font-medium text-gray-900">{personIban}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${isVoiceActor ? 'bg-amber-100' : 'bg-blue-100'} flex items-center justify-center`}>
                {isVoiceActor ? <FileText className="w-5 h-5 text-amber-600" /> : <Briefcase className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                <p className="text-xs text-gray-500">{isVoiceActor ? 'Toplam Metin' : 'Toplam Görev'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-gray-500">Tamamlanan</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-gray-500">Bekleyen</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">
                  {stats.totalEarnings.toLocaleString('tr-TR')}₺
                </p>
                <p className="text-xs text-gray-500">Toplam Ödeme</p>
              </div>
            </div>
          </div>
        </div>

        {/* İçerik Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Görevler / Metinler */}
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {isVoiceActor ? <FileText className="w-4 h-4 text-amber-600" /> : <Briefcase className="w-4 h-4 text-blue-600" />}
                {isVoiceActor ? 'Seslendirme Metinleri' : 'Görevler'}
              </h3>
            </div>
            <div className="divide-y max-h-80 overflow-y-auto">
              {isVoiceActor ? (
                scripts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">Henüz metin yok</div>
                ) : (
                  scripts.map((script: any) => (
                    <div key={script.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{script.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              script.status === 'PAID' ? 'bg-green-100 text-green-700' :
                              script.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {script.status === 'PAID' ? 'Ödendi' : 
                               script.status === 'APPROVED' ? 'Onaylandı' : 'Bekliyor'}
                            </span>
                            {script.price > 0 && (
                              <span className="text-xs text-emerald-600 font-medium">
                                {script.price.toLocaleString('tr-TR')}₺
                              </span>
                            )}
                          </div>
                        </div>
                        {script.audioFile && (
                          <a
                            href={script.audioFile}
                            download
                            className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : (
                tasks.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">Henüz görev yok</div>
                ) : (
                  tasks.map((task: any) => (
                    <div key={task.id} className="p-3 hover:bg-gray-50">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-700' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {task.status === 'completed' ? 'Tamamlandı' : 
                           task.status === 'in_progress' ? 'Devam Ediyor' : 'Bekliyor'}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* Finansal Kayıtlar */}
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Ödeme Geçmişi
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {financialRecords.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">Henüz ödeme yok</div>
              ) : (
                <div className="divide-y">
                  {financialRecords.map((record: any) => (
                    <div key={record.id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.category || 'Ödeme'}</p>
                        <p className="text-xs text-gray-500">{formatDate(record.date)}</p>
                      </div>
                      <span className={`font-semibold ${record.type === 'income' ? 'text-green-600' : 'text-emerald-600'}`}>
                        {record.amount.toLocaleString('tr-TR')}₺
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
