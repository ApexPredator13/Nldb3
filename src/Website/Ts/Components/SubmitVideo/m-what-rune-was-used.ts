import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { SearchboxComponent } from "../General/searchbox";
import { BackToMainSelection } from "./back-to-main-selection";

export class WhatRuneWasUsed<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedRuneProcessor: (pillId: string) => any,
        runes: Promise<Array<IsaacResource> | null>
    ) {
        const searchbox = new SearchboxComponent(subscriber, 65, runes, false);
        searchbox.Subscribe(selectedRuneProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What Rune was used?']
                },
                searchbox,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, selectedRuneProcessor)
            ]
        };
    }
}