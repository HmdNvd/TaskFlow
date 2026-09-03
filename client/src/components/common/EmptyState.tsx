import React from 'react'
import { FolderOpen, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  className?: string
  children?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 p-8 text-center text-card-foreground',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4 ring-8 ring-muted/20">
        <Icon className="h-7 w-7 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
