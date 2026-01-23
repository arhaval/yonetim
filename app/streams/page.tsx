'use client'

import Layout from '@/components/Layout'
import Link from 'next/link'
import { Plus, Calendar, Clock, DollarSign, User, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import DeleteButton from '@/components/DeleteButton'
import StreamCostModal from '@/components/StreamCostModal'

export default function StreamsPage() {
  const router = useRouter()
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStream, setSelectedStream] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Cache ile API çağrısı - performans için
      const res = await fetch('/api/streams', { 
        cache: 'default'
      })
      const data = await res.json()
      setStreams(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching streams:', error)
      setStreams([])
    } finally {
      setLoading(false)
    }
  }


  const handleCostClick = (stream: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedStream(stream)
    setIsModalOpen(true)
  }

  const handleUpdate = () => {
    fetchData()
    setIsModalOpen(false)
    setSelectedStream(null)
  }

  const handleMarkPaid = async (stream: any) => {
    if (!confirm(`${stream.streamer?.name} için ${stream.streamerEarning?.toLocaleString('tr-TR')} ₺ ödeme yapıldı olarak işaretlensin mi?`)) return

    try {
      const res = await fetch(`/api/streams/${stream.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid' }),
      })

      if (res.ok) {
        alert('Ödeme durumu güncellendi!')
        fetchData()
      } else {
        const data = await res.json()
        alert(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <p>Yükleniyor...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Yayınlar
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gerçekleşen yayınların listesi ve detayları
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/streams/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yeni Yayın Ekle
            </Link>
          </div>
        </div>

        {streams.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Henüz kayıtlı yayın yok
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              İlk yayını ekleyerek takibe başlayın
            </p>
            <Link
              href="/streams/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yayın Ekle
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-large border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-semibold text-sm text-muted-foreground">
                      Tarih
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-sm text-muted-foreground">
                      Yayıncı
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-sm text-muted-foreground">
                      Maç Bilgisi
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-sm text-muted-foreground">
                      Firma
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-sm text-muted-foreground">
                      Süre
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-sm text-muted-foreground">
                      Maliyet
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-sm text-muted-foreground">
                      Gelir
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-sm text-muted-foreground">
                      Ödeme Durumu
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-sm text-muted-foreground">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {streams.map((stream) => (
                    <tr key={stream.id} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="text-sm font-medium text-foreground">
                          {format(new Date(stream.date), 'dd MMM yyyy', { locale: tr })}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          {stream.streamer?.profilePhoto ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                              src={stream.streamer.profilePhoto}
                              alt={stream.streamer.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-2 ring-border">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <div className="text-sm font-medium text-foreground">
                            {stream.streamer?.name || 'Bilinmeyen Yayıncı'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm text-muted-foreground max-w-xs truncate" title={stream.matchInfo || ''}>
                          {stream.matchInfo || '-'}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {stream.teamName ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            {stream.teamName}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {stream.duration} saat
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {stream.streamerEarning > 0 ? (
                          <span className="text-sm font-bold text-destructive">
                            {stream.streamerEarning.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Girilmemiş</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        {stream.totalRevenue > 0 ? (
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {stream.totalRevenue.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        {stream.streamerEarning > 0 ? (
                          stream.paymentStatus === 'paid' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              ✅ Ödendi
                            </span>
                          ) : (
                            <button
                              onClick={() => handleMarkPaid(stream)}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 transition-colors cursor-pointer"
                            >
                              ⏳ Ödenmedi (Tıkla)
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleCostClick(stream, e)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:bg-muted/80 transition-colors border border-border"
                            title="Maliyet Bilgileri"
                          >
                            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                            Maliyet
                          </button>
                          <Link
                            href={`/streams/${stream.id}`}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                            Detay
                          </Link>
                          <DeleteButton
                            id={stream.id}
                            type="stream"
                            onDelete={fetchData}
                            compact={true}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedStream && (
          <StreamCostModal
            stream={selectedStream}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedStream(null)
            }}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </Layout>
  )
}