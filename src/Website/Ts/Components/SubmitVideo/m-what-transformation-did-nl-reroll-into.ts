import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { SearchboxComponent } from "../General/searchbox";
import { BackToMainSelection } from "./back-to-main-selection";

export class WhatTransformationDidNlRerollInto<TSubscriber extends Object> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedTransformationProcessor: (transformationId: string) => any,
        transformations: Promise<Array<IsaacResource> | null>
    ) {
        const searchbox = new SearchboxComponent(subscriber, 74, transformations, false);
        searchbox.Subscribe(selectedTransformationProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What transformation did NL reroll into?']
                },
                searchbox,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, selectedTransformationProcessor)
            ]
        }
    }
}