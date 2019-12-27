import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { Boxes } from "../General/Boxes";
import { IsaacResource } from "../../Models/isaac-resource";
import { SearchboxComponent } from "../Gen../General/Searchboxport { BackToMainSelection } from "./back-to-main-selection";
import { HelpSelectBoss } from "./help-select-boss";
import { ComponentWithModal } from "../../Framework/ComponentBaseClasses/component-with-modal";
import { YoutubePlayer } from "./youtube-player";

export class WhatBossWasFought<TSubscriber extends Object> extends ComponentWithModal implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedBossProcessor: (bossId: string) => any,
        commonBosses: Array<IsaacResource>,
        allBosses: Promise<Array<IsaacResource> | null>,
        youtubePlayer: YoutubePlayer
    ) {
        super(youtubePlayer);
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
                {
                    e: ['p', 'Common bosses for this floor']
                },
                boxes,
                {
                    e: ['p', 'all bosses']
                },
                searchbox,
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', '❔ ']
                        },
                        {
                            e: ['a', 'I don\'t know what to select!'],
                            a: [[A.Class, 'u hand']],
                            v: [[EventType.Click, () => super.ShowModal(new HelpSelectBoss())]]
                        }
                    ]
                },
                new BackToMainSelection(subscriber, selectedBossProcessor)
            ]
        }
    }
}


