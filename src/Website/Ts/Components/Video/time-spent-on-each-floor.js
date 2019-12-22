import { Render, Div, cl, canvas, attr } from "../../Framework/renderer";
import { Chart } from 'chart.js';

export function renderTimeSpentOnEachFloor(video, submissionIndex, containerId) {
    video.then(video => {
        const submission = video.submissions[submissionIndex];
        const allFloors = submission.played_characters.flatMap(c => c.played_floors);

        new Render([
            Div(
                cl('video-page-element'),
                canvas(
                    attr({ id: 'time-spent-canvas', height: '300', width: '700' })
                )
            )
        ], containerId);

        const canvasContext = document.getElementById('time-spent-canvas').getContext('2d');

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
        });
    });
}