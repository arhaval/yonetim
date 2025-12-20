'use client'

import { X, Calendar, DollarSign, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale/tr'

interface PaymentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  payments: Array<{
    id: string
    amount: number
    paidAt: Date | null
    description?: string | null
    type?: string | null
    period?: string | null
  }>
  streams?: Array<{
    id: string
    date: Date
    streamerEarning: number
    paymentStatus: string
    teamName?: string | null
    matchInfo?: string | null
  }>
  scripts?: Array<{
    id: string
    title: string
    price: number
    status: string
    createdAt: Date
    audioFile?: string | null
  }>
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  title,
  payments,
  streams,
  scripts,
}: PaymentDetailsModalProps) {
  if (!isOpen) return null

  const paidPayments = payments.filter(p => p.paidAt)
  const unpaidPayments = payments.filter(p => !p.paidAt)
  const paidStreams = streams?.filter(s => s.paymentStatus === 'paid') || []
  const unpaidStreams = streams?.filter(s => s.paymentStatus === 'pending') || []
  const paidScripts = scripts?.filter(s => s.status === 'paid') || []
  const unpaidScripts = scripts?.filter(s => s.status === 'approved' || (s.status === 'pending' && s.audioFile)) || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Ödenen Ödemeler */}
            {paidPayments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Ödenen Ödemeler ({paidPayments.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tutar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tip / Dönem
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Açıklama
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Ödeme Tarihi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paidPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-green-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-green-600">
                              {payment.amount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {payment.type && payment.period ? (
                              <span className="text-sm text-gray-900">
                                {payment.type} ({payment.period})
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">
                              {payment.description || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {payment.paidAt ? (
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(new Date(payment.paidAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ödenmemiş Ödemeler */}
            {unpaidPayments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-red-600" />
                  Ödenmemiş Ödemeler ({unpaidPayments.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tutar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tip / Dönem
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Açıklama
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Durum
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unpaidPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-red-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-red-600">
                              {payment.amount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {payment.type && payment.period ? (
                              <span className="text-sm text-gray-900">
                                {payment.type} ({payment.period})
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">
                              {payment.description || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Beklemede
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ödenen Yayınlar */}
            {paidStreams.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Ödenen Yayınlar ({paidStreams.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tutar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Takım
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Maç Bilgisi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tarih
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paidStreams.map((stream) => (
                        <tr key={stream.id} className="hover:bg-green-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-green-600">
                              {stream.streamerEarning.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {stream.teamName || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">
                              {stream.matchInfo || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(stream.date), 'dd MMMM yyyy', { locale: tr })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ödenmemiş Yayınlar */}
            {unpaidStreams.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-600" />
                  Ödenmemiş Yayınlar ({unpaidStreams.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tutar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Takım
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Maç Bilgisi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tarih
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unpaidStreams.map((stream) => (
                        <tr key={stream.id} className="hover:bg-red-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-red-600">
                              {stream.streamerEarning.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {stream.teamName || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">
                              {stream.matchInfo || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(stream.date), 'dd MMMM yyyy', { locale: tr })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ödenen Metinler */}
            {paidScripts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Ödenen Metinler ({paidScripts.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tutar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Başlık
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Oluşturulma Tarihi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paidScripts.map((script) => (
                        <tr key={script.id} className="hover:bg-green-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-green-600">
                              {script.price.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-900">{script.title}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(script.createdAt), 'dd MMMM yyyy', { locale: tr })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ödenmemiş Metinler */}
            {unpaidScripts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-600" />
                  Ödenmemiş Metinler ({unpaidScripts.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tutar
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Başlık
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Oluşturulma Tarihi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unpaidScripts.map((script) => (
                        <tr key={script.id} className="hover:bg-red-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-red-600">
                              {script.price.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-900">{script.title}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(script.createdAt), 'dd MMMM yyyy', { locale: tr })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {paidPayments.length === 0 && unpaidPayments.length === 0 && 
             (!streams || (paidStreams.length === 0 && unpaidStreams.length === 0)) &&
             (!scripts || (paidScripts.length === 0 && unpaidScripts.length === 0)) && (
              <div className="text-center py-8 text-gray-500">
                Henüz ödeme kaydı yok
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

