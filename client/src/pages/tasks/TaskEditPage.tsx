import React, { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TaskForm } from '@/components/common/TaskForm'
import { INITIAL_MOCK_TASKS, MOCK_CURRENT_USER, MOCK_ADMIN_USER } from '@/data/mockData'
import type { Task } from '@/types'

export const TaskEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Retrieve initial task data from mock data
  const existingTask = useMemo<Task>(() => {
    const found = INITIAL_MOCK_TASKS.find((t) => String(t.id) === id)
    if (found) return found

    // Fallback if custom ID is entered in URL
    return {
      id: Number(id) || 1,
      title: 'Design landing page layout and assets',
      description: 'Create responsive high-fidelity UI mockups, collect wireframes, and design navigation elements for the core portal.',
      status: 'in_progress',
      priority: 'high',
      assigned_to: {
        id: Number(String(MOCK_CURRENT_USER.id).replace(/\D/g, '')) || 2,
        name: MOCK_CURRENT_USER.name,
        email: MOCK_CURRENT_USER.email,
      },
      created_by: {
        id: Number(String(MOCK_ADMIN_USER.id).replace(/\D/g, '')) || 1,
        name: MOCK_ADMIN_USER.name,
        email: MOCK_ADMIN_USER.email,
      },
      due_date: '2026-03-15',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }, [id])

  const handleUpdateTask = (_formData: Partial<Task>) => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate('/tasks')
    }, 600)
  }

  return (
    <div className="max-w-3xl mx-auto py-4">
      <TaskForm
        initialData={existingTask}
        isEdit={true}
        onSubmit={handleUpdateTask}
        onCancel={() => navigate('/tasks')}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
export default TaskEditPage
