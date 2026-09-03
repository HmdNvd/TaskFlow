import React from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Edit2,
  Trash2,
  Eye,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskStatusBadge } from '@/components/common/TaskStatusBadge'
import { TaskPriorityBadge } from '@/components/common/TaskPriorityBadge'
import { useAuth } from '@/context/AuthContext'
import type { Task } from '@/types'
import { cn } from '@/lib/utils'

interface TaskTableProps {
  tasks: Task[]
  onView: (task: Task) => void
  onDelete?: (task: Task) => void
  className?: string
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onView,
  onDelete,
  className,
}) => {
  const { isAdmin } = useAuth()
  const canDelete = isAdmin && !!onDelete
  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-border bg-card shadow-xs', className)}>
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
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="group hover:bg-muted/30 transition-colors"
            >
              {/* Task Title & ID */}
              <td className="px-5 py-4">
                <div className="flex flex-col space-y-1">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    {task.id}
                  </span>

                  <button
                    onClick={() => onView(task)}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left line-clamp-1 cursor-pointer"
                  >
                    {task.title}
                  </button>

                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                    {task.description}
                  </p>
                </div>
              </td>

              {/* Status */}
              <td className="px-4 py-4 whitespace-nowrap">
                <TaskStatusBadge status={task.status} size="sm" />
              </td>

              {/* Priority */}
              <td className="px-4 py-4 whitespace-nowrap">
                <TaskPriorityBadge priority={task.priority} size="sm" />
              </td>

              {/* Assignee */}
              <td className="px-4 py-4 whitespace-nowrap">
                {task.assigned_to ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      <UserIcon className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {task.assigned_to.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs italic text-muted-foreground">Unassigned</span>
                )}
              </td>

              {/* Due Date */}
              <td className="px-4 py-4 whitespace-nowrap text-xs text-muted-foreground">
                {task.due_date ? (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{task.due_date}</span>
                  </div>
                ) : (
                  <span className="italic text-muted-foreground/60">—</span>
                )}
              </td>

              {/* Actions */}
              <td className="px-4 py-4 whitespace-nowrap text-right text-xs">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(task)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    title="View details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    title="Edit task"
                  >
                    <Link to={`/tasks/${task.id}/edit`}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Link>
                  </Button>

                  {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(task)}
                    className="h-8 w-8 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                    title="Delete task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
