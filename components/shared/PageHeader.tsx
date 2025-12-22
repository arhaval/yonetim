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
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {rightActions && (
          <div className="flex items-center gap-2">
            {rightActions}
          </div>
        )}
      </div>
    </div>
  )
}

