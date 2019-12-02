import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/boxes";
import { BackToMainSelection } from "./back-to-main-selection";

export class DidBlackRuneAbsorbAnItem<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedAbsorbedItemProcessor: (selectedItemId: string) => any,
        noItemWasAbsorbedIcon: Array<IsaacResource>,
        firstPrompt: boolean
    ) {
        const boxes = new Boxes(subscriber, 75, noItemWasAbsorbedIcon, '/img/gameplay_events.png', false);
        boxes.Subscribe(selectedAbsorbedItemProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', firstPrompt ? 'Did Black Rune absorb an item?' : 'Did Black Rune absorb another item?']
                },
                boxes,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, selectedAbsorbedItemProcessor)
            ]
        };
    }
}

