export interface VideoRequest {
    Asc: boolean,
    OrderBy: number,
    Search: string | null,
    Page: number,
    Amount: number,
    From: string | null,
    Until: string | null
}

