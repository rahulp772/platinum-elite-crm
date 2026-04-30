import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 60 // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in ms

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/landing',
  '/landing-v2',
  '/landing-v3',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
]

// API routes that are public (no auth required)
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
}

function isPublicApiRoute(pathname: string): boolean {
  return publicApiRoutes.some(route => pathname.startsWith(route))
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.includes('.') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/app')
  )
}

// Rate limiting check
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

// Extract JWT token from cookie or header
function getToken(request: NextRequest): string | null {
  // Try to get from cookie first (preferred method)
  const token = request.cookies.get('token')?.value

  if (token) {
    return token
  }

  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

// Verify JWT token (simplified - in production use proper JWT verification)
function verifyToken(token: string): { valid: boolean; payload?: any } {
  try {
    // In production, use proper JWT library (jsonwebtoken or jose)
    // This is a simplified version for demonstration
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false }
    }

    // Decode payload (base64)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

    // Check expiration
    if (payload.exp && Date.now() > payload.exp * 1000) {
      return { valid: false }
    }

    return { valid: true, payload }
  } catch {
    return { valid: false }
  }
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss: ws:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // HSTS - only on HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets and non-page requests
  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  // Skip middleware for non-API and non-page routes
  if (!isApiRoute(pathname) && !pathname.startsWith('/') && pathname !== '/') {
    return NextResponse.next()
  }

  // Rate limiting for API routes
  if (isApiRoute(pathname) && !isPublicApiRoute(pathname)) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown'
    if (!checkRateLimit(ip)) {
      const response = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
      response.headers.set('Retry-After', '60')
      return addSecurityHeaders(response)
    }
  }

  // Allow public routes without authentication
  if (isPublicRoute(pathname) || isPublicApiRoute(pathname)) {
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }

  // Get token from request
  const token = getToken(request)

  // No token - redirect to login
  if (!token) {
    // For API routes, return 401
    if (isApiRoute(pathname)) {
      const response = NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      )
      return addSecurityHeaders(response)
    }

    // For page routes, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    return addSecurityHeaders(response)
  }

  // Verify token
  const tokenResult = verifyToken(token)

  if (!tokenResult.valid) {
    // Token expired or invalid - clear cookie and redirect
    if (isApiRoute(pathname)) {
      const response = NextResponse.json(
        { error: 'Token expired. Please login again.' },
        { status: 401 }
      )
      response.cookies.set('token', '', { maxAge: 0, path: '/' })
      return addSecurityHeaders(response)
    }

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('expired', 'true')
    const response = NextResponse.redirect(loginUrl)
    response.cookies.set('token', '', { maxAge: 0, path: '/' })
    return addSecurityHeaders(response)
  }

  // Token valid - add user info to headers for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', tokenResult.payload?.sub || tokenResult.payload?.userId || '')
  requestHeaders.set('x-user-role', JSON.stringify(tokenResult.payload?.role || {}))
  requestHeaders.set('x-tenant-id', tokenResult.payload?.tenantId || '')

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}