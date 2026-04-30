// Client-side cookie helpers
// NOTE: This file is for client-side only. Use auth-cookies-server.ts for server-side.

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

export const defaultCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: false,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
}

export const tokenCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: false,
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24,
}

// Client-side cookie helpers (for reading only)
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

export function setCookie(name: string, value: string, options?: CookieOptions): void {
  if (typeof document === 'undefined') return

  const opts = { ...defaultCookieOptions, ...options }
  let cookieStr = `${name}=${encodeURIComponent(value)}`

  if (opts.path) cookieStr += `; path=${opts.path}`
  if (opts.maxAge) cookieStr += `; max-age=${opts.maxAge}`
  if (opts.sameSite) cookieStr += `; samesite=${opts.sameSite}`
  if (opts.secure) cookieStr += '; secure'

  document.cookie = cookieStr
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; max-age=0; path=/`
}

// Check if user is authenticated (client-side)
export function isAuthenticated(): boolean {
  return !!getCookie(COOKIE_NAMES.TOKEN)
}