import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies, getTenantIdFromCookies } from '@/lib/auth-cookies-server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Forward auth requests to main auth handler
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
      credentials: 'include',
    })

    const data = await response.json()

    // Handle special auth endpoints
    if (path === 'me' && response.ok) {
      return NextResponse.json(data)
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`API proxy GET /auth/${path} error:`, error)
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
  const body = await request.json().catch(() => ({}))

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
      credentials: 'include',
    })

    const data = await response.json()

    // Handle login or register - set cookies
    if ((path === 'login' || path === 'register') && response.ok && data.access_token) {
      const nextResponse = NextResponse.json(data)
      
      nextResponse.cookies.set('token', data.access_token, {
        httpOnly: false, // Must be false so socket.io client can read it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24,
      })

      nextResponse.cookies.set('user', JSON.stringify(data.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      if (data.tenantId) {
        nextResponse.cookies.set('tenantId', data.tenantId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
      }

      return nextResponse
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`API proxy POST /auth/${path} error:`, error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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