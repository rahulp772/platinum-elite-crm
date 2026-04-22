"use client"

import * as React from "react"

interface NotificationContextType {
  unreadMessages: number
  incrementUnread: () => void
  decrementUnread: () => void
  clearUnread: () => void
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadMessages, setUnreadMessages] = React.useState(0)

  React.useEffect(() => {
    const stored = localStorage.getItem('unreadMessages')
    if (stored) {
      setUnreadMessages(parseInt(stored, 10))
    }
  }, [])

  const incrementUnread = () => {
    setUnreadMessages(prev => {
      const newCount = prev + 1
      localStorage.setItem('unreadMessages', String(newCount))
      return newCount
    })
  }

  const decrementUnread = () => {
    setUnreadMessages(prev => {
      const newCount = Math.max(0, prev - 1)
      localStorage.setItem('unreadMessages', String(newCount))
      return newCount
    })
  }

  const clearUnread = () => {
    setUnreadMessages(0)
    localStorage.setItem('unreadMessages', '0')
  }

  return (
    <NotificationContext.Provider value={{ unreadMessages, incrementUnread, decrementUnread, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}