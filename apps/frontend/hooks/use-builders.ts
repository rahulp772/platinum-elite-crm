import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Builder } from "@/types/builder"

export function useBuilders() {
    return useQuery({
        queryKey: ["builders"],
        queryFn: async () => {
            const { data } = await api.get<Builder[]>("/builders")
            return data
        },
    })
}

export function useBuilder(id: string) {
    return useQuery({
        queryKey: ["builders", id],
        queryFn: async () => {
            const { data } = await api.get<Builder>(`/builders/${id}`)
            return data
        },
        enabled: !!id,
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
