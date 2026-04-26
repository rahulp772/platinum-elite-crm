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
            return { data, id }
        },
        onSuccess: ({ id }) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] })
            queryClient.invalidateQueries({ queryKey: ["lead", id] })
            queryClient.invalidateQueries({ queryKey: ["lead-activities", id] })
        },
        onSettled: (_, __, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["lead", id] })
            queryClient.invalidateQueries({ queryKey: ["lead-activities", id] })
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

export function useReassignLead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ leadId, assignedToId }: { leadId: string; assignedToId: string }) => {
            const { data } = await api.post(`/leads/${leadId}/reassign`, { assignedToId })
            return { data, leadId }
        },
        onSuccess: ({ leadId }) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] })
            queryClient.invalidateQueries({ queryKey: ["lead", leadId] })
            queryClient.invalidateQueries({ queryKey: ["lead-activities", leadId] })
        },
    })
}

export function useLogLeadActivity() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ leadId, action, description }: { leadId: string; action: string; description?: string }) => {
            const { data } = await api.post(`/leads/${leadId}/log-activity`, { action, description })
            return { data, leadId }
        },
        onSuccess: ({ leadId }) => {
            queryClient.invalidateQueries({ queryKey: ["lead-activities", leadId] })
            queryClient.invalidateQueries({ queryKey: ["lead", leadId] })
        },
    })
}

export function useLeadProperties() {
    return useQuery({
        queryKey: ["lead-properties"],
        queryFn: async () => {
            const { data } = await api.get<{ id: string; title: string }[]>("/properties?status=available")
            return data
        },
    })
}

export interface LeadSuggestion {
    suggestion: string
    reason: string
    action: string
    priority: 'urgent' | 'high' | 'medium' | 'low'
    ctaLabel: string
}

export function useLeadSuggestion(leadId: string) {
    return useQuery({
        queryKey: ["lead-suggestion", leadId],
        queryFn: async () => {
            const { data } = await api.get<LeadSuggestion>(`/leads/${leadId}/suggestion`)
            return data
        },
        enabled: !!leadId,
    })
}