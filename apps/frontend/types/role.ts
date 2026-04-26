export interface Role {
    id: string
    name: string
    description?: string
    permissions?: string[]
    tenantId?: string
    isSystem?: boolean
    level?: number
}