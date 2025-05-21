export interface ScrapeDto{
    search_string : string
}

export interface OpenAIEnrichmentDto{
    summary : string,
    relevance_score : number,
    author : string | null
}

export interface SingleIdDto{
    id : number
}

export interface ListJobBooksDto{
    id : number,
    offset : number,
    limit : number
}