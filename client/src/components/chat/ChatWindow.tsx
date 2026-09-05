import React, { useEffect, useRef, useState } from 'react'
import { Loader2, Send, Trash2, X as XIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { getSocket, disconnectSocket } from '@/services/socket'

/**
 * Shape of a chat message exactly as emitted by the existing backend
 * (server/sockets/chatSocket.js: `chat:history` / `message:receive`).
 * Field names are kept verbatim — nothing is renamed or transformed.
 */
interface ChatMessage {
  id: number
  sender_id: number
  receiver_id: number
  encrypted_content: string
  iv: string
  is_deleted_for_everyone: number
  created_at: string
}

/**
 * The backend's `message:send` payload requires a non-empty `iv` field
 * (it is stored as-is, never decrypted server-side). This project has no
 * frontend encryption/key-management system, and the task does not call
 * for adding one, so `encryptedContent` carries plain text and `iv` is a
 * static placeholder purely to satisfy the existing payload contract.
 */
const PLACEHOLDER_IV = 'none'

interface ChatWindowProps {
  open: boolean
  onClose: () => void
  targetUserId: number
  targetUserName: string
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  open,
  onClose,
  targetUserId,
  targetUserName,
}) => {
  const { user, isAdmin } = useAuth()
  const currentUserId = user ? Number(user.id) : null

  const [status, setStatus] = useState<'connecting' | 'ready' | 'error'>('connecting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [otherTyping, setOtherTyping] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  // Connect + subscribe to the existing backend chat events while the
  // window is open. Disconnects when closed to keep the footprint minimal.
  useEffect(() => {
    if (!open || currentUserId == null) return

    const socket = getSocket()
    if (!socket) {
      setStatus('error')
      setErrorMessage('You must be signed in to chat.')
      return
    }

    setStatus('connecting')
    setErrorMessage(null)
    setMessages([])
    setOtherTyping(false)

    const belongsToThisChat = (a: number, b: number) =>
      (a === currentUserId && b === targetUserId) ||
      (a === targetUserId && b === currentUserId)

    const handleConnect = () => {
      socket.emit('chat:join', { targetUserId })
    }

    const handleHistory = (payload: { roomId: string; messages: ChatMessage[] }) => {
      setMessages(payload.messages)
      setStatus('ready')
    }

    const handleReceive = (message: ChatMessage) => {
      if (!belongsToThisChat(message.sender_id, message.receiver_id)) return
      setMessages((prev) => [...prev, message])
    }

    const handleDeletedEveryone = ({ messageId }: { messageId: number }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, is_deleted_for_everyone: 1, encrypted_content: '[This message was deleted]' }
            : m
        )
      )
    }

    const handleDeletedMe = ({ messageId }: { messageId: number }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    }

    const handleTypingStart = ({ userId }: { userId: number }) => {
      if (userId === targetUserId) setOtherTyping(true)
    }

    const handleTypingStop = ({ userId }: { userId: number }) => {
      if (userId === targetUserId) setOtherTyping(false)
    }

    const handleSocketError = ({ message }: { message: string }) => {
      setErrorMessage(message)
    }

    const handleConnectError = (err: Error) => {
      setStatus('error')
      setErrorMessage(err.message || 'Unable to connect to chat.')
    }

    socket.on('connect', handleConnect)
    socket.on('chat:history', handleHistory)
    socket.on('message:receive', handleReceive)
    socket.on('message:deleted_everyone', handleDeletedEveryone)
    socket.on('message:deleted_me', handleDeletedMe)
    socket.on('typing:start', handleTypingStart)
    socket.on('typing:stop', handleTypingStop)
    socket.on('error', handleSocketError)
    socket.on('connect_error', handleConnectError)

    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('chat:history', handleHistory)
      socket.off('message:receive', handleReceive)
      socket.off('message:deleted_everyone', handleDeletedEveryone)
      socket.off('message:deleted_me', handleDeletedMe)
      socket.off('typing:start', handleTypingStart)
      socket.off('typing:stop', handleTypingStop)
      socket.off('error', handleSocketError)
      socket.off('connect_error', handleConnectError)

      if (isTypingRef.current) {
        socket.emit('typing:stop', { targetUserId })
        isTypingRef.current = false
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

      disconnectSocket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, targetUserId, currentUserId])

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, otherTyping])

  const emitTypingStart = () => {
    const socket = getSocket()
    if (!socket) return

    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing:start', { targetUserId })
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      socket.emit('typing:stop', { targetUserId })
    }, 1500)
  }

  const handleSend = () => {
    const content = draft.trim()
    if (!content) return

    const socket = getSocket()
    if (!socket) return

    socket.emit('message:send', {
      receiverId: targetUserId,
      encryptedContent: content,
      iv: PLACEHOLDER_IV,
    })

    setDraft('')

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      socket.emit('typing:stop', { targetUserId })
    }
  }

  const handleDeleteForMe = (messageId: number) => {
    const socket = getSocket()
    socket?.emit('message:delete_me', { messageId })
  }

  const handleDeleteForEveryone = (messageId: number) => {
    const socket = getSocket()
    socket?.emit('message:delete_everyone', { messageId, targetUserId })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 flex flex-col h-[560px]">
        <DialogHeader className="px-4 py-3 border-b border-border/60 space-y-0.5">
          <DialogTitle className="text-sm font-semibold">{targetUserName}</DialogTitle>
          <DialogDescription className="text-xs">
            {status === 'connecting'
              ? 'Connecting...'
              : otherTyping
                ? 'Typing...'
                : 'Realtime chat'}
          </DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-muted/10">
          {status === 'connecting' && (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading conversation...
            </div>
          )}

          {status === 'error' && (
            <div className="flex h-full items-center justify-center text-center text-xs text-destructive px-6">
              {errorMessage || 'Something went wrong. Please try again.'}
            </div>
          )}

          {status === 'ready' && messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No messages yet. Say hello!
            </div>
          )}

          {status === 'ready' &&
            messages.map((message) => {
              const isMine = message.sender_id === currentUserId
              const isDeleted = message.is_deleted_for_everyone === 1
              const canDeleteEveryone = !isDeleted && (isMine || isAdmin)

              return (
                <div
                  key={message.id}
                  className={cn('flex flex-col group', isMine ? 'items-end' : 'items-start')}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3 py-2 text-sm break-words',
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card border border-border/60 text-foreground rounded-bl-sm',
                      isDeleted && 'italic opacity-60'
                    )}
                  >
                    {message.encrypted_content}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 px-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {!isDeleted && (
                      <div className="hidden group-hover:flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteForMe(message.id)}
                          title="Delete for me"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                        {canDeleteEveryone && (
                          <button
                            type="button"
                            onClick={() => handleDeleteForEveryone(message.id)}
                            title="Delete for everyone"
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>

        {status === 'ready' && errorMessage && (
          <div className="px-4 py-1.5 text-[11px] text-destructive bg-destructive/10 border-t border-border/60">
            {errorMessage}
          </div>
        )}

        <div className="border-t border-border/60 p-3 flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              emitTypingStart()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a message..."
            disabled={status !== 'ready'}
            className="h-9 text-sm"
          />
          <Button
            type="button"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={status !== 'ready' || !draft.trim()}
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ChatWindow
