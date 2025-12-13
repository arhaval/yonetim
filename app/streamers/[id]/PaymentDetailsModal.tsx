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
                <div className="space-y-2">
                  {paidPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {payment.amount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                            {payment.type && payment.period && (
                              <span className="text-sm text-gray-600">
                                - {payment.type} ({payment.period})
                              </span>
                            )}
                          </div>
                          {payment.description && (
                            <p className="text-sm text-gray-600 mb-1">{payment.description}</p>
                          )}
                          {payment.paidAt && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(payment.paidAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-2">
                  {unpaidPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {payment.amount.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                            {payment.type && payment.period && (
                              <span className="text-sm text-gray-600">
                                - {payment.type} ({payment.period})
                              </span>
                            )}
                          </div>
                          {payment.description && (
                            <p className="text-sm text-gray-600">{payment.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-2">
                  {paidStreams.map((stream) => (
                    <div
                      key={stream.id}
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {stream.streamerEarning.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                            {stream.teamName && (
                              <span className="text-sm text-gray-600">- {stream.teamName}</span>
                            )}
                          </div>
                          {stream.matchInfo && (
                            <p className="text-sm text-gray-600 mb-1">{stream.matchInfo}</p>
                          )}
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(stream.date), 'dd MMMM yyyy', { locale: tr })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-2">
                  {unpaidStreams.map((stream) => (
                    <div
                      key={stream.id}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {stream.streamerEarning.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                            {stream.teamName && (
                              <span className="text-sm text-gray-600">- {stream.teamName}</span>
                            )}
                          </div>
                          {stream.matchInfo && (
                            <p className="text-sm text-gray-600 mb-1">{stream.matchInfo}</p>
                          )}
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(stream.date), 'dd MMMM yyyy', { locale: tr })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-2">
                  {paidScripts.map((script) => (
                    <div
                      key={script.id}
                      className="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {script.price.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                            <span className="text-sm text-gray-600">- {script.title}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(script.createdAt), 'dd MMMM yyyy', { locale: tr })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-2">
                  {unpaidScripts.map((script) => (
                    <div
                      key={script.id}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {script.price.toLocaleString('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                              })}
                            </span>
                            <span className="text-sm text-gray-600">- {script.title}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(script.createdAt), 'dd MMMM yyyy', { locale: tr })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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

