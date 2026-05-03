import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCookies, getTenantIdFromCookies } from '@/lib/auth-cookies-server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Generic API route proxy for all backend endpoints
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const pathParams = await params
  const path = pathParams.path.join('/')
  const searchParams = request.nextUrl.search
  // Properly handle query string - remove leading ? if present
  const queryString = searchParams.toString().replace(/^\?/, '')
  const url = queryString 
    ? `${API_BASE_URL}/${path}?${queryString}` 
    : `${API_BASE_URL}/${path}`

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

  // Add custom headers from request
  const requestHeaders = request.headers
  if (requestHeaders.get('x-user-id')) {
    headers['x-user-id'] = requestHeaders.get('x-user-id')!
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    const data = await response.json()

    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Cache-Control': 'no-store',
      }
    })
  } catch (error) {
    console.error(`API proxy GET /${path} error:`, error)
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
  const url = `${API_BASE_URL}/${path}`

  const token = await getTokenFromCookies()
  const tenantId = await getTenantIdFromCookies()
  
  const contentType = request.headers.get('content-type') || ''
  const isMultipart = contentType.includes('multipart/form-data')
  
  let body: any
  if (isMultipart) {
    body = await request.formData().catch(() => null)
  } else {
    body = await request.json().catch(() => ({}))
  }

  const headers: HeadersInit = {}
  
  // Only set application/json if it's not a multipart request
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json'
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
      body: isMultipart ? body : JSON.stringify(body),
      credentials: 'include',
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`API proxy POST /${path} error:`, error)
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
  const pathParams = await params
  const path = pathParams.path.join('/')
  const url = `${API_BASE_URL}/${path}`

  const token = await getTokenFromCookies()
  const tenantId = await getTenantIdFromCookies()
  
  const contentType = request.headers.get('content-type') || ''
  const isMultipart = contentType.includes('multipart/form-data')
  
  let body: any
  if (isMultipart) {
    body = await request.formData().catch(() => null)
  } else {
    body = await request.json().catch(() => ({}))
  }

  const headers: HeadersInit = {}

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId
  }

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: isMultipart ? body : JSON.stringify(body),
      credentials: 'include',
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`API proxy PATCH /${path} error:`, error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const pathParams = await params
  const path = pathParams.path.join('/')
  const url = `${API_BASE_URL}/${path}`

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
      method: 'DELETE',
      headers,
      credentials: 'include',
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`API proxy DELETE /${path} error:`, error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}