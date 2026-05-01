import axios from 'axios'

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const protocol = window.location.protocol

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001'
    }

    return `${protocol}//${hostname}:3001`
  }

  return 'http://localhost:3001'
}

const API_URL = getApiUrl()

// Create axios instance for client-side API calls
// Uses relative URLs which will hit Next.js API routes (proxy to backend)
export const api = axios.create({
  baseURL: '/api/v1', // Proxy through Next.js API routes
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  paramsSerializer: (params) => {
    // Properly serialize params to query string
    return new URLSearchParams(params).toString()
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling response transformation
api.interceptors.response.use(
  (response) => {
    // Unwrap { data, success } format from backend
    if (response.data && typeof response.data === 'object') {
      // Check if it's wrapped format (has success field)
      if ('success' in response.data && 'data' in response.data) {
        // If response has metadata, it's paginated - keep data as array
        if ('metadata' in response.data) {
          return {
            ...response,
            data: response.data.data,
            metadata: response.data.metadata,
          }
        }
        // Single object response - unwrap the data
        return {
          ...response,
          data: response.data.data,
        }
      }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (currentPath !== '/login' && currentPath !== '/register') {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
          window.location.href = `${appUrl}/login?expired=true`
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api