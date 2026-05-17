import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Task } from "@/types/task"
import { useAuth } from "@/lib/auth-context"

export interface PaginatedTasks {
    data: Task[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
}

export function useTasksInfinite() {
    const { user } = useAuth()
    return useInfiniteQuery({
        queryKey: ["tasks", user?.tenantId],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const { data } = await api.get<PaginatedTasks>("/tasks", {
                params: { page: pageParam, limit: 20 },
            })
            return data
        },
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
        enabled: !!user?.tenantId,
    })
}

export function useTaskCounts() {
    const { user } = useAuth()
    return useQuery({
        queryKey: ["tasks", user?.tenantId, "counts"],
        queryFn: async () => {
            const { data } = await api.get<{ total: number; overdue: number; today: number; tomorrow: number }>("/tasks/count")
            return data
        },
        staleTime: 30 * 1000,
        enabled: !!user?.tenantId,
    })
}

export function useTasks() {
    const { user } = useAuth()
    return useQuery({
        queryKey: ["tasks", user?.tenantId],
        queryFn: async () => {
            const { data } = await api.get<Task[]>("/tasks")
            return data
        },
        enabled: !!user?.tenantId,
    })
}

export function useCreateTask() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (task: Partial<Task>) => {
            const { data } = await api.post<Task>("/tasks", task)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
        },
    })
}

export function useUpdateTask() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, ...task }: Partial<Task> & { id: string }) => {
            const { data } = await api.patch<Task>(`/tasks/${id}`, task)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
        },
    })
}

export function useDeleteTask() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/tasks/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
        },
    })
}