import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && (
        <div>
          {action.href ? (
            <a
              href={action.href}
              className="btn btn-primary"
            >
              {action.label}
            </a>
          ) : action.onClick ? (
            <button
              onClick={action.onClick}
              className="btn btn-primary"
            >
              {action.label}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}







