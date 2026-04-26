"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, AuthResponse } from "@/types/user"
import { api } from "./api"

interface TenantInfo {
  tenantId: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (data: any) => Promise<{ tenants?: TenantInfo[] } | void>
  register: (data: any) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (data: any) => {
    const response = await api.post("/auth/login", data)
    const responseData = response.data

    if (responseData.tenants && responseData.tenants.length > 0) {
      return { tenants: responseData.tenants }
    }

    const { access_token, user: userData } = responseData

    localStorage.setItem("token", access_token)
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)

    router.push("/")
  }

  const register = async (data: any) => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data)
      const { access_token, user: userData } = response.data

      localStorage.setItem("token", access_token)
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      router.push("/")
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
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
