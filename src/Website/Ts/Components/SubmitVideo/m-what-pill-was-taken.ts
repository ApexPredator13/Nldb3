import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { SearchboxComponent } from "../General/Searchbox";
import { BackToMainSelection } from "./back-to-main-selection";

export class WhatPillWasTaken<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedPillProcessor: (pillId: string) => any,
        pills: Promise<Array<IsaacResource> | null>
    ) {
        const searchbox = new SearchboxComponent(subscriber, 65, pills, false);
        searchbox.Subscribe(selectedPillProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What pill was taken?']
                },
                searchbox,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, selectedPillProcessor)
            ]
        };
    }
}