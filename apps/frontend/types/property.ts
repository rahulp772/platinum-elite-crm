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
    mlsId?: string
    rating?: number
    agent: {
        id: string
        name: string
        phone?: string
        whatsapp?: string
        officeAddress?: string
    }
    // RERA & India Specific Fields
    builder?: {
        id: string
        name: string
        logo?: string
    }
    builderId?: string
    reraNumber?: string
    reraAuthority?: string
    reraWebsite?: string
    landParcel?: string
    surveyNumber?: string
    carpetArea?: number
    builtUpArea?: number
    superBuiltUpArea?: number
    basePrice?: number
    pricePerSqft?: number
    bookingAmount?: number
    paymentPlan?: string
    plc?: number
    gst?: number
    parking?: number
    launchDate?: string
    possessionDate?: string
    constructionStatus?: string
    ccUrl?: string
    ocUrl?: string
    // End RERA Fields
    listed: Date
    views: number
    favorited?: boolean
}

