import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Lead } from "@/types/lead"

export function useLeads() {
    return useQuery({
        queryKey: ["leads"],
        queryFn: async () => {
            const { data } = await api.get<Lead[]>("/leads")
            return data
        },
    })
}

export function useCreateLead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (lead: Partial<Lead>) => {
            const { data } = await api.post<Lead>("/leads", lead)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] })
        },
    })
}
