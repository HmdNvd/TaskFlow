import React from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  User as UserIcon,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TaskStatusBadge } from '@/components/common/TaskStatusBadge'
import { TaskPriorityBadge } from '@/components/common/TaskPriorityBadge'
import { TaskDetailSkeleton } from '@/components/common/skeletons'
import { ErrorState } from '@/components/common/ErrorState'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { useAuth } from '@/context/AuthContext'
import type { Task } from '@/types'

interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onDelete?: (task: Task) => void
  isLoading?: boolean
  error?: string | null
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  open,
  onClose,
  onDelete,
  isLoading = false,
  error = null,
}) => {
  const { user, isAdmin } = useAuth()
  const canDelete = isAdmin && !!onDelete

  const [chatOpen, setChatOpen] = React.useState(false)

  // The chat is only offered between the task's Admin creator and the
  // Member currently assigned to it — using existing task assignment data.
  const currentUserId = user ? Number(user.id) : null
  const assignedId = task?.assigned_to ? Number(task.assigned_to.id) : null
  const creatorId = task?.created_by ? Number(task.created_by.id) : null

  let chatTargetId: number | null = null
  let chatTargetName: string | null = null

  if (task && currentUserId != null) {
    if (isAdmin && assignedId != null && assignedId !== currentUserId) {
      chatTargetId = assignedId
      chatTargetName = task.assigned_to!.name
    } else if (
      !isAdmin &&
      assignedId != null &&
      assignedId === currentUserId &&
      creatorId != null &&
      creatorId !== currentUserId
    ) {
      chatTargetId = creatorId
      chatTargetName = task.created_by.name
    }
  }

  if (!open || (!task && !isLoading && !error)) return null

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-2xl">
        {isLoading ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Loading task details</DialogTitle>
              <DialogDescription>Please wait while the task is loaded.</DialogDescription>
            </DialogHeader>
            <TaskDetailSkeleton />
          </>
        ) : error ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Unable to load task</DialogTitle>
              <DialogDescription>{error}</DialogDescription>
            </DialogHeader>
            <ErrorState title="Unable to load task" message={error} />
          </>
        ) : task ? (
          <>
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              {task.id}
            </span>

            <div className="flex items-center gap-2 mr-6">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground text-left">
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-left text-xs">
            Created on {new Date(task.created_at).toLocaleDateString()} by {task.created_by?.name || 'System'}
          </DialogDescription>
        </DialogHeader>

        {/* Modal Body Details */}
        <div className="space-y-5 py-2">
          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Description
            </h4>
            <div className="rounded-xl bg-muted/30 p-4 text-sm text-foreground leading-relaxed border border-border/40">
              {task.description}
            </div>
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-border/50 p-3.5 space-y-1 bg-card">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <UserIcon className="h-3.5 w-3.5 text-primary" /> Assigned To
              </span>
              <p className="font-bold text-foreground text-sm">
                {task.assigned_to ? task.assigned_to.name : 'Unassigned'}
              </p>
              {chatTargetId != null && chatTargetName && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1 h-7 gap-1.5 text-xs"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageCircle className="h-3 w-3" />
                  Message {chatTargetName.split(' ')[0]}
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-border/50 p-3.5 space-y-1 bg-card">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-amber-500" /> Target Due Date
              </span>
              <p className="font-bold text-foreground text-sm">
                {task.due_date || 'No due date set'}
              </p>
              <p className="text-[11px] text-muted-foreground">Scheduled delivery</p>
            </div>
          </div>

          {/* Timeline Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/40">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Last updated {new Date(task.updated_at).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Status: {task.status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-border/60 pt-4">
          {canDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose()
                onDelete(task)
              }}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive self-start"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              <span>Delete Task</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" asChild className="gap-1.5">
              <Link to={`/tasks/${task.id}/edit`}>
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Task</span>
              </Link>
            </Button>
          </div>
        </DialogFooter>
          </>
        ) : null}
        </DialogContent>
      </Dialog>

      {chatTargetId != null && chatTargetName && (
        <ChatWindow
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          targetUserId={chatTargetId}
          targetUserName={chatTargetName}
        />
      )}
    </>
  )
}
