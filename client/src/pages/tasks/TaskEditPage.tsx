import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TaskForm } from '@/components/common/TaskForm'
import { ErrorState } from '@/components/common/ErrorState'
import { TaskDetailSkeleton } from '@/components/common/skeletons'
import { fetchTaskById, updateTask, getTasksErrorMessage, type UpdateTaskPayload } from '@/services/tasks'
import type { Task } from '@/types'

export const TaskEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return

    let isMounted = true
    setIsLoading(true)
    setError(null)

    fetchTaskById(id)
      .then((data) => {
        if (isMounted) {
          setTask(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(getTasksErrorMessage(err))
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const handleUpdateTask = async (formData: Partial<Task>) => {
    if (!id) return

    try {
      setIsSubmitting(true)

      const payload: UpdateTaskPayload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigned_to: formData.assigned_to !== undefined
          ? (formData.assigned_to ? formData.assigned_to.id : null)
          : undefined,
        due_date: formData.due_date,
      }

      await updateTask(id, payload)
      navigate('/tasks')
    } catch (err) {
      console.error('Failed to update task:', err)
      setError(getTasksErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <TaskDetailSkeleton />
      </div>
    )
  }

  if (error && !task) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <ErrorState
          title="Unable to load task"
          message={error}
          onRetry={() => {
            if (id) {
              setIsLoading(true)
              setError(null)
              fetchTaskById(id)
                .then((data) => {
                  setTask(data)
                  setIsLoading(false)
                })
                .catch((err) => {
                  setError(getTasksErrorMessage(err))
                  setIsLoading(false)
                })
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-4">
      {task && (
        <TaskForm
          key={task.id}
          initialData={task}
          isEdit={true}
          onSubmit={handleUpdateTask}
          onCancel={() => navigate('/tasks')}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
export default TaskEditPage
