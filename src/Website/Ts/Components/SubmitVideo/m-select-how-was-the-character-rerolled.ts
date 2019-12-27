import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/Boxes";
import { BackToMainSelection } from "./back-to-main-selection";

export class SelectHowWasTheCharacterRerolled<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedCharacterRerollProcessor: (rerollId: string) => any,
        characterRerolls: Promise<Array<IsaacResource> | null>
    ) {
        const boxes = new Boxes<TSubscriber>(subscriber, 20, characterRerolls, undefined, false, undefined);
        boxes.Subscribe(selectedCharacterRerollProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'How was the character rerolled?']
                },
                boxes,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, selectedCharacterRerollProcessor)
            ]
        };
    }
}

