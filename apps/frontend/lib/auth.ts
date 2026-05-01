import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTokenFromCookies, getUserFromCookies, getTenantIdFromCookies } from './auth-cookies-server'

export interface UserPayload {
  id: string
  email: string
  name: string
  role: {
    id: string
    name: string
    level: number
    permissions: string[]
  }
  tenantId?: string
  isSuperAdmin?: boolean
  permissions?: string[]
}

// Get current user from server-side
export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    // First try to get from headers (set by middleware)
    const headersList = await headers()
    const userId = headersList.get('x-user-id')

    if (userId) {
      const roleHeader = headersList.get('x-user-role')
      const tenantId = headersList.get('x-tenant-id')

      const role = roleHeader ? JSON.parse(roleHeader) : {}

      return {
        id: userId,
        email: '',
        name: '',
        role,
        tenantId: tenantId || undefined,
        isSuperAdmin: role?.isSuperAdmin,
        permissions: role?.permissions || [],
      }
    }

    // Fallback to cookies
    const user = await getUserFromCookies()
    return user
  } catch {
    return null
  }
}

// Get current user ID from server
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id ?? null
}

// Get current tenant ID from server
export async function getCurrentTenantId(): Promise<string | null> {
  // First try from headers
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')

  if (tenantId) {
    return tenantId
  }

  // Fallback to cookies
  return getTenantIdFromCookies()
}

// Check if user is authenticated on server
export async function requireAuth(): Promise<UserPayload> {
  const user = await getCurrentUser()

  if (!user) {
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/login`
      : '/login'
    redirect(loginUrl)
  }

  return user
}

// Check if user has specific permission
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) return false

  // Super admin has all permissions
  if (user.isSuperAdmin) return true

  // Check user's permissions
  return user.permissions?.includes(permission) ?? false
}

// Check if user has specific role level
export async function hasRoleLevel(minLevel: number): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) return false

  // Super admin (level 200) bypasses level checks
  if (user.isSuperAdmin || user.role?.level >= 200) return true

  return (user.role?.level ?? 0) >= minLevel
}

// Get auth headers for API calls
export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getTokenFromCookies()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const tenantId = await getCurrentTenantId()
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId
  }

  return headers
}

// Fetch with auth (server-side)
export async function authFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeaders = await getAuthHeaders()

  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      const loginUrl = process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/login?expired=true`
        : '/login?expired=true'
      redirect(loginUrl)
    }
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}