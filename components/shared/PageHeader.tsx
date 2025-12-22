'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface PageHeaderProps {
  title: string
  description?: string
  rightActions?: ReactNode
}

export function PageHeader({ title, description, rightActions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          {description && (
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {rightActions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {rightActions}
          </div>
        )}
      </div>
    </div>
  )
}

