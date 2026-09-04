import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive?: boolean
  }
  variant?: 'blue' | 'amber' | 'emerald' | 'purple' | 'rose' | 'default'
  className?: string
}

const ICON_VARIANT_CLASSES: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'bg-muted text-muted-foreground',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) => {
  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:border-foreground/20 hover:shadow-md border-border/70 bg-card shadow-sm',
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {title}
          </span>
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
              ICON_VARIANT_CLASSES[variant]
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-muted-foreground line-clamp-1">{subtitle}</span>
          )}
          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 font-medium ml-auto',
                trend.isPositive !== false
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {trend.isPositive !== false ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
