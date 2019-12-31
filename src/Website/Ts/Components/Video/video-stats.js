import { Div, id, cl, canvas, attr, div, Html } from "../../Framework/renderer";
import { get } from "../../Framework/http";
import { Chart } from 'chart.js';

export function renderVideoStats(video, containerId) {
    Promise.all([video, get('/api/videos/max')]).then(([video, stats]) => {
        new Html([
            Div(
                id('global-stats'),
                cl('video-page-element'),

                div(
                    canvas(
                        attr({ id: 'likes', height: '300' })
                    )
                ),
                div(
                    canvas(
                        attr({ id: 'likes-avg', height: '300' })
                    )
                ),
                div(
                    canvas(
                        attr({ id: 'dislikes', height: '300' })
                    )
                ),
                div(
                    canvas(
                        attr({ id: 'dislikes-avg', height: '300' })
                    )
                ),
                div(
                    canvas(
                        attr({ id: 'views', height: '300' })
                    )
                ),
                div(
                    canvas(
                        attr({ id: 'views-avg', height: '300' })
                    )
                ),
                div(
                    canvas(
                        attr({ id: 'comments', height: '300' })
                    )
                ),
                div(
                    canvas(
                        attr({ id: 'comments-avg', height: '300' })
                    )
                ),
            )
        ], containerId);

        const { likes, dislikes, view_count, comment_count } = video;
        const { max_likes, max_dislikes, max_views, max_comments, avg_likes, avg_dislikes, avg_views, avg_comments } = stats;

        if (!likes || !dislikes || !view_count || !comment_count) {
            return;
        }

        createChart(likes, max_likes, 'likes', 'Likes', 'Most-Liked');
        createChart(likes, avg_likes, 'likes-avg', 'Likes', 'Ø Likes');
        createChart(dislikes, max_dislikes, 'dislikes', 'Dislikes', 'Most-Disliked');
        createChart(dislikes, avg_dislikes, 'dislikes-avg', 'Dislikes', 'Ø Dislikes');
        createChart(view_count, max_views, 'views', 'Views', 'Most-Viewed');
        createChart(view_count, avg_views, 'views-avg', 'Views', 'Ø Views');
        createChart(comment_count, max_comments, 'comments', 'Comments', 'Most-Commented');
        createChart(comment_count, avg_comments, 'comments-avg', 'Comments', 'Ø Comments');
    });
}

function createChart(videoData, globalVideoData, canvasElementId, thisVideoDataLabel, globalDataLabel) {
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

    const chartConfig = {
        type: 'bar',
        data: {
            labels: [
                thisVideoDataLabel,
                globalDataLabel
            ],
            datasets: [
                {
                    data: [videoData],
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

