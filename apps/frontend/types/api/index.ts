// Common API response types

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API Error response
export interface ApiError {
  message: string
  code?: string
  details?: Record<string, string[]>
}

// Auth types
export interface AuthResponse {
  access_token: string
  user: UserResponse
  tenants?: TenantInfo[]
  tenantId?: string
}

export interface UserResponse {
  id: string
  email: string
  name: string
  role: RoleResponse
  tenantId?: string
  isSuperAdmin?: boolean
  permissions?: string[]
}

export interface RoleResponse {
  id: string
  name: string
  level: number
  permissions: string[]
  isSystem?: boolean
}

export interface TenantInfo {
  tenantId: string
  name: string
}

// Lead types
export interface LeadResponse {
  id: string
  name: string
  email: string
  phone: string
  status: string
  source: string
  tier?: string
  score?: number
  budgetMin?: number
  budgetMax?: number
  preferredLocation?: string
  propertyType?: string
  bedroom?: number
  notes: string
  assignedTo?: UserResponse
  assignedToId?: string
  createdAt: string
  updatedAt?: string
  lastContact?: string
  followUpAt?: string
}

export interface CreateLeadRequest {
  name: string
  email: string
  phone: string
  status?: string
  source?: string
  budgetMin?: number
  budgetMax?: number
  preferredLocation?: string
  propertyType?: string
  notes?: string
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
  id: string
  status?: string
  followUpAt?: string | null
}

// Property types
export interface PropertyResponse {
  id: string
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  status: string
  type: string
  bedrooms?: number
  bathrooms?: number
  sqft: number
  yearBuilt?: number
  lotSize?: number
  description: string
  features: string[]
  images: string[]
  agent?: UserResponse
  views: number
  listed: string
  mlsId?: string
  rating?: number
}

export interface CreatePropertyRequest {
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  status?: string
  type: string
  bedrooms?: number
  bathrooms?: number
  sqft: number
  yearBuilt?: number
  lotSize?: number
  description: string
  features?: string[]
  images?: string[]
}

// Deal types
export interface DealResponse {
  id: string
  title: string
  value: number
  stage: string
  property?: PropertyResponse
  propertyId?: string
  lead?: LeadResponse
  leadId?: string
  assignedTo?: UserResponse
  assignedToId?: string
  createdAt: string
  closedAt?: string
}

// Task types
export interface TaskResponse {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  dueDate?: string
  relatedToId?: string
  relatedToType?: string
  assignedTo?: UserResponse
  assignedToId?: string
  createdBy?: UserResponse
  createdById?: string
  createdAt: string
  updatedAt?: string
}

// Analytics types
export interface DashboardStats {
  overview: {
    totalLeads: number
    totalProperties: number
    totalDeals: number
    totalRevenue: number
  }
  leadsByStatus: Record<string, number>
  dealsByStage: Record<string, number>
  recentActivity: ActivityResponse[]
}

export interface ActivityResponse {
  id: string
  type: string
  description: string
  userId: string
  user?: UserResponse
  timestamp: string
  metadata?: Record<string, any>
}

// User/Team types
export interface UsersResponse {
  id: string
  name: string
  email: string
  role: RoleResponse
  tenantId?: string
  status?: string
}

// Request options
export interface ApiRequestOptions {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

// Type guard functions
export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error
}

export function isPaginatedResponse<T>(response: unknown): response is PaginatedResponse<T> {
  return typeof response === 'object' && response !== null && 'data' in response && 'total' in response
}