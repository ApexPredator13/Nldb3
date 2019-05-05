import { Thumbnail } from "./thumbnail";

export interface Video {
    id: string,
    title: string,
    published: string,
    duration: number,
    thumbnails: Array<Thumbnail>,
    requires_update: boolean,
    likes: number | null,
    dislikes: number | null,
    view_count: number | null,
    favorite_count: number | null,
    comment_count: number | null,
    submissions: null,
    tags: Array<string>,
    is_3d: boolean,
    is_hd: boolean,
    cc: boolean,
    submission_count: number,
    ratio: number | null
}