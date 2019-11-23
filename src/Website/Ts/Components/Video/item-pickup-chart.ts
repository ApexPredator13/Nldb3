import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { Video } from "../../Models/video";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { Chart } from 'chart.js';
import 'array-flat-polyfill';

export class ItemPickupChart implements Component {
    E: FrameworkElement;

    constructor(video: Promise<Video | null>, submissionToUse: number) {
        this.E = {
            e: ['div'],
            a: [[A.Class, 'video-page-element']],
            c: [
                {
                    e: ['canvas'],
                    a: [[A.Id, 'item-pickup-chart-canvas'], [A.Height, '300'], [A.Width, '800']]
                }
            ]
        };

        video.then(video => {

            if (!video) {
                return;
            }

            const canvas = document.getElementById('item-pickup-chart-canvas');
            if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
                return;
            }

            const canvasContext = canvas.getContext('2d');
            if (!canvasContext) {
                return;
            }

            const submission = video.submissions[submissionToUse];
            const itemEvents = submission.played_characters
                .flatMap(c => c.played_floors)
                .flatMap(floor => floor.events.filter(event => event.event_type === GameplayEventType.ItemCollected || event.event_type === GameplayEventType.ItemTouched));

            const extractedData = new Map<string, [number, string]>();

            for (const itemEvent of itemEvents) {
                if (!itemEvent.r2) {
                    continue;
                }

                const existing = extractedData.get(itemEvent.r2.name);
                if (existing) {
                    const newValue: [number, string] = [existing[0] + 1, itemEvent.r2.color]
                    extractedData.set(itemEvent.r2.name, newValue);
                } else {
                    extractedData.set(itemEvent.r2.name, [1, itemEvent.r2.color]);
                }
            }

            const keys = Array.from(extractedData.keys());
            const data = Array.from(extractedData.values());

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
}