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
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200 hover:border-foreground/15 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      {/* Header: Task ID & Due Date */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono text-[11px] font-semibold text-muted-foreground/80 tracking-tight">
          #{task.id}
        </span>

        {task.due_date && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Due {task.due_date}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <CardContent className="p-0 pt-3 space-y-3">
        {/* Title — primary hierarchy */}
        <h3
          onClick={() => onView && onView(task)}
          className="text-base font-semibold tracking-tight text-foreground transition-colors hover:text-primary cursor-pointer line-clamp-1"
        >
          {task.title}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {task.description}
        </p>

        {/* Priority + Status on the same row */}
        <div className="flex items-center gap-2 pt-1">
          <TaskPriorityBadge priority={task.priority} size="sm" />
          <TaskStatusBadge status={task.status} size="sm" />
        </div>

        {/* Card Footer: Assignee + Action buttons */}
        <div className="flex items-center justify-between gap-2 pt-3.5 border-t border-border/40 mt-1">
          {/* Assignee */}
          {task.assigned_to ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
              <div className="h-5 w-5 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-semibold">
                {task.assigned_to.name[0]}
              </div>
              <span className="text-[11px] font-medium text-foreground/90 truncate max-w-[130px]">
                {task.assigned_to.name}
              </span>
            </div>
          ) : (
            <span className="text-[11px] italic text-muted-foreground">Unassigned</span>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
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
