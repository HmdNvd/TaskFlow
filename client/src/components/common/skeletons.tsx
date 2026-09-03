import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonRegionProps {
  label: string
  className?: string
  children: React.ReactNode
}

const SkeletonRegion: React.FC<SkeletonRegionProps> = ({ label, className, children }) => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    className={className}
  >
    <span className="sr-only">{label}</span>
    {children}
  </div>
)

export const StatCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card
    aria-hidden="true"
    className={cn('border-border/70 bg-card', className)}
  >
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-9 w-16" />
      </div>
      <div className="mt-2">
        <Skeleton className="h-3 w-28" />
      </div>
    </CardContent>
  </Card>
)

export const TaskCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card
    aria-hidden="true"
    className={cn(
      'relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5',
      className
    )}
  >
    <div className="flex items-center justify-between border-b border-border/50 pb-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="pt-3.5 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border/40 mt-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      </div>
    </div>
  </Card>
)

export const TaskTableSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 6,
  className,
}) => (
  <div
    aria-hidden="true"
    className={cn('overflow-x-auto rounded-2xl border border-border bg-card shadow-xs', className)}
  >
    <table className="w-full text-left text-sm">
      <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
        <tr>
          <th scope="col" className="px-5 py-3.5">
            Task
          </th>
          <th scope="col" className="px-4 py-3.5">
            Status
          </th>
          <th scope="col" className="px-4 py-3.5">
            Priority
          </th>
          <th scope="col" className="px-4 py-3.5">
            Assignee
          </th>
          <th scope="col" className="px-4 py-3.5">
            Due Date
          </th>
          <th scope="col" className="px-4 py-3.5 text-right">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, index) => (
          <tr key={index}>
            <td className="px-5 py-4">
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
            </td>
            <td className="px-4 py-4">
              <Skeleton className="h-5 w-20 rounded-full" />
            </td>
            <td className="px-4 py-4">
              <Skeleton className="h-5 w-16 rounded-full" />
            </td>
            <td className="px-4 py-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </td>
            <td className="px-4 py-4">
              <Skeleton className="h-3 w-20" />
            </td>
            <td className="px-4 py-4">
              <div className="flex items-center justify-end gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export const UserCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card
    aria-hidden="true"
    className={cn('border-border/70 rounded-2xl', className)}
  >
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </CardContent>
  </Card>
)

export const DashboardSkeleton: React.FC = () => (
  <SkeletonRegion label="Loading dashboard" className="space-y-8">
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>

    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-28 rounded-xl" />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <TaskCardSkeleton key={index} />
        ))}
      </div>
    </div>

    <div className="space-y-4 pt-4 border-t border-border/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <TaskCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </SkeletonRegion>
)

export const TaskListSkeleton: React.FC<{ viewMode?: 'grid' | 'table' }> = ({
  viewMode = 'grid',
}) => (
  <SkeletonRegion label="Loading tasks">
    {viewMode === 'table' ? (
      <TaskTableSkeleton rows={8} />
    ) : (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <TaskCardSkeleton key={index} />
        ))}
      </div>
    )}
  </SkeletonRegion>
)

export const TaskDetailSkeleton: React.FC = () => (
  <SkeletonRegion label="Loading task details" className="space-y-3">
    <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
      <Skeleton className="h-6 w-24 rounded-md" />
      <div className="flex items-center gap-2 mr-6">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>

    <Skeleton className="h-7 w-4/5" />
    <Skeleton className="h-3 w-56" />

    <div className="space-y-5 py-2">
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-24" />
        <div className="rounded-xl bg-muted/30 p-4 border border-border/40 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/50 p-3.5 space-y-2 bg-card">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="rounded-xl border border-border/50 p-3.5 space-y-2 bg-card">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      <div className="flex items-center justify-between bg-muted/20 p-3 rounded-xl border border-border/40">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>

    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-border/60 pt-4">
      <Skeleton className="h-8 w-28" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  </SkeletonRegion>
)

export const UsersSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <SkeletonRegion label="Loading users" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
    {Array.from({ length: count }).map((_, index) => (
      <UserCardSkeleton key={index} />
    ))}
  </SkeletonRegion>
)
