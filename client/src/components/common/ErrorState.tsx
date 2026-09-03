import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  variant?: 'card' | 'inline'
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  variant = 'card',
  className,
}) => {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive text-sm',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{title}</p>
            {message && <p className="text-xs opacity-90">{message}</p>}
          </div>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/20 text-destructive h-8"
            onClick={onRetry}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4 ring-8 ring-destructive/5">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
