import React from 'react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
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
          icon: ArrowUp,
          classes:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300 font-medium',
        }
      case 'medium':
        return {
          label: 'Medium',
          icon: Minus,
          classes:
            'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300 font-medium',
        }
      case 'low':
      default:
        return {
          label: 'Low',
          icon: ArrowDown,
          classes:
            'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 font-medium',
        }
    }
  }

  const config = getPriorityConfig()
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1 shadow-2xs transition-colors',
        config.classes,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {showIcon && <Icon className={cn('shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      <span>{config.label}</span>
    </Badge>
  )
}
