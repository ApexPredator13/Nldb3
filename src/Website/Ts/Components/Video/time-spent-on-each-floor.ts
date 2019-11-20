import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { Video } from "../../Models/video";
import { Chart } from 'chart.js';

export class TimeSpentOnEachFloor implements Component {
    E: FrameworkElement;

    constructor(video: Promise<Video>, submissionToUse: number) {
        this.E = {
            e: ['div'],
            a: [[A.Class, 'video-page-element']],
            c: [
                {
                    e: ['canvas'],
                    a: [[A.Id, 'time-spent-canvas'], [A.Height, '300'], [A.Width, '700']]
                }
            ]
        }

        video.then(video => {
            const submission = video.submissions[submissionToUse];
            const allFloors = submission.played_characters.flatMap(c => c.played_floors);

            const canvas = document.getElementById('time-spent-canvas');
            if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
                return;
            }
            const canvasContext = canvas.getContext('2d');
            if (!canvasContext) {
                return;
            }

            new Chart(canvasContext, {
                type: 'bar',
                data: {
                    labels: allFloors.map(f => f.floor.name),
                    datasets: [
                        {
                            data: allFloors.map(f => f.duration),
                            backgroundColor: allFloors.map(f => f.floor.color)
                        }
                    ]
                },
                options: {
                    legend: {
                        display: false
                    }
                }
            })
        });
    }
}