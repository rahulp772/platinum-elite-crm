import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Builder } from "@/types/builder"
import { useAuth } from "@/lib/auth-context"

export function useBuilders() {
    const { user } = useAuth()
    return useQuery({
        queryKey: ["builders", user?.tenantId],
        queryFn: async () => {
            const { data } = await api.get<Builder[]>("/builders")
            return data
        },
        enabled: !!user?.tenantId,
    })
}

export function useBuilder(id: string) {
    const { user } = useAuth()
    return useQuery({
        queryKey: ["builders", user?.tenantId, id],
        queryFn: async () => {
            const { data } = await api.get<Builder>(`/builders/${id}`)
            return data
        },
        enabled: !!id && !!user?.tenantId,
    })
}

export function useCreateBuilder() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (builder: Partial<Builder>) => {
            const { data } = await api.post<Builder>("/builders", builder)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["builders"] })
        },
    })
}

export function useUpdateBuilder() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...builder }: Partial<Builder> & { id: string }) => {
            const { data } = await api.patch<Builder>(`/builders/${id}`, builder)
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["builders"] })
            queryClient.invalidateQueries({ queryKey: ["builders", data.id] })
        },
    })
}


export function useDeleteBuilder() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/builders/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["builders"] })
        },
    })
}
