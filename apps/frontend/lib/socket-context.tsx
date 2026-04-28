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

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const notifications = useNotifications()
  const router = useRouter()
  const [isConnected, setIsConnected] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

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
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!user) return

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [user])

  React.useEffect(() => {
    if (!user || globalSocket?.connected) return

    const getSocketUrl = () => {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    console.log('[Socket] Creating socket connection...')

    const socket = io(getSocketUrl(), {
      auth: { token: localStorage.getItem('token') },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
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
      console.log('[Socket] Connection error:', err.message)
    })

    socket.on('new_message', (message: any) => {
      console.log('[Socket] New message received:', message)

      const currentUserId = userRef.current?.id
      console.log('[Socket] Current user ID:', currentUserId)
      console.log('[Socket] Message sender ID:', message.senderId)

      const isOwnMessage = message.senderId === currentUserId
      if (isOwnMessage) {
        console.log('[Socket] Ignoring own message')
        return
      }

      const messageId = message.id
      if (toastIds.has(messageId)) {
        console.log('[Socket] Duplicate message ignored')
        return
      }
      toastIds.add(messageId)

      incrementUnreadRef.current()

      const senderName = message.sender?.name || 'Someone'
      const content = message.content || ''
      const truncated = content.length > 80 ? content.substring(0, 80) + '...' : content

      console.log('[Socket] Showing toast for:', senderName, '-', truncated)

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
      console.log('[Socket] Cleaning up socket')
      socket.disconnect()
      globalSocket = null
    }
  }, [user, mounted, router])

  return (
    <SocketContext.Provider value={{ socket: globalSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return React.useContext(SocketContext)
}