import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Property } from "@/types/property"

export function useProperties() {
    return useQuery({
        queryKey: ["properties"],
        queryFn: async () => {
            const { data } = await api.get<Property[]>("/properties")
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
