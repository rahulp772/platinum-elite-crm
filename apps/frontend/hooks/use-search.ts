import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { SearchResult } from "@/types/search"

export function useSearch(query: string) {
    return useQuery({
        queryKey: ["search", query],
        queryFn: async () => {
            if (!query) return []
            const { data } = await api.get<SearchResult[]>(`/search?q=${query}`)
            return data
        },
        enabled: query.length >= 2,
        staleTime: 1000 * 60, // 1 minute
    })
}
