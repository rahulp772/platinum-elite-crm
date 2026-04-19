export type PropertyStatus = "available" | "pending" | "sold" | "off_market"
export type PropertyType = "apartment" | "house" | "condo" | "townhouse" | "commercial" | "land"

export interface Property {
    id: string
    title: string
    description: string
    price: number
    status: PropertyStatus
    type: PropertyType
    address: string
    city: string
    state: string
    zipCode: string
    bedrooms?: number
    bathrooms?: number
    sqft: number
    lotSize?: number
    yearBuilt?: number
    images: string[]
    features: string[]
    agent: string
    listed: Date
    views: number
    favorited: boolean
}
