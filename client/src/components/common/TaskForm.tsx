import React, { useState, useEffect } from 'react'
import {
  Save,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { usersApi } from '@/services/api'
import type { Task, TaskPriority, TaskStatus, User } from '@/types'

interface TaskFormProps {
  initialData?: Partial<Task>
  isEdit?: boolean
  onSubmit: (formData: Partial<Task>) => void
  onCancel: () => void
  isSubmitting?: boolean
}

const formatDateForInput = (dateStr?: string | null): string => {
  if (!dateStr) return ''
  return dateStr.split('T')[0]
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  isEdit = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { isAdmin } = useAuth()
  const isMemberEditing = isEdit && !isAdmin

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: (initialData?.status || 'todo') as TaskStatus,
    priority: (initialData?.priority || 'medium') as TaskPriority,
    assigned_to_id: initialData?.assigned_to?.id != null
      ? String(initialData.assigned_to.id)
      : '',
    due_date: formatDateForInput(initialData?.due_date) || new Date().toISOString().split('T')[0],
  })

  const [users, setUsers] = useState<User[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  // Fetch real users from API for assignee dropdown
  useEffect(() => {
    let isMounted = true
    usersApi
      .getAll()
      .then((res) => {
        if (!isMounted) return
        const payload = res.data
        if (Array.isArray(payload)) {
          setUsers(payload)
        } else if (payload && Array.isArray((payload as any).data)) {
          setUsers((payload as any).data)
        }
      })
      .catch((err) => {
        console.error('Failed to load users for assignment:', err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Synchronize formData when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: (initialData.status || 'todo') as TaskStatus,
        priority: (initialData.priority || 'medium') as TaskPriority,
        assigned_to_id: initialData.assigned_to?.id != null
          ? String(initialData.assigned_to.id)
          : '',
        due_date: formatDateForInput(initialData.due_date) || '',
      })
    }
  }, [initialData])

  const validate = () => {
    if (isMemberEditing) {
      return true
    }

    const errs: Record<string, string> = {}
    if (!formData.title.trim()) {
      errs.title = 'Task title is required'
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters'
    }

    if (!formData.description.trim()) {
      errs.description = 'Task description is required'
    }

    if (!formData.due_date) {
      errs.due_date = 'Due date is required'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (isMemberEditing) {
      setSubmittedSuccess(true)
      onSubmit({
        status: formData.status,
      })
      return
    }

    const selectedAssignee = users.find((u) => String(u.id) === formData.assigned_to_id) || null

    const taskPayload: Partial<Task> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      assigned_to: selectedAssignee
        ? {
            id: Number(selectedAssignee.id),
            name: selectedAssignee.name,
            email: selectedAssignee.email,
          }
        : null,
      due_date: formData.due_date || null,
    }

    setSubmittedSuccess(true)
    onSubmit(taskPayload)
  }

  return (
    <Card className="shadow-lg border-border/80 rounded-2xl">
      <CardHeader className="border-b border-border/50 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                {isEdit ? 'Edit Task' : 'Create Task'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isEdit
                  ? isMemberEditing
                    ? `Update status for task #${initialData?.id || ''}.`
                    : `Update specifications and assignments for task #${initialData?.id || ''}.`
                  : 'Add a new task to the internal TaskFlow system.'}
              </CardDescription>
            </div>
          </div>

          {isEdit && initialData?.id && (
            <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
              #{initialData.id}
            </span>
          )}
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {/* Member notification banner */}
          {isMemberEditing && (
            <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 text-xs text-primary border border-primary/20">
              <Info className="h-4 w-4 shrink-0" />
              <span>You are viewing this task as a Member. Members are permitted to update task status.</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Task Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Implement user authentication middleware"
              value={formData.title}
              disabled={isMemberEditing}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value })
                if (errors.title) setErrors({ ...errors, title: '' })
              }}
              className={`${errors.title ? 'border-destructive focus-visible:ring-destructive' : ''} disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            {errors.title && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              disabled={isMemberEditing}
              className={`w-full rounded-md border bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                errors.description
                  ? 'border-destructive focus-visible:ring-destructive'
                  : 'border-input'
              }`}
              placeholder="Describe requirements, acceptance criteria, and deliverable scope..."
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                if (errors.description) setErrors({ ...errors, description: '' })
              }}
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Status <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as TaskStatus })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Priority <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.priority}
                disabled={isMemberEditing}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as TaskPriority })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Assignee
              </label>
              <select
                value={formData.assigned_to_id}
                disabled={isMemberEditing}
                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={String(user.id)}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Due Date <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                value={formData.due_date}
                disabled={isMemberEditing}
                onChange={(e) => {
                  setFormData({ ...formData, due_date: e.target.value })
                  if (errors.due_date) setErrors({ ...errors, due_date: '' })
                }}
                className={`${errors.due_date ? 'border-destructive focus-visible:ring-destructive' : ''} disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {errors.due_date && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.due_date}</p>
              )}
            </div>
          </div>

          {submittedSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-800 text-xs font-medium dark:bg-emerald-950/50 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Task saved successfully! Redirecting...</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/50 pt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel</span>
          </Button>

          <Button type="submit" disabled={isSubmitting || submittedSuccess} className="gap-2 shadow-sm">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSubmitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
