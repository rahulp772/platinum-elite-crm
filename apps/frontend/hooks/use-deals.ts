import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Deal, DealStage } from "@/types/deal"
import { useAuth } from "@/lib/auth-context"

interface PaginatedResponse<T> {
    data: T[]
    metadata: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export function useDeals() {
    const { user } = useAuth()
    return useQuery({
        queryKey: ["deals", user?.tenantId],
        queryFn: async () => {
            const { data } = await api.get<PaginatedResponse<Deal>>("/deals")
            return data
        },
        enabled: !!user?.tenantId,
    })
}

export function useCreateDeal() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (deal: Partial<Deal> & { propertyId?: string }) => {
            const { data } = await api.post<Deal>("/deals", deal)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] })
        },
    })
}

export function useUpdateDeal() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & Partial<Deal> & { propertyId?: string }) => {
            const { data: updatedDeal } = await api.patch<Deal>(`/deals/${id}`, data)
            return updatedDeal
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] })
        },
    })
}

export function useUpdateDealStage() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, stage }: { id: string, stage: DealStage }) => {
            const { data } = await api.patch<Deal>(`/deals/${id}`, { stage })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] })
        },
    })
}
