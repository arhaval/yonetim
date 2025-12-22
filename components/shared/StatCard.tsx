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
    <Card className={cn('card-hover border-border/50', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight text-foreground mb-1">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center gap-1.5 mt-3 text-xs font-semibold',
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                <span className="text-base">{trend.isPositive ? '↑' : '↓'}</span>
                <span>{trend.value}%</span>
                <span className="text-muted-foreground font-normal">{trend.label}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft',
              iconClassName || 'bg-primary/10 text-primary'
            )}>
              <Icon className={cn(
                'w-7 h-7',
                iconClassName?.includes('text-') ? '' : ''
              )} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

