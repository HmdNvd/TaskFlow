import axios from 'axios'
import type { Role, User } from '@/types'
import { api } from '@/services/api'

export interface LoginResult {
  token: string
  user: User | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'member'
}

/**
 * Token extraction is isolated here so the rest of the app does not
 * depend on a specific login JSON shape. Adjust this if the backend
 * contract differs.
 *
 * Supported shapes include:
 * { token }
 * { access_token }
 * { data: { token, user } }
 */
function extractToken(payload: unknown): string {
  const data = asRecord(payload)
  if (!data) {
    throw new Error('Login response did not include a token')
  }

  const nested = asRecord(data.data)
  const token = data.token ?? data.access_token ?? nested?.token ?? nested?.access_token

  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('Login response did not include a token')
  }

  return token
}

function mapUser(candidate: Record<string, unknown>): User | null {
  if (
    candidate.id == null ||
    typeof candidate.email !== 'string' ||
    typeof candidate.name !== 'string' ||
    !isRole(candidate.role)
  ) {
    return null
  }

  return {
    id: String(candidate.id),
    name: candidate.name,
    email: candidate.email,
    role: candidate.role,
    avatar: typeof candidate.avatar === 'string' ? candidate.avatar : undefined,
    department: typeof candidate.department === 'string' ? candidate.department : undefined,
    created_at: typeof candidate.created_at === 'string' ? candidate.created_at : undefined,
  }
}

/**
 * Current-user extraction is isolated here. Adjust if GET /auth/me
 * or POST /auth/login wraps the user object.
 *
 * Supported shapes include:
 * { id, name, email, role }
 * { user: { ... } }
 * { data: { id, name, email, role } }
 * { data: { token, user: { ... } } }
 */
function tryExtractUser(payload: unknown): User | null {
  const data = asRecord(payload)
  if (!data) {
    return null
  }

  const nested = asRecord(data.data)
  const nestedUser = nested ? asRecord(nested.user) : null
  const topUser = asRecord(data.user)

  const candidates = [topUser, nestedUser, nested, data].filter(
    (value): value is Record<string, unknown> => value !== null
  )

  for (const candidate of candidates) {
    const user = mapUser(candidate)
    if (user) {
      return user
    }
  }

  return null
}

function extractUser(payload: unknown): User {
  const user = tryExtractUser(payload)
  if (!user) {
    throw new Error('Current user response was missing required fields')
  }
  return user
}

export async function loginRequest(email: string, password: string): Promise<LoginResult> {
  const response = await api.post<unknown>('/auth/login', { email, password })
  return {
    token: extractToken(response.data),
    user: tryExtractUser(response.data),
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get<unknown>('/auth/me')
  return extractUser(response.data)
}

export function getPostLoginRedirect(from?: { pathname?: string; search?: string; hash?: string } | null): string {
  const pathname = from?.pathname
  if (
    !pathname ||
    pathname === '/login' ||
    !pathname.startsWith('/') ||
    pathname.startsWith('//')
  ) {
    return '/dashboard'
  }

  return `${pathname}${from?.search ?? ''}${from?.hash ?? ''}`
}

function isSafePublicMessage(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 140) {
    return false
  }
  if (/[<>]/.test(trimmed) || /\n|\r/.test(trimmed)) {
    return false
  }
  if (/stack|exception|sql|token|jwt|password/i.test(trimmed) && trimmed.length > 60) {
    return false
  }
  return true
}

export function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data

    if (status === 401 || status === 403) {
      return 'Invalid email or password'
    }

    if (typeof data === 'string' && isSafePublicMessage(data)) {
      return data.trim()
    }

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>
      const message =
        (typeof record.message === 'string' && record.message) ||
        (typeof record.error === 'string' && record.error) ||
        ''
      if (isSafePublicMessage(message)) {
        return message.trim()
      }
    }

    if (!error.response) {
      return 'Unable to reach the server'
    }

    if (status && status >= 500) {
      return 'The server is unavailable. Please try again.'
    }
  }

  return 'Unable to sign in'
}
