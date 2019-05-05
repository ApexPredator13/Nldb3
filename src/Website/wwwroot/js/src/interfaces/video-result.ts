import { Video } from "./video";

export interface VideoResult {
    video_count: number,
    amount_per_page: number,
    videos: Array<Video>
}