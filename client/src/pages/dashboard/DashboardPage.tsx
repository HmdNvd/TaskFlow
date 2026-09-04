import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Briefcase,
  UserCheck,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/common/StatCard'
import { TaskCard } from '@/components/common/TaskCard'
import { TaskDetailModal } from '@/components/common/TaskDetailModal'
import { StatusDistribution } from '@/components/dashboard/StatusDistribution'
import { PriorityBreakdown } from '@/components/dashboard/PriorityBreakdown'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { DashboardSkeleton } from '@/components/common/skeletons'
import { fetchTasks, getTasksErrorMessage, deleteTask } from '@/services/tasks'
import type { Task } from '@/types'

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    try {
      const nextTasks = await fetchTasks(signal)
      setTasks(nextTasks)
    } catch (loadError) {
      if (signal?.aborted) {
        return
      }
      setTasks([])
      setError(getTasksErrorMessage(loadError))
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadTasks(controller.signal)
    return () => controller.abort()
  }, [loadTasks])

  const totalTasksCount = tasks.length
  const todoCount = tasks.filter((t) => t.status === 'todo').length
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length

  // Overdue = has a due date in the past and isn't completed yet.
  // Derived entirely from existing task fields — no new API/data needed.
  const overdueCount = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return tasks.filter((t) => {
      if (!t.due_date || t.status === 'completed') return false
      const due = new Date(t.due_date)
      return !Number.isNaN(due.getTime()) && due < now
    }).length
  }, [tasks])

  const completionRate =
    totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0

  const recentTasks = useMemo(
    () =>
      [...tasks]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 6),
    [tasks]
  )

  const myTasks = tasks.filter(
    (t) =>
      t.assigned_to != null &&
      user != null &&
      String(t.assigned_to.id) === String(user.id)
  )

  const handleDeleteConfirmed = async () => {
    if (!taskToDelete) {
      return
    }

    try {
      await deleteTask(taskToDelete.id)

      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id))
      setTaskToDelete(null)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header Banner */}
      <div className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-gradient-to-br from-card to-muted/30 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-sm text-muted-foreground">
                Welcome back, <span className="font-medium text-foreground">{user?.name}</span> — here's your overview.
              </p>
              {!isLoading && !error && overdueCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[11px] font-medium text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {overdueCount} overdue
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild className="gap-2 font-medium">
              <Link to="/tasks/create">
                <Plus className="h-4 w-4" />
                <span>Create Task</span>
              </Link>
            </Button>
          </div>
        </div>

        {!isLoading && !error && totalTasksCount > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Overall completion</span>
              <span className="font-semibold text-foreground tabular-nums">{completionRate}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : error ? (
        <ErrorState
          title="Unable to load dashboard"
          message={error}
          onRetry={() => {
            void loadTasks()
          }}
        />
      ) : (
        <>
          {/* 2. Summary Cards (Total Tasks, To Do, In Progress, Completed) */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Tasks"
              value={totalTasksCount}
              subtitle="All recorded tasks"
              icon={ListTodo}
              variant="purple"
            />

            <StatCard
              title="To Do"
              value={todoCount}
              subtitle="Pending start"
              icon={Clock}
              variant="default"
            />

            <StatCard
              title="In Progress"
              value={inProgressCount}
              subtitle="Currently active"
              icon={Briefcase}
              variant="blue"
            />

            <StatCard
              title="Completed"
              value={completedCount}
              subtitle="Resolved & finished"
              icon={CheckCircle2}
              variant="emerald"
            />
          </div>

          {/* 3. Main content (tasks) + analytics rail */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main column: Recent Tasks + My Tasks */}
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Tasks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                      Recent Tasks
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Recently created and updated tasks
                    </p>
                  </div>

                  <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs shrink-0">
                    <Link to="/tasks">
                      <span className="hidden sm:inline">View All</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                {recentTasks.length === 0 ? (
                  <EmptyState
                    title="No tasks yet"
                    description="There are currently no tasks to display on the dashboard."
                    actionLabel="Create Task"
                    onAction={() => navigate('/tasks/create')}
                  />
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {recentTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onView={(t) => setSelectedTask(t)}
                        onDelete={isAdmin ? (t) => setTaskToDelete(t) : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* My Tasks Section (Assigned to logged-in user) */}
              <div id="my-tasks" className="space-y-4 pt-6 border-t border-border/60">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h2 className="text-base font-semibold tracking-tight text-foreground">
                        My Tasks
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Assigned to {user?.name}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {myTasks.length} task{myTasks.length === 1 ? '' : 's'}
                  </span>
                </div>

                {myTasks.length === 0 ? (
                  <EmptyState
                    title="No assigned tasks"
                    description="You currently have no tasks assigned to your profile."
                  />
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {myTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onView={(t) => setSelectedTask(t)}
                        onDelete={isAdmin ? (t) => setTaskToDelete(t) : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Analytics rail */}
            <div className="space-y-6">
              <StatusDistribution tasks={tasks} />
              <PriorityBreakdown tasks={tasks} />
            </div>
          </div>
        </>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onDelete={isAdmin ? (t) => {
          setSelectedTask(null)
          setTaskToDelete(t)
        } : undefined}
      />

      {/* Delete Task Confirmation Dialog */}
      <Dialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <span className="font-semibold text-foreground">{taskToDelete?.title}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTaskToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed}>
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default DashboardPage
