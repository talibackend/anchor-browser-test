export interface ScrapeDto{
    search_string : string
}

export interface OpenAIEnrichmentDto{
    summary : string,
    relevance_score : number,
    author : string | null
}