import axios from 'axios'
import { api } from '@/services/api'
import type { Task, TaskPriority, TaskStatus, TaskUser } from '@/types'

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === 'todo' || value === 'in_progress' || value === 'completed'
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === 'low' || value === 'medium' || value === 'high'
}

function toId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

function mapTask(value: unknown): Task | null {
  const data = asRecord(value)

  if (!data) {
    return null
  }

  const id = toId(data.id)
  const createdById = toId(data.created_by)
  const createdByName =
    typeof data.created_by_name === 'string' ? data.created_by_name : null

  if (
    id == null ||
    typeof data.title !== 'string' ||
    typeof data.description !== 'string' ||
    !isTaskStatus(data.status) ||
    !isTaskPriority(data.priority) ||
    createdById == null ||
    !createdByName ||
    typeof data.created_at !== 'string' ||
    typeof data.updated_at !== 'string'
  ) {
    return null
  }

  const assignedToId =
    data.assigned_to == null ? null : toId(data.assigned_to)

  const assignedToName =
    typeof data.assigned_to_name === 'string'
      ? data.assigned_to_name
      : null

  const assignedTo: TaskUser | null =
    assignedToId != null && assignedToName
      ? {
        id: assignedToId,
        name: assignedToName,
        email: '',
      }
      : null

  const createdBy: TaskUser = {
    id: createdById,
    name: createdByName,
    email: '',
  }

  const dueDate = data.due_date

  if (
    dueDate !== null &&
    dueDate !== undefined &&
    typeof dueDate !== 'string'
  ) {
    return null
  }

  return {
    id,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    assigned_to: assignedTo,
    created_by: createdBy,
    due_date: typeof dueDate === 'string' ? dueDate : null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

function extractTasks(payload: unknown): Task[] {
  const data = asRecord(payload)

  const rawTasks =
    data && Array.isArray(data.data) ? data.data : null

  if (!rawTasks) {
    throw new Error('Task list response was invalid')
  }

  return rawTasks
    .map((item) => mapTask(item))
    .filter((task): task is Task => task !== null)
}

export interface FetchTasksParams {
  search?: string
  status?: string
  priority?: string
}

export async function fetchTasks(
  signalOrParams?: AbortSignal | FetchTasksParams,
  maybeSignal?: AbortSignal,
): Promise<Task[]> {
  let params: FetchTasksParams | undefined
  let signal: AbortSignal | undefined

  if (signalOrParams instanceof AbortSignal) {
    signal = signalOrParams
  } else if (signalOrParams) {
    params = signalOrParams
    signal = maybeSignal
  }

  const response = await api.get<unknown>('/tasks', { signal, params })

  return extractTasks(response.data)
}

export async function searchTasks(
  query: string,
  signal?: AbortSignal,
): Promise<Task[]> {
  const response = await api.get<unknown>('/tasks', {
    params: { search: query },
    signal,
  })

  return extractTasks(response.data)
}

export function getTasksErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status

    if (status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    if (status === 403) {
      return 'You do not have permission to view these tasks.'
    }

    if (status === 404) {
      return 'Tasks could not be found.'
    }

    if (status && status >= 500) {
      return 'The server is unavailable. Please try again.'
    }

    if (!error.response) {
      return 'Unable to reach the server'
    }
  }

  return 'Unable to load tasks'
}

export interface CreateTaskPayload {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigned_to?: number | null
  due_date: string | null
}

export async function createTask(
  payload: CreateTaskPayload,
) {
  const response = await api.post('/tasks', payload)

  return response.data
}

export async function deleteTask(taskId: number) {
  const response = await api.delete(`/tasks/${taskId}`)

  return response.data
}

export async function fetchTaskById(
  taskId: number | string,
  signal?: AbortSignal,
): Promise<Task> {
  const response = await api.get<unknown>(`/tasks/${taskId}`, { signal })
  const data = asRecord(response.data)
  const rawTask = data ? data.data : null
  const task = mapTask(rawTask)
  if (!task) {
    throw new Error('Task not found or invalid format')
  }
  return task
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigned_to?: number | null
  due_date?: string | null
}

export async function updateTask(
  taskId: number | string,
  payload: UpdateTaskPayload,
) {
  const response = await api.patch(`/tasks/${taskId}`, payload)
  return response.data
}