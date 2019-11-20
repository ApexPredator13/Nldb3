import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { Video } from "../../Models/video";
import { Chart } from 'chart.js';
import { filterTransformationEvents } from "./transformation-progress";
import { IsaacResource } from "../../Models/isaac-resource";

export class TransformationProgressChart implements Component {
    E: FrameworkElement;

    constructor(video: Promise<Video>, submissionToUse: number) {
        this.E = {
            e: ['div'],
            a: [[A.Style, 'display: inline-block; height: 420px;'], [A.Class, 'video-page-element'], [A.Id, 'transformation-progress-canvas-container']],
            c: [
                {
                    e: ['canvas'],
                    a: [[A.Id, 'transformation-progress-chart'], [A.Height, '400'], [A.Width, '400']]
                }
            ]
        };

        video.then(video => {
            console.log('creating progress chart');
            const canvasElement = document.getElementById('transformation-progress-chart');
            if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement)) {
                return;
            }
            const canvasContext = canvasElement.getContext('2d');
            if (!canvasContext) {
                return;
            }

            const transformationEvents = filterTransformationEvents(video, submissionToUse);

            // if no transformation data is available, remove the canvas element altogether.
            // quick fix: remove the header from the episode page component also.
            if (transformationEvents.size === 0) {
                const canvasContainer = document.getElementById('transformation-progress-canvas-container');
                if (canvasContainer && canvasContainer.parentElement) {
                    canvasContainer.parentElement.removeChild(canvasContainer);
                }
                const header = document.getElementById('transformation-progress-header');
                if (header && header.parentElement) {
                    header.parentElement.removeChild(header);
                }
            }


            const data = new Map<string, { amount: number, color: string }>();

            for (const events of transformationEvents) {
                const transformationName = (events[1][0].r2 as IsaacResource).name;
                const transformationColor = (events[1][0].r2 as IsaacResource).color;

                if (!data.has(transformationName)) {
                    data.set(transformationName, { amount: events[1].length, color: transformationColor });
                } else {
                    const current = data.get(transformationName);
                    if (current) {
                        data.set(transformationName, { amount: current.amount + events[1].length, color: current.color });
                    }
                }
            }

            const labels = Array.from(data.keys());
            const amountAndColor = Array.from(data.values());

            console.log(labels, amountAndColor);

            const chartConfig: Chart.ChartConfiguration = {
                type: 'pie',
                data: {
                    datasets: [
                        {
                            data: amountAndColor.map(x => x.amount),
                            backgroundColor: amountAndColor.map(x => x.color)
                        }
                    ],
                    labels: labels
                }
            };

            console.log('chart config', chartConfig);

            new Chart(canvasContext, chartConfig);
        });
    }
}

