'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  className?: string
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </p>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {description}
              </p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center gap-1 mt-2 text-xs font-medium',
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{trend.value}%</span>
                <span className="text-slate-500 dark:text-slate-400">{trend.label}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              iconClassName || 'bg-blue-100 dark:bg-blue-900/30'
            )}>
              <Icon className={cn(
                'w-6 h-6',
                iconClassName?.includes('text-') ? '' : 'text-blue-600 dark:text-blue-400'
              )} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

