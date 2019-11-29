import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/boxes";

export class ConfirmNlDidAVictoryLap<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        choiceProcessor: (choice: string) => any,
        icons: Array<IsaacResource>
    ) {
        const boxes = new Boxes(subscriber, 32, icons, '/img/gameplay_events.png', false);
        boxes.Subscribe(choiceProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'Please confirm: NL did a victory lap?']
                },
                boxes
            ]
        };
    }
}