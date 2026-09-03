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
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/common/StatCard'
import { TaskCard } from '@/components/common/TaskCard'
import { TaskDetailModal } from '@/components/common/TaskDetailModal'
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
  const { user } = useAuth()
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>. Here is an overview of all active tasks and deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="gap-2 rounded-xl shadow-sm font-semibold">
            <Link to="/tasks/create">
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </Link>
          </Button>
        </div>
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
              variant="blue"
            />

            <StatCard
              title="To Do"
              value={todoCount}
              subtitle="Pending start"
              icon={Clock}
              variant="amber"
            />

            <StatCard
              title="In Progress"
              value={inProgressCount}
              subtitle="Currently active"
              icon={Briefcase}
              variant="purple"
            />

            <StatCard
              title="Completed"
              value={completedCount}
              subtitle="Resolved & finished"
              icon={CheckCircle2}
              variant="emerald"
            />
          </div>

          {/* 3. Recent Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground font-sans">
                  Recent Tasks
                </h2>
                <p className="text-xs text-muted-foreground">
                  Overview of recently created and updated tasks
                </p>
              </div>

              <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs rounded-xl">
                <Link to="/tasks">
                  <span>View All Tasks</span>
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
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {recentTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onView={(t) => setSelectedTask(t)}
                    onDelete={(t) => setTaskToDelete(t)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 4. My Tasks Section (Assigned to logged-in user) */}
          <div id="my-tasks" className="space-y-4 pt-4 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    My Tasks
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Tasks assigned to you ({user?.name})
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-muted-foreground">
                {myTasks.length} task{myTasks.length === 1 ? '' : 's'}
              </span>
            </div>

            {myTasks.length === 0 ? (
              <EmptyState
                title="No assigned tasks"
                description="You currently have no tasks assigned to your profile."
              />
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {myTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onView={(t) => setSelectedTask(t)}
                    onDelete={(t) => setTaskToDelete(t)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onDelete={(t) => {
          setSelectedTask(null)
          setTaskToDelete(t)
        }}
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
