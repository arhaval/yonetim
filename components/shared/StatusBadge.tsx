'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusType = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'paid' 
  | 'unpaid' 
  | 'partial'
  | 'active'
  | 'inactive'
  | 'processing'
  | 'completed'
  | 'cancelled'

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Beklemede', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  approved: { label: 'Onaylandı', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
  rejected: { label: 'Reddedildi', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
  paid: { label: 'Ödendi', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
  unpaid: { label: 'Ödenmedi', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
  partial: { label: 'Kısmen Ödendi', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  active: { label: 'Aktif', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  inactive: { label: 'Pasif', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
  processing: { label: 'İşleniyor', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  completed: { label: 'Tamamlandı', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
  cancelled: { label: 'İptal Edildi', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800'
  }

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

