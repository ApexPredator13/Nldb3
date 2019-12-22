import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/renderBoxes";
import { BackToMainSelection } from "./back-to-main-selection";

export class ConfirmNlDied<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectionProcessor: (choice: string) => any,
        icons: Array<IsaacResource>
    ) {
        const boxes = new Boxes(subscriber, 25, icons, '/img/gameplay_events.png', false);
        boxes.Subscribe(selectionProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'Please confirm: Northernlion died?']
                },
                boxes,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, selectionProcessor)
            ]
        };
    }
}


