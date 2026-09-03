export type Role = 'admin' | 'member'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  department?: string
  created_at?: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskUser {
  id: number
  name: string
  email: string
}

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigned_to: TaskUser | null
  created_by: TaskUser
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface TaskFilterState {
  search: string
  status: string
  priority: string
  assigned_to?: string
}
