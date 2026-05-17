import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Property } from "@/types/property"
import { useAuth } from "@/lib/auth-context"

export interface PropertiesFilters {
    page?: number
    limit?: number
    search?: string
    status?: string
    type?: string
    sortBy?: string
    builderId?: string
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
    const { user } = useAuth()
    return useQuery({
        queryKey: ["properties", user?.tenantId, filters],
        queryFn: async () => {
            const params = Object.fromEntries(
                Object.entries(filters || {}).filter(([, v]) => v !== undefined && v !== "")
            )
            const { data } = await api.get<PaginatedResponse<Property>>("/properties", {
                params,
            })
            return data
        },
        enabled: !!user?.tenantId,
    })
}

export function useProperty(id: string) {
    const { user } = useAuth()
    return useQuery({
        queryKey: ["properties", user?.tenantId, id],
        queryFn: async () => {
            const { data } = await api.get<Property>(`/properties/${id}`)
            return data
        },
        enabled: !!id && !!user?.tenantId,
    })
}

export function useRelatedProperties(id: string) {
    const { user } = useAuth()
    return useQuery({
        queryKey: ["properties", user?.tenantId, id, "related"],
        queryFn: async () => {
            const { data } = await api.get<Property[]>(`/properties/${id}/related`)
            return data
        },
        enabled: !!id && !!user?.tenantId,
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
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["properties"] })
            queryClient.invalidateQueries({ queryKey: ["properties", id] })
        },
    })
}
