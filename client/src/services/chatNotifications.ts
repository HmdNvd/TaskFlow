import { useSyncExternalStore } from 'react'
import { getSocket } from '@/services/socket'

export interface UnreadConversation {
  userId: number
  count: number
}

interface ChatMessageNotification {
  id: number
  sender_id: number
  receiver_id: number
}

interface UnreadSnapshot {
  userId: number
  count: number
}

let unreadByUser = new Map<number, number>()
let snapshot: UnreadConversation[] = []
const listeners = new Set<() => void>()
const activeConversations = new Set<number>()
const seenMessageIds = new Set<number>()
let socketListenerAttached = false

const emitChange = () => {
  snapshot = Array.from(unreadByUser, ([userId, count]) => ({ userId, count }))
  listeners.forEach((listener) => listener())
}

const getSnapshot = () => snapshot

export const subscribeChatNotifications = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useChatNotifications = () =>
  useSyncExternalStore(subscribeChatNotifications, getSnapshot, getSnapshot)

export const getUnreadMessageCount = () =>
  Array.from(unreadByUser.values()).reduce((total, count) => total + count, 0)

export const startChatNotifications = (currentUserId: number): (() => void) => {
  const socket = getSocket()
  if (!socket || socketListenerAttached) return () => undefined

  const handleReceive = (message: ChatMessageNotification) => {
    if (seenMessageIds.has(message.id)) return
    seenMessageIds.add(message.id)
    if (seenMessageIds.size > 500) {
      const oldest = seenMessageIds.values().next().value
      if (typeof oldest === 'number') seenMessageIds.delete(oldest)
    }

    if (message.receiver_id !== currentUserId || message.sender_id === currentUserId) {
      return
    }

    if (activeConversations.has(message.sender_id)) return

    unreadByUser = new Map(unreadByUser).set(
      message.sender_id,
      (unreadByUser.get(message.sender_id) || 0) + 1,
    )
    emitChange()
  }

  const handleUnread = (unread: UnreadSnapshot[]) => {
    unreadByUser = new Map(
      unread
        .filter((item) => item.count > 0)
        .map((item) => [item.userId, item.count]),
    )
    emitChange()
  }

  socket.on('message:receive', handleReceive)
  socket.on('chat:unread', handleUnread)
  socketListenerAttached = true

  return () => {
    socket.off('message:receive', handleReceive)
    socket.off('chat:unread', handleUnread)
    socketListenerAttached = false
  }
}

export const markConversationRead = (userId: number) => {
  if (!unreadByUser.has(userId)) return

  const next = new Map(unreadByUser)
  next.delete(userId)
  unreadByUser = next
  emitChange()
}

export const setConversationOpen = (userId: number, open: boolean) => {
  if (open) {
    activeConversations.add(userId)
    markConversationRead(userId)
  } else {
    activeConversations.delete(userId)
  }
}

export const resetChatNotifications = () => {
  unreadByUser = new Map()
  activeConversations.clear()
  seenMessageIds.clear()
  emitChange()
}
