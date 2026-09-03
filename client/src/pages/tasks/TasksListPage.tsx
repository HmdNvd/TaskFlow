import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  FolderOpen,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskCard } from '@/components/common/TaskCard'
import { TaskTable } from '@/components/common/TaskTable'
import { TaskDetailModal } from '@/components/common/TaskDetailModal'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { TaskListSkeleton } from '@/components/common/skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchTasks,
  getTasksErrorMessage,
  deleteTask,
} from '@/services/tasks'
import type { Task } from '@/types'

export const TasksListPage: React.FC = () => {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  // Ready for API: set isLoading/error from fetch instead of mock data.
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await fetchTasks()
        setTasks(data)
      } catch (err) {
        setError(getTasksErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  // Real filtering logic matching allowed status/priority values
  const filteredTasks = tasks.filter((task) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      task.id.toString().toLowerCase().includes(q) ||
      (task.assigned_to && task.assigned_to.name.toLowerCase().includes(q))

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  const handleDeleteConfirmed = async () => {
    if (!taskToDelete) {
      return
    }

    try {
      await deleteTask(taskToDelete.id)

      setTasks((prev) =>
        prev.filter((task) => task.id !== taskToDelete.id),
      )

      setTaskToDelete(null)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }
  const hasActiveFilters =
    searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              Tasks
            </h1>
            {isLoading ? (
              <Skeleton className="h-5 w-16 rounded-full" />
            ) : (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {filteredTasks.length} Total
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, assign, and track engineering tasks and workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="gap-2 shadow-sm rounded-xl font-semibold">
            <Link to="/tasks/create">
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Task Controls: Search, Filters & View Toggle */}
      <Card className="border-border/70 shadow-2xs rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="Search tasks by title, description, ID, or assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl"
              />
            </div>

            {/* Select Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring text-foreground shadow-2xs"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring text-foreground shadow-2xs"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-10 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  title="Reset filters"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}

              <div className="h-6 w-px bg-border/80 mx-1 hidden sm:block" />

              {/* View Mode Toggle: Grid Cards vs Table */}
              <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg p-1.5 transition-colors ${viewMode === 'grid'
                    ? 'bg-card text-primary shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`rounded-lg p-1.5 transition-colors ${viewMode === 'table'
                    ? 'bg-card text-primary shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="Table List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List / Table Rendering */}
      {isLoading ? (
        <TaskListSkeleton viewMode={viewMode} />
      ) : error ? (
        <ErrorState title="Unable to load tasks" message={error} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No tasks match your criteria"
          description={
            hasActiveFilters
              ? 'Try modifying your search query or reset your filters.'
              : 'There are currently no tasks in the system.'
          }
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Create First Task'}
          onAction={hasActiveFilters ? resetFilters : () => navigate('/tasks/create')}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={(t) => setSelectedTask(t)}
              onDelete={(t) => setTaskToDelete(t)}
            />
          ))}
        </div>
      ) : (
        <TaskTable
          tasks={filteredTasks}
          onView={(t) => setSelectedTask(t)}
          onDelete={(t) => setTaskToDelete(t)}
        />
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
            <Button
              variant="destructive"
              onClick={handleDeleteConfirmed}
            >
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default TasksListPage
