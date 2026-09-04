import React from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TaskStatusBadge } from '@/components/common/TaskStatusBadge'
import { TaskPriorityBadge } from '@/components/common/TaskPriorityBadge'
import { useAuth } from '@/context/AuthContext'
import type { Task } from '@/types'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onView?: (task: Task) => void
  onDelete?: (task: Task) => void
  className?: string
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onView,
  onDelete,
  className,
}) => {
  const { isAdmin } = useAuth()
  const canDelete = isAdmin && !!onDelete

  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/70 bg-card p-5 transition-all duration-150 hover:border-foreground/20 hover:shadow-md',
        className
      )}
    >
      {/* Header: Task ID & Due Date */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3 text-xs text-muted-foreground">
        <span className="font-mono font-bold text-foreground tracking-tight">
          {task.id}
        </span>

        {task.due_date && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Due {task.due_date}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <CardContent className="p-0 pt-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            onClick={() => onView && onView(task)}
            className="text-base font-bold tracking-tight text-foreground transition-colors hover:text-primary cursor-pointer line-clamp-1"
          >
            {task.title}
          </h3>
          <TaskPriorityBadge priority={task.priority} size="sm" />
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {task.description}
        </p>

        {/* Card Footer: Status Pill, Assignee, and Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border/40 mt-3">
          {/* Status Badge */}
          <TaskStatusBadge status={task.status} size="sm" />

          {/* Assignee */}
          {task.assigned_to ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-full">
              <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold">
                {task.assigned_to.name[0]}
              </div>
              <span className="text-[11px] font-medium text-foreground/90 truncate max-w-[110px]">
                {task.assigned_to.name}
              </span>
            </div>
          ) : (
            <span className="text-[11px] italic text-muted-foreground">Unassigned</span>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onView && onView(task)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="View Task Details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>

            <Link
              to={`/tasks/${task.id}/edit`}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Edit Task"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Link>

            {canDelete && (
              <button
                onClick={() => onDelete?.(task)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Delete Task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
