import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Lead, LeadActivity, LeadLookupResult } from "@/types/lead"

export function useLeads() {
    return useQuery({
        queryKey: ["leads"],
        queryFn: async () => {
            const { data } = await api.get<Lead[]>("/leads")
            return data
        },
    })
}

export function useMyLeads() {
    return useQuery({
        queryKey: ["leads", "my"],
        queryFn: async () => {
            const { data } = await api.get<Lead[]>("/leads/my")
            return data
        },
    })
}

export function useUpcomingFollowUps() {
    return useQuery({
        queryKey: ["leads", "followups"],
        queryFn: async () => {
            const { data } = await api.get<Lead[]>("/leads/followups")
            return data
        },
    })
}

export function useLeadLookup() {
    return useMutation({
        mutationFn: async (phone: string) => {
            const { data } = await api.get<LeadLookupResult>("/leads/lookup", {
                params: { phone }
            })
            return data
        },
    })
}

export function useLeadActivities(leadId: string) {
    return useQuery({
        queryKey: ["leads", leadId, "activities"],
        queryFn: async () => {
            const { data } = await api.get<LeadActivity[]>(`/leads/${leadId}/activities`)
            return data
        },
        enabled: !!leadId,
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

export function useUpdateLead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...lead }: Partial<Lead> & { id: string }) => {
            const { data } = await api.patch<Lead>(`/leads/${id}`, lead)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] })
        },
    })
}

export function useDeleteLead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/leads/${id}`)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] })
        },
    })
}

export function useBulkAssignLead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ leadIds, assignedToId }: { leadIds: string[]; assignedToId: string }) => {
            const { data } = await api.post("/leads/bulk-assign", { leadIds, assignedToId })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] })
        },
    })
}

export function useUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const { data } = await api.get<{ id: string; name: string }[]>("/users")
            return data
        },
    })
}