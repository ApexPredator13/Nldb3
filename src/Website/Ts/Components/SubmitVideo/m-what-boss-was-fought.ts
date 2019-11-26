import { Component, FrameworkElement } from "../../Framework/renderer";
import { Boxes } from "../General/boxes";
import { IsaacResource } from "../../Models/isaac-resource";
import { SearchboxComponent } from "../General/searchbox";
import { BackToMainSelection } from "./back-to-main-selection";

export class WhatBossWasFought<TSubscriber extends Object> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedBossProcessor: (bossId: string) => any,
        commonBosses: Array<IsaacResource>,
        allBosses: Promise<Array<IsaacResource> | null>
    ) {
        const boxes = new Boxes(subscriber, 15, commonBosses, undefined, false);
        boxes.Subscribe(selectedBossProcessor);
        const searchbox = new SearchboxComponent(subscriber, 16, allBosses, false);
        searchbox.Subscribe(selectedBossProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'What boss was fought?']
                },
                boxes,
                searchbox,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, selectedBossProcessor)
            ]
        }
    }
}


