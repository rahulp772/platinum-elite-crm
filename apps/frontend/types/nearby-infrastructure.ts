export type InfrastructureCategory = 'school' | 'hospital' | 'transit' | 'restaurant' | 'resort' | 'shopping' | 'other'

export interface NearbyInfrastructure {
    id: string
    category: InfrastructureCategory
    name: string
    distance?: string
    propertyId: string
    tenantId: string
    createdAt: string
    updatedAt: string
}