import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Cookie configuration
export const COOKIE_NAMES = {
  TOKEN: 'token',
  USER: 'user',
  TENANT_ID: 'tenantId',
} as const

export interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  path?: string
  maxAge?: number
}

// Default cookie options for production
export const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

// Token cookie options (shorter lifespan for security)
export const tokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 * 24, // 1 day
}

// Server-side cookie helpers (only for Server Components and API Routes)
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAMES.TOKEN)?.value ?? null
}

export async function getUserFromCookies(): Promise<any | null> {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get(COOKIE_NAMES.USER)?.value
  if (!userCookie) return null

  try {
    return JSON.parse(userCookie)
  } catch {
    return null
  }
}

export async function getTenantIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAMES.TENANT_ID)?.value ?? null
}

export async function setAuthCookies(
  token: string,
  user: any,
  tenantId?: string
): Promise<void> {
  const cookieStore = await cookies()

  // Set token cookie
  cookieStore.set(COOKIE_NAMES.TOKEN, token, tokenCookieOptions)

  // Set user cookie (non-httpOnly so client can read)
  cookieStore.set(
    COOKIE_NAMES.USER,
    JSON.stringify(user),
    {
      ...defaultCookieOptions,
      httpOnly: false, // Allow client to read user info
    }
  )

  // Set tenant ID if provided
  if (tenantId) {
    cookieStore.set(COOKIE_NAMES.TENANT_ID, tenantId, defaultCookieOptions)
  }
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAMES.TOKEN, '', { maxAge: 0, path: '/' })
  cookieStore.set(COOKIE_NAMES.USER, '', { maxAge: 0, path: '/' })
  cookieStore.set(COOKIE_NAMES.TENANT_ID, '', { maxAge: 0, path: '/' })
}