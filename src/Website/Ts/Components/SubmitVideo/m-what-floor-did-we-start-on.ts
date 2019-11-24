import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/boxes";
import { SearchboxComponent } from "../General/searchbox";

export class WhatFloorDidWeStartOn<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: ThisType<TSubscriber>,
        firstFloors: Promise<Array<IsaacResource> | null>,
        allFloors: Promise<Array<IsaacResource> | null>,
        selectedFloorProcessor: (id: string) => any
    ) {
        const boxes = new Boxes(subscriber, 3, firstFloors, undefined, false);
        boxes.Subscribe(selectedFloorProcessor);

        const searchbox = new SearchboxComponent(subscriber, 4, allFloors, false);
        searchbox.Subscribe(selectedFloorProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What floor did we start on?']
                },
                boxes,
                {
                    e: ['hr']
                },
                searchbox
            ]
        }
    }
}


