import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { SearchResult } from "@/types/search"
import { useAuth } from "@/lib/auth-context"

export function useSearch(query: string) {
    const { user } = useAuth()
    return useQuery({
        queryKey: ["search", user?.tenantId, query],
        queryFn: async () => {
            if (!query) return []
            const { data } = await api.get<SearchResult[]>(`/search?q=${query}`)
            return data
        },
        enabled: query.length >= 2 && !!user?.tenantId,
        staleTime: 1000 * 60,
    })
}
