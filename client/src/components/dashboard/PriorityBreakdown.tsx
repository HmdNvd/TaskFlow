import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

interface PriorityBreakdownProps {
  tasks: Task[]
}

const ROWS: { key: Task['priority']; label: string; bar: string }[] = [
  { key: 'high', label: 'High', bar: 'bg-amber-500' },
  { key: 'medium', label: 'Medium', bar: 'bg-blue-500' },
  { key: 'low', label: 'Low', bar: 'bg-slate-400' },
]

export const PriorityBreakdown: React.FC<PriorityBreakdownProps> = ({ tasks }) => {
  const total = tasks.length

  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Priority Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {ROWS.map((row) => {
          const count = tasks.filter((t) => t.priority === row.key).length
          const percent = total > 0 ? Math.round((count / total) * 100) : 0

          return (
            <div key={row.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium text-foreground tabular-nums">{count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all duration-300', row.bar)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}

        {total === 0 && (
          <p className="text-xs text-muted-foreground pt-1">No tasks to summarize yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
