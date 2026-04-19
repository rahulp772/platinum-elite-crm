import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { Task } from "@/types/task"

export function useTasks() {
    return useQuery({
        queryKey: ["tasks"],
        queryFn: async () => {
            const { data } = await api.get<Task[]>("/tasks")
            return data
        },
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