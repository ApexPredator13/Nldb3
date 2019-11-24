import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/boxes";

export class MainSelectScreen<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: ThisType<TSubscriber>,
        events: Array<IsaacResource>,
        consumables: Array<IsaacResource>,
        selectionProcessor: (selectedEvent: string) => any
    ) {
        const eventBoxes = new Boxes<TSubscriber>(subscriber, 6, events, '/img/gameplay_events.png', false);
        eventBoxes.Subscribe(selectionProcessor);
        const consumableBoxes = new Boxes(subscriber, 7, consumables, '/img/gameplay_events.png', false);
        consumableBoxes.Subscribe(selectionProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What happened?']
                },
                eventBoxes,
                {
                    e: ['h2', 'What was used?']
                },
                consumableBoxes
            ]
        }
    }
}

