const TOKEN_STORAGE_KEY = 'taskflow_token'

type UnauthorizedListener = () => void

const unauthorizedListeners = new Set<UnauthorizedListener>()

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function subscribeUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

export function notifyUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => listener())
}
