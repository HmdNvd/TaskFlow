import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg'
  text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  text,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  }

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3', className)}
      {...props}
    >
      <Loader2
        className={cn('animate-spin text-primary', sizeClasses[size])}
      />
      {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
    </div>
  )
}

interface LoadingStateProps {
  title?: string
  description?: string
  minHeight?: string
  className?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading...',
  description = 'Please wait while we fetch the latest data.',
  minHeight = 'min-h-[260px]',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center animate-pulse',
        minHeight,
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
    </div>
  )
}

export { Skeleton } from '@/components/ui/skeleton'
