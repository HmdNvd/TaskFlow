import { io, type Socket } from 'socket.io-client'
import { getStoredToken } from '@/services/session'

/**
 * Minimal Socket.IO client wrapper for the existing backend chat namespace
 * (server/sockets/chatSocket.js). Reuses the same JWT the REST API already
 * stores via services/session.ts — no new auth mechanism is introduced.
 *
 * The backend's `io.use(...)` auth middleware reads
 * `socket.handshake.auth.token` (or the `Authorization` header) and accepts
 * either a raw token or a `Bearer <token>` string, so the raw stored token
 * is passed as-is.
 */

let socket: Socket | null = null

/**
 * Derives the Socket.IO server origin.
 *
 * `VITE_API_URL` (used by services/api.ts) is an axios baseURL and may be a
 * relative path (default `/api`) or an absolute URL such as
 * `http://localhost:5000/api`. Socket.IO needs a bare origin, so when
 * VITE_API_URL is absolute we strip the trailing `/api` path; otherwise we
 * fall back to the page's own origin (same-origin dev proxy / same-host
 * deployment).
 */
function getSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL

  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    return apiUrl.replace(/\/api\/?$/, '')
  }

  return window.location.origin
}

/**
 * Returns a connected Socket.IO client for the current session, creating one
 * if necessary. Returns null if there is no stored auth token (mirrors the
 * backend, which rejects connections without a token).
 */
export function getSocket(): Socket | null {
  const token = getStoredToken()
  if (!token) return null

  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
      auth: { token },
      transports: ['websocket', 'polling'],
    })
  } else {
    socket.auth = { token }
  }

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

/** Disconnects and discards the current socket, if any. */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
