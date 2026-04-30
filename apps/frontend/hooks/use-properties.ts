import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Property } from "@/types/property"

export interface PropertiesFilters {
    page?: number
    limit?: number
    search?: string
    status?: string
    type?: string
    sortBy?: string
}

interface PaginatedResponse<T> {
    data: T[]
    metadata: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export function useProperties(filters?: PropertiesFilters) {
    return useQuery({
        queryKey: ["properties", filters],
        queryFn: async () => {
            const params = Object.fromEntries(
                Object.entries(filters || {}).filter(([, v]) => v !== undefined && v !== "")
            )
            const { data } = await api.get<PaginatedResponse<Property>>("/properties", {
                params,
            })
            return data
        },
    })
}

export function useProperty(id: string) {
    return useQuery({
        queryKey: ["properties", id],
        queryFn: async () => {
            const { data } = await api.get<Property>(`/properties/${id}`)
            return data
        },
        enabled: !!id,
    })
}

export function useRelatedProperties(id: string) {
    return useQuery({
        queryKey: ["properties", id, "related"],
        queryFn: async () => {
            const { data } = await api.get<Property[]>(`/properties/${id}/related`)
            return data
        },
        enabled: !!id,
    })
}

export function useCreateProperty() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (property: Partial<Property>) => {
            const { data } = await api.post<Property>("/properties", property)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["properties"] })
        },
    })
}

export function useToggleFavorite() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.post<{ favorited: boolean }>(`/properties/${id}/favorite`)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["properties"] })
        },
    })
}
