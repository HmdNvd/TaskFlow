import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

interface StatusDistributionProps {
  tasks: Task[]
}

const SEGMENTS: { key: Task['status']; label: string; color: string }[] = [
  { key: 'completed', label: 'Completed', color: 'stroke-emerald-500' },
  { key: 'in_progress', label: 'In Progress', color: 'stroke-cyan-500' },
  { key: 'todo', label: 'To Do', color: 'stroke-slate-400' },
]

const DOT_COLOR: Record<string, string> = {
  completed: 'bg-emerald-500',
  in_progress: 'bg-cyan-500',
  todo: 'bg-slate-400',
}

export const StatusDistribution: React.FC<StatusDistributionProps> = ({ tasks }) => {
  const total = tasks.length
  const counts = {
    completed: tasks.filter((t) => t.status === 'completed').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
  }

  const radius = 42
  const circumference = 2 * Math.PI * radius

  let offsetAccumulator = 0
  const arcs = SEGMENTS.map((segment) => {
    const count = counts[segment.key as keyof typeof counts]
    const fraction = total > 0 ? count / total : 0
    const dashLength = fraction * circumference
    const arc = {
      ...segment,
      count,
      dashArray: `${dashLength} ${circumference - dashLength}`,
      dashOffset: -offsetAccumulator,
    }
    offsetAccumulator += dashLength
    return arc
  })

  const completionRate = total > 0 ? Math.round((counts.completed / total) * 100) : 0

  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              strokeWidth="10"
              className="stroke-muted"
            />
            {total > 0 &&
              arcs.map((arc) =>
                arc.count > 0 ? (
                  <circle
                    key={arc.key}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    strokeWidth="10"
                    strokeDasharray={arc.dashArray}
                    strokeDashoffset={arc.dashOffset}
                    strokeLinecap="round"
                    className={cn(arc.color, 'transition-all duration-500 ease-out')}
                  />
                ) : null
              )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-foreground tabular-nums">
              {completionRate}%
            </span>
            <span className="text-[10px] text-muted-foreground">done</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {arcs.map((arc) => (
            <div key={arc.key} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${DOT_COLOR[arc.key]}`} />
                <span className="text-muted-foreground">{arc.label}</span>
              </div>
              <span className="font-medium text-foreground tabular-nums">{arc.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
