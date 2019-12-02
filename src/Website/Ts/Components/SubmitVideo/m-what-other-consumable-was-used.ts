import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { BackToMainSelection } from "./back-to-main-selection";
import { Boxes } from "../General/boxes";

export class WhatOtherConsumableWasUsed<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        chosenConsumableProcessor: (consumableId: string) => any,
        consumables: Promise<Array<IsaacResource> | null>
    ) {
        const searchbox = new Boxes(subscriber, 71, consumables, undefined, false);
        searchbox.Subscribe(chosenConsumableProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What consumable was used?']
                },
                searchbox,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, chosenConsumableProcessor)
            ]
        }
    }
}


