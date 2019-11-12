import { Component, FrameworkElement, Attribute } from "../../Framework/renderer";
import { get } from "../../Framework/http";
import { Video } from "../../Models/video";
import { MaxVideoStats } from "../../Models/max-video-stats";
import { Chart, ChartConfiguration } from 'chart.js';

export class VideoStats implements Component {
    E: FrameworkElement;

    constructor(video: Promise<Video>) {
        this.E = {
            e: ['div'],
            a: [[Attribute.Id, 'global-stats']],
            c: [
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['canvas'],
                            a: [[Attribute.Id, 'likes'], [Attribute.Height, '300']]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['canvas'],
                            a: [[Attribute.Id, 'likes-avg'], [Attribute.Height, '300']]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['canvas'],
                            a: [[Attribute.Id, 'dislikes'], [Attribute.Height, '300']]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['canvas'],
                            a: [[Attribute.Id, 'dislikes-avg'], [Attribute.Height, '300']]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['canvas'],
                            a: [[Attribute.Id, 'views'], [Attribute.Height, '300']]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['canvas'],
                            a: [[Attribute.Id, 'views-avg'], [Attribute.Height, '300']]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['canvas'],
                            a: [[Attribute.Id, 'comments'], [Attribute.Height, '300']]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['canvas'],
                            a: [[Attribute.Id, 'comments-avg'], [Attribute.Height, '300']]
                        }
                    ]
                }
            ]
        };

        this.CreateVideoStatsChart(video);
    }

    private CreateVideoStatsChart(video: Promise<Video>): void {

        Promise.all([video, get<MaxVideoStats>('/api/videos/max')]).then(([video, stats]) => {
            const { likes, dislikes, view_count, comment_count } = video;
            const { max_likes, max_dislikes, max_views, max_comments, avg_likes, avg_dislikes, avg_views, avg_comments } = stats;

            if (!likes || !dislikes || !view_count || !comment_count) {
                return;
            }

            this.CreateChart(likes, max_likes, 'likes', 'Likes', 'Most-Liked');
            this.CreateChart(likes, avg_likes, 'likes-avg', 'Likes', 'Ø Likes');
            this.CreateChart(dislikes, max_dislikes, 'dislikes', 'Dislikes', 'Most-Disliked');
            this.CreateChart(dislikes, avg_dislikes, 'dislikes-avg', 'Dislikes', 'Ø Dislikes');
            this.CreateChart(view_count, max_views, 'views', 'Views', 'Most-Viewed');
            this.CreateChart(view_count, avg_views, 'views-avg', 'Views', 'Ø Views');
            this.CreateChart(comment_count, max_comments, 'comments', 'Comments', 'Most-Commented');
            this.CreateChart(comment_count, avg_comments, 'comments-avg', 'Comments', 'Ø Comments');
        });
    }

    private CreateChart(thisVideoData: number, globalVideoData: number, canvasElementId: string, thisVideoDataLabel: string, globalDataLabel: string) {
        const canvas = document.getElementById(canvasElementId);
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            return;
        }

        const canvasParent = canvas.parentElement;
        const containerParent = canvasParent ? canvasParent.parentElement : null;
        if (!containerParent) {
            return;
        }

        const containerParentWidth = containerParent.getBoundingClientRect().width;
        const canvasWidth = Math.floor((containerParentWidth - 30) / 8);
        canvas.width = canvasWidth;
        canvas.height = 300;

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        const chartConfig: ChartConfiguration = {
            type: 'bar',
            data: {
                labels: [
                    thisVideoDataLabel,
                    globalDataLabel
                ],
                datasets: [
                    {
                        data: [thisVideoData],
                        backgroundColor: 'PeachPuff',
                        borderColor: 'PeachPuff',
                        hoverBackgroundColor: 'PeachPuff',
                        hoverBorderColor: 'PeachPuff',
                        label: thisVideoDataLabel,
                    },
                    {
                        data: [Number(globalVideoData.toFixed(2))],
                        backgroundColor: 'Goldenrod',
                        borderColor: 'Goldenrod',
                        hoverBackgroundColor: 'Goldenrod',
                        hoverBorderColor: 'Goldenrod',
                        label: globalDataLabel
                    }
                ]
            },
            options: {
                maintainAspectRatio: true,
                responsive: true,
                legend: {
                    labels: {
                        fontColor: 'white',
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: 'white',
                            beginAtZero: true,
                            callback: (label) => {
                                if (typeof (label) === 'number') {
                                    if (label > 1000000) {
                                        return Math.floor(label / 1000000).toString(10) + 'M';
                                    }
                                    else if (label > 1000) {
                                        return Math.floor(label / 1000).toString(10) + 'K';
                                    } else {
                                        return label;
                                    }
                                } else {
                                    return label;
                                }
                            }
                        }
                    }],
                    xAxes: [{
                        display: false
                    }]
                },
            }
        };

        new Chart(context, chartConfig);
    }
}