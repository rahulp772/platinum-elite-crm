"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, AuthResponse } from "@/types/user"
import { getCookie, setCookie, deleteCookie } from "./auth-cookies"
import { clearAllLocalStorage } from "./storage"

interface TenantInfo {
  tenantId: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (data: { email: string; password: string; tenantId?: string }) => Promise<{ tenants?: TenantInfo[] } | void>
  register: (data: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
  isAuthLoading: boolean
  updateProfile: (data: { name?: string; phone?: string; whatsapp?: string; officeAddress?: string; jobTitle?: string; isOnboardingComplete?: boolean }) => Promise<void>
}

const COOKIE_NAMES = {
  TOKEN: 'token',
  USER: 'user',
  TENANT_ID: 'tenantId',
} as const

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

// Parse user from cookie
function getUserFromCookie(): User | null {
  const userStr = getCookie(COOKIE_NAMES.USER)
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Check if user is logged in (check user cookie since token is httpOnly)
function isLoggedIn(): boolean {
  return !!getCookie(COOKIE_NAMES.USER)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  // Initialize auth state from cookies on mount
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isLoggedIn()) {
          const cookieUser = getUserFromCookie()
          if (cookieUser) {
            setUser(cookieUser)
          } else {
// Token exists but no user - fetch from server
              const response = await fetch('/api/v1/auth/me', {
                credentials: 'include',
              })
            if (response.ok) {
              const userData = await response.json()
              setUser(userData)
            } else {
              // Invalid token - clear cookies
              deleteCookie(COOKIE_NAMES.TOKEN)
              deleteCookie(COOKIE_NAMES.USER)
              deleteCookie(COOKIE_NAMES.TENANT_ID)
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (data: { email: string; password: string; tenantId?: string }) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || 'Login failed')
    }

    // Check if multi-tenant - return tenants for selection
    if (responseData.tenants && responseData.tenants.length > 0) {
      return { tenants: responseData.tenants }
    }

    // Single tenant - user is already set via cookie in API route
    const userData = getUserFromCookie()
    if (userData) {
      setUser(userData)
      // Redirect to onboarding if not complete
      if (!userData.isOnboardingComplete) {
        router.push('/onboarding')
        return
      }
    }

    router.push('/')
  }

  const register = async (data: { email: string; password: string }) => {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || 'Registration failed')
    }

    // Registration successful - user is set via cookie in API route
    const userData = getUserFromCookie()
    if (userData) {
      setUser(userData)
    }
  }

  const updateProfile = async (data: { name?: string; phone?: string; whatsapp?: string; officeAddress?: string; jobTitle?: string; isOnboardingComplete?: boolean }) => {
    const userData = getUserFromCookie()
    if (!userData) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`/api/v1/users/${userData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || 'Profile update failed')
    }

    // Update local user state
    const updatedUser = { ...userData, ...data }
    setUser(updatedUser)
  }

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      deleteCookie(COOKIE_NAMES.TOKEN)
      deleteCookie(COOKIE_NAMES.USER)
      deleteCookie(COOKIE_NAMES.TENANT_ID)
      
      clearAllLocalStorage()
      
      window.dispatchEvent(new CustomEvent('auth:logout'))
      
      setUser(null)
      router.refresh()
      router.push('/login')
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.isSuperAdmin) return true
    return user.permissions?.includes(permission) ?? false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        setUser,
        isAuthenticated: !!user,
        hasPermission,
        isAuthLoading: isLoading,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}