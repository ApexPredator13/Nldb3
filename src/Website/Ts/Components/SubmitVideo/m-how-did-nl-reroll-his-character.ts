import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/renderBoxes";
import { BackToMainSelection } from "./back-to-main-selection";

export class HowDidNlRerollHisCharacter<TSubscriber extends Object> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedRerollProcessor: (selectedReroll: string) => any,
        rerolls: Promise<Array<IsaacResource> | null>
    ) {
        const boxes = new Boxes(subscriber, 96, rerolls, undefined, false);
        boxes.Subscribe(selectedRerollProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'How did NL reroll his character?']
                },
                boxes,
                new BackToMainSelection(subscriber, selectedRerollProcessor)
            ]
        };
    }
}