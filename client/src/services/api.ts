import axios from 'axios'
import type { User, Task } from '@/types'
import { clearStoredToken, getStoredToken, notifyUnauthorized } from '@/services/session'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || '')
    const isLoginRequest = requestUrl.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      clearStoredToken()
      notifyUnauthorized()
    }
    return Promise.reject(error)
  }
)

export const tasksApi = {
  getAll: (params?: { status?: string; priority?: string; assigned_to?: string; search?: string }) =>
    api.get('/tasks', { params }),
  getById: (id: number | string) => api.get(`/tasks/${id}`),
  create: (data: Partial<Task>) => api.post('/tasks', data),
  update: (id: number | string, data: Partial<Task>) => api.patch(`/tasks/${id}`, data),
  delete: (id: number | string) => api.delete(`/tasks/${id}`),
}

export const usersApi = {
  getAll: () => api.get<{ success: boolean; data: User[] }>('/users'),
  getById: (id: string) => api.get<{ success: boolean; data: User }>(`/users/${id}`),
}

export default api
