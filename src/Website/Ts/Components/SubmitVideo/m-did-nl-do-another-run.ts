import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/boxes";

export class DidNlDoAnotherRun<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        choiceProcessor: (choice: string) => any,
        icons: Array<IsaacResource>
    ) {
        const boxes = new Boxes(subscriber, 30, icons, '/img/gameplay_events.png', false);
        boxes.Subscribe(choiceProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'Did NL do another run?']
                },
                boxes
            ]
        }
    }
}