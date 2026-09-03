import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types'

interface TaskStatusBadgeProps {
  status: TaskStatus
  size?: 'sm' | 'default'
  showDot?: boolean
  className?: string
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  size = 'default',
  showDot = true,
  className,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          badgeVariant: 'success' as const,
          customClasses:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-950/50 dark:text-emerald-300',
          dotColor: 'bg-emerald-500',
        }
      case 'in_progress':
        return {
          label: 'In Progress',
          badgeVariant: 'default' as const,
          customClasses:
            'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800/80 dark:bg-cyan-950/50 dark:text-cyan-300',
          dotColor: 'bg-cyan-500',
        }
      case 'todo':
      default:
        return {
          label: 'To Do',
          badgeVariant: 'secondary' as const,
          customClasses:
            'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
          dotColor: 'bg-slate-400',
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn(
        'font-medium transition-colors inline-flex items-center gap-1.5 shadow-2xs',
        config.customClasses,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            config.dotColor
          )}
        />
      )}
      <span>{config.label}</span>
    </Badge>
  )
}
