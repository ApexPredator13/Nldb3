import { Component, FrameworkElement } from "../../Framework/renderer";
import { Boxes } from "../General/boxes";
import { IsaacResource } from "../../Models/isaac-resource";
import { BackToMainSelection } from "./back-to-main-selection";

export class WhatCharacterDidNlChangeInto<TSubscriber extends Object> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedCharacterProcessor: (characterId: string) => any,
        characters: Promise<Array<IsaacResource> | null>
    ) {
        const boxes = new Boxes(subscriber, 61, characters, undefined, false);
        boxes.Subscribe(selectedCharacterProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What character did he change into?']
                },
                boxes,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, selectedCharacterProcessor)
            ]
        };
    }
}

