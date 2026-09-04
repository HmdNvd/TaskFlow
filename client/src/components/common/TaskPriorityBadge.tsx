import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskPriority } from '@/types'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
  showIcon?: boolean
  size?: 'sm' | 'default'
  className?: string
}

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({
  priority,
  showIcon = true,
  size = 'default',
  className,
}) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'high':
        return {
          label: 'High',
          dotColor: 'bg-rose-500',
          classes:
            'border-transparent bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-medium',
        }
      case 'medium':
        return {
          label: 'Medium',
          dotColor: 'bg-amber-500',
          classes:
            'border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-medium',
        }
      case 'low':
      default:
        return {
          label: 'Low',
          dotColor: 'bg-slate-400',
          classes:
            'border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 font-medium',
        }
    }
  }

  const config = getPriorityConfig()

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors',
        config.classes,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {showIcon && (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotColor)} />
      )}
      <span>{config.label}</span>
    </Badge>
  )
}
