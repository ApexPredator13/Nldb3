import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/boxes";

export class WhatCharacterWasChosen<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: ThisType<TSubscriber>,
        resources: Promise<Array<IsaacResource> | null>,
        selectedCharacterGoesTo: (chosenCharacter: string) => any
    ) {
        const boxes = new Boxes(subscriber, 1, resources, undefined, false);
        boxes.Subscribe(selectedCharacterGoesTo);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What character was chosen?']
                },
                boxes
            ]
        }
    }
}


