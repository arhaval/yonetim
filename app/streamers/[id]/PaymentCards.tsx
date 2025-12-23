'use client'

import { useState } from 'react'
import { AlertCircle, DollarSign } from 'lucide-react'
import PaymentDetailsModal from './PaymentDetailsModal'

interface PaymentCardsProps {
  totalEarning: number
  totalUnpaid: number
  payments: Array<{
    id: string
    amount: number
    paidAt: Date | null
    description?: string | null
    type?: string | null
    period?: string | null
  }>
  streams: Array<{
    id: string
    date: Date
    streamerEarning: number
    paymentStatus: string
    teamName?: string | null
    matchInfo?: string | null
  }>
  financialRecords?: Array<{
    id: string
    type: string
    amount: number
    date: Date
    description?: string | null
    category?: string | null
  }>
}

export default function PaymentCards({
  totalEarning,
  totalUnpaid,
  payments,
  streams,
  financialRecords = [],
}: PaymentCardsProps) {
  const [showPaidModal, setShowPaidModal] = useState(false)
  const [showUnpaidModal, setShowUnpaidModal] = useState(false)

  const paidPayments = payments.filter(p => p.paidAt)
  const unpaidPayments = payments.filter(p => !p.paidAt)
  const paidStreams = streams.filter(s => s.paymentStatus === 'paid')
  const unpaidStreams = streams.filter(s => s.paymentStatus === 'pending')
  
  // Finansal kayıtlardan ödemeler (type: 'expense' ve bu kişiye ait)
  const paidFinancialRecords = financialRecords.filter(fr => fr.type === 'expense')
  const unpaidFinancialRecords: any[] = [] // Finansal kayıtlar genelde ödenmiş sayılır

  return (
    <>
      <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowPaidModal(true)}
      >
        <div className="p-5">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>Ödenen</span>
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              {totalEarning.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              })}
            </dd>
            <dd className="mt-1 text-xs text-gray-500">Detaylar için tıklayın</dd>
          </dl>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowUnpaidModal(true)}
      >
        <div className="p-5">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>Ödenmemiş</span>
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">
              {totalUnpaid.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              })}
            </dd>
            <dd className="mt-1 text-xs text-gray-500">Detaylar için tıklayın</dd>
          </dl>
        </div>
      </div>

      <PaymentDetailsModal
        isOpen={showPaidModal}
        onClose={() => setShowPaidModal(false)}
        title="Ödenen Ödemeler ve Yayınlar"
        payments={paidPayments}
        streams={paidStreams}
        financialRecords={paidFinancialRecords}
      />

      <PaymentDetailsModal
        isOpen={showUnpaidModal}
        onClose={() => setShowUnpaidModal(false)}
        title="Ödenmemiş Ödemeler ve Yayınlar"
        payments={unpaidPayments}
        streams={unpaidStreams}
        financialRecords={unpaidFinancialRecords}
      />
    </>
  )
}

