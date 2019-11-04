export interface GetResourceRequest {
    ResourceType: number;
    IncludeMod: boolean | undefined;
    OrderBy1: number | undefined;
    OrderBy2: number | undefined;
    Asc: boolean | undefined;
    RequiredTags: Array<number> | undefined;
}
