import { ChartData } from 'chart.js'
import { VideoResult } from './video-result';

export interface StatsPageResult {
    history?: ChartData;
    found_at_stats?: ChartData;
    character_stats?: ChartData;
    curse_stats?: ChartData;
    floor_stats?: ChartData;
    transformation_item_ranking?: ChartData;
    videos?: VideoResult;
}

