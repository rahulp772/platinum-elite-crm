"use client"

import * as React from "react"
import { io, Socket } from "socket.io-client"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"
import { useNotifications } from "./notification-context"
import { toast } from "sonner"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = React.createContext<SocketContextType>({ socket: null, isConnected: false })

let globalSocket: Socket | null = null
let toastIds = new Set<string>()
let toastIdsTimeout: Map<string, NodeJS.Timeout> = new Map()

function getSocketUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:3001'
  
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL
  if (envUrl) {
    return envUrl
  }
  
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001'
  }
  
  return `${protocol}//${hostname}:3001`
}

function getTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'token') {
      try {
        return decodeURIComponent(value)
      } catch {
        return value
      }
    }
  }
  return null
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthLoading } = useAuth()
  const notifications = useNotifications()
  const router = useRouter()
  const [isConnected, setIsConnected] = React.useState(false)

  const userRef = React.useRef(user)
  const incrementUnreadRef = React.useRef(() => { })

  React.useEffect(() => {
    userRef.current = user
  }, [user])

  React.useEffect(() => {
    if (notifications) {
      incrementUnreadRef.current = notifications.incrementUnread
    }
  }, [notifications])

  React.useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!user) {
      if (globalSocket) {
        globalSocket.disconnect()
        globalSocket = null
        toastIds.clear()
        for (const timeout of toastIdsTimeout.values()) {
          clearTimeout(timeout)
        }
        toastIdsTimeout.clear()
        setIsConnected(false)
      }
      return
    }

    if (globalSocket?.connected) {
      return
    }

    const socketUrl = getSocketUrl()
    const token = getTokenFromCookies()
    console.log('[Socket] Connecting to:', socketUrl, token ? '(with token)' : '(no token)')

    const socket = io(socketUrl, {
      withCredentials: true,
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected!')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
      setIsConnected(false)
    })

    socket.on('new_message', (message: any) => {
      const currentUserId = userRef.current?.id
      const isOwnMessage = message.senderId === currentUserId
      if (isOwnMessage) {
        return
      }

      const messageId = message.id
      if (toastIds.has(messageId)) {
        return
      }
      toastIds.add(messageId)

      incrementUnreadRef.current()

      const senderName = message.sender?.name || 'Someone'
      const content = message.content || ''
      const truncated = content.length > 80 ? content.substring(0, 80) + '...' : content

      toast(senderName, {
        description: truncated,
        duration: 10000,
        action: {
          label: 'View',
          onClick: () => router.push('/messages'),
        },
      })

      if (toastIdsTimeout.has(messageId)) {
        clearTimeout(toastIdsTimeout.get(messageId))
      }
      toastIdsTimeout.set(messageId, setTimeout(() => {
        toastIds.delete(messageId)
        toastIdsTimeout.delete(messageId)
      }, 15000))
    })

    globalSocket = socket

    return () => {
      socket.disconnect()
      if (globalSocket === socket) {
        globalSocket = null
      }
    }
  }, [user, isAuthLoading, router])

  return (
    <SocketContext.Provider value={{ socket: globalSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return React.useContext(SocketContext)
}