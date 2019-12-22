import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { SearchboxComponent } from "../General/renderSearchbox";
import { BackToMainSelection } from "./back-to-main-selection";

export class WhatTarotCardWasUsed<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        chosenTarotCardProcessor: (tarotCardId: string) => any,
        tarotCards: Promise<Array<IsaacResource> | null>
    ) {
        const searchbox = new SearchboxComponent(subscriber, 71, tarotCards, false);
        searchbox.Subscribe(chosenTarotCardProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What card was used?']
                },
                searchbox,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, chosenTarotCardProcessor)
            ]
        }
    }
}