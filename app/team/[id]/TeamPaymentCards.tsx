'use client'

import { useState } from 'react'
import { AlertCircle, DollarSign } from 'lucide-react'
import PaymentDetailsModal from '../../streamers/[id]/PaymentDetailsModal'

interface TeamPaymentCardsProps {
  totalPaid: number
  totalUnpaid: number
  payments?: Array<{
    id: string
    amount: number
    paidAt: Date | null
    description?: string | null
    type?: string | null
    period?: string | null
  }>
  payouts?: Array<{
    id: string
    amount: number
    paidAt: Date | null
    description?: string | null
    type?: string | null
    period?: string | null
  }>
  scripts?: Array<{
    id: string
    title: string
    price: number
    status: string
    createdAt: Date
    audioFile?: string | null
  }>
  financialRecords?: Array<{
    id: string
    type: string
    amount: number
    date: Date
    description?: string | null
    category?: string | null
    entryType?: string | null
    direction?: string | null
  }>
}

export default function TeamPaymentCards({
  totalPaid,
  totalUnpaid,
  payments = [],
  payouts = [],
  scripts = [],
  financialRecords = [],
}: TeamPaymentCardsProps) {
  const [showPaidModal, setShowPaidModal] = useState(false)
  const [showUnpaidModal, setShowUnpaidModal] = useState(false)

  const handlePaidClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowPaidModal(true)
  }

  const handleUnpaidClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowUnpaidModal(true)
  }

  return (
    <>
      <button
        type="button"
        className="w-full bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow text-left"
        onClick={handlePaidClick}
      >
        <div className="p-5">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>Ödenen</span>
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              {totalPaid.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              })}
            </dd>
            <dd className="mt-1 text-xs text-gray-500">Detaylar için tıklayın</dd>
          </dl>
        </div>
      </button>
      <button
        type="button"
        className="w-full bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition-shadow text-left"
        onClick={handleUnpaidClick}
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
      </button>

      <PaymentDetailsModal
        isOpen={showPaidModal}
        onClose={() => setShowPaidModal(false)}
        title="Ödenen Ödemeler"
        payments={[
          ...payments.filter(p => p.paidAt),
          ...payouts.filter(p => p.paidAt),
        ]}
        scripts={scripts.filter(s => s.status === 'paid')}
        financialRecords={financialRecords.filter(fr => 
          fr.type === 'expense'
        )}
      />

      <PaymentDetailsModal
        isOpen={showUnpaidModal}
        onClose={() => setShowUnpaidModal(false)}
        title="Ödenmemiş Ödemeler"
        payments={payments.filter(p => !p.paidAt)}
        scripts={scripts.filter(s => s.status === 'approved' || (s.status === 'pending' && s.audioFile))}
        financialRecords={[]}
      />
    </>
  )
}

