import { Html, Div, cl, canvas, attr } from "../../Framework/renderer";
import { Chart } from 'chart.js';
import { isCoop } from './is-coop';

export function renderTimeSpentOnEachFloor(video, submissionIndex, containerId) {
    video.then(video => {

        const coop = isCoop(video);

        const submission = video.submissions[submissionIndex];

        // floors are identical in co-op play, so we only need to get every second floor
        const allFloors = coop
            ? submission.played_characters.filter(c => c.run_number % 2 === 0).flatMap(c => c.played_floors)
            : submission.played_characters.flatMap(c => c.played_floors);

        new Html([
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