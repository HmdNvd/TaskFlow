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
        assigned_to: formData.assigned_to?.id ?? null,
        due_date: formData.due_date ?? null,
      })

      navigate('/tasks')
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-4">
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
