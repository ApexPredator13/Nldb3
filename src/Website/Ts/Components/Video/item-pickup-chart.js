import { Render, Div, cl, canvas, attr } from "../../Framework/renderer";
import 'array-flat-polyfill';

export function renderItempickupChart(video, submissionIndex, containerId) {

    video.then(v => {
        // draw chart elements
        new Render([
            Div(
                cl('video-page-element'),
                canvas(
                    attr({ class: 'video-page-element', width: '800', height: '300', id: 'item-pickup-chart-canvas' })
                )
            )
        ], containerId);

        // extract data
        const canvasContext = document.getElementById('item-pickup-chart-canvas').getContext('2d');
        const itemEvents = v.submissions[submissionIndex]
            .flatMap(c => c.played_floors)
            .flatMap(floor => floor.events.filter(event => event.event_type === GameplayEventType.ItemCollected || event.event_type === GameplayEventType.ItemTouched));

        const extractedData = new Map();

        for (const itemEvent of itemEvents) {
            if (!itemEvent.r2) {
                continue;
            }

            const existing = extractedData.get(itemEvent.r2.name);
            if (existing) {
                const newValue = [existing[0] + 1, itemEvent.r2.color]
                extractedData.set(itemEvent.r2.name, newValue);
            } else {
                extractedData.set(itemEvent.r2.name, [1, itemEvent.r2.color]);
            }
        }

        const keys = Array.from(extractedData.keys());
        const data = Array.from(extractedData.values());

        // create chart
        new Chart(canvasContext, {
            type: 'bar',
            data: {
                labels: keys,
                datasets: [
                    {
                        backgroundColor: data.map(x => x[1]),
                        data: data.map(x => x[0])
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
