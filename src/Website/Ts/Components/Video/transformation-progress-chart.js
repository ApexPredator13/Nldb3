import { Render, Div, attr, canvas } from "../../Framework/renderer";
import { Chart } from 'chart.js';
import { filterTransformationEvents } from "./transformation-progress";

export function renderTransformationProgressChart(video, submissionIndex, containerId) {
    video.then(video => {

        new Render([
            Div(
                attr({
                    style: 'display: inline-block; height: 420px;',
                    class: 'video-page-element',
                    id: 'transformation-progress-canvas-container'
                }),
                canvas(
                    attr({
                        id: 'transformation-progress-chart',
                        height: '400',
                        width: '400'
                    })
                )
            )
        ], containerId);

        const canvasContext = document.getElementById('transformation-progress-chart').getContext('2d');
        const transformationEvents = filterTransformationEvents(video, submissionIndex);

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


        const data = new Map();

        for (const events of transformationEvents) {
            const transformationName = events[1][0].r2.name;
            const transformationColor = events[1][0].r2.color;

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

        const chartConfig = {
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

        new Chart(canvasContext, chartConfig);
    });
}

