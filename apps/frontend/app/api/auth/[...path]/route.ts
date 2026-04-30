import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies, getTenantIdFromCookies } from '@/lib/auth-cookies-server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Auth API route proxy
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const pathParams = await params
  const path = pathParams.path.join('/')
  const searchParams = request.nextUrl.search.toString()
  const url = `${API_BASE_URL}/auth/${path}${searchParams ? `?${searchParams}` : ''}`

  const token = await getTokenFromCookies()
  const tenantId = await getTenantIdFromCookies()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const data = await response.json()

    // If login successful, set cookie
    if (path === 'login' && response.ok && data.access_token) {
      const response = NextResponse.json(data)
      
      // Set HTTP-only cookie
      response.cookies.set('token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      })

      // Set user cookie (accessible to client)
      response.cookies.set('user', JSON.stringify(data.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      if (data.tenantId) {
        response.cookies.set('tenantId', data.tenantId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
      }

      return response
    }

    // Logout - clear cookies
    if (path === 'logout' && response.ok) {
      const response = NextResponse.json(data)
      response.cookies.set('token', '', { maxAge: 0, path: '/' })
      response.cookies.set('user', '', { maxAge: 0, path: '/' })
      response.cookies.set('tenantId', '', { maxAge: 0, path: '/' })
      return response
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Auth API proxy error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const pathParams = await params
  const path = pathParams.path.join('/')
  const url = `${API_BASE_URL}/auth/${path}`

  const token = await getTokenFromCookies()
  const tenantId = await getTenantIdFromCookies()
  const body = await request.json()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()

    // Handle tenant selection after login
    if (path === 'login' && response.ok && data.access_token) {
      const response = NextResponse.json(data)
      
      response.cookies.set('token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24,
      })

      response.cookies.set('user', JSON.stringify(data.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      if (data.tenantId) {
        response.cookies.set('tenantId', data.tenantId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
      }

      return response
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Auth API proxy error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle other methods
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return POST(request, { params })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return GET(request, { params })
}