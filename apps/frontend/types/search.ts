export type SearchResultType = "property" | "lead" | "deal"

export interface SearchResult {
    id: string
    title: string
    subtitle: string
    type: SearchResultType
    status?: string
    value?: number
}