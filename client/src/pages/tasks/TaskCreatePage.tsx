import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TaskForm } from '@/components/common/TaskForm'
import { createTask } from '@/services/tasks'
import type { Task } from '@/types'

export const TaskCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateTask = async (formData: Partial<Task>) => {
    try {
      setIsSubmitting(true)

      await createTask({
        title: formData.title || '',
        description: formData.description || '',
        status: formData.status || 'todo',
        priority: formData.priority || 'medium',
        due_date: formData.due_date ?? null,
        ...(formData.assigned_to !== undefined
          ? { assigned_to: formData.assigned_to ? formData.assigned_to.id : null }
          : {}),
      })

      navigate('/tasks')
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-1 pb-10">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">New Task</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Fill in the details below to add a task to TaskFlow.
        </p>
      </div>
      <TaskForm
        isEdit={false}
        onSubmit={handleCreateTask}
        onCancel={() => navigate('/tasks')}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
export default TaskCreatePage
