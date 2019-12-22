﻿import { FrameworkElement, Component } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/renderBoxes";

export class WhatGameModeWasChosen<TSubscriber extends Object> implements Component {
    E: FrameworkElement;

    constructor(subscriber: TSubscriber, resources: Array<IsaacResource>, gameModeProcessor: (id: string) => any) {

        const gameModeBoxes = new Boxes(subscriber, 2, resources, '/img/gameplay_events.png', false);
        gameModeBoxes.Subscribe(gameModeProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What game mode was played?']
                },
                gameModeBoxes
            ]
        }
    }
}

