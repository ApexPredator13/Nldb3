import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { YoutubePlayer } from "./youtube-player";
import { SearchboxComponent } from "../General/searchbox";
import { BackToMainSelection } from "./back-to-main-selection";
import { ComponentWithModal } from "../../Framework/ComponentBaseClasses/component-with-modal";
import { HelpSelectItem } from "./help-select-item";
import { HelpSelectTouchedItem } from "./help-select-touched-item";
import { HelpSelectAbsorbedItem } from "./help-select-absorbed-item";

export class WhatItemWasCollected<TSubscriber extends Object> extends ComponentWithModal implements Component {
    E: FrameworkElement;

    constructor(
        private subscriber: TSubscriber,
        items: Promise<Array<IsaacResource> | null>,
        selectedItemProcessor: (id: string) => any,
        private itemWasRerolledCheckboxProcessor: (wasRerolled: boolean) => any,
        youtubePlayer: YoutubePlayer,
        touched: boolean,
        absorbed: boolean
    ) {
        super(youtubePlayer);
        const itemSeachBox = new SearchboxComponent<TSubscriber>(subscriber, 10, items, false);
        itemSeachBox.Subscribe(selectedItemProcessor);

        let h2Text = 'What item was collected?';
        if (touched) {
            h2Text = 'What item did NL touch and put down again?';
        } else if (absorbed) {
            h2Text = 'What item did NL absorb with another item?'
        }

        let help: Component = new HelpSelectItem();
        if (touched) {
            help = new HelpSelectTouchedItem();
        } else if (absorbed) {
            help = new HelpSelectAbsorbedItem();
        }

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', h2Text]
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['input'],
                            a: [[A.Type, 'checkbox']],
                            v: [[EventType.Input, e => this.CheckboxEvent(e)]]
                        },
                        {
                            e: ['span', 'this item was rerolled into']
                        }
                    ]
                },
                itemSeachBox,
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
                            v: [[EventType.Click, () => super.ShowModal(help)]]
                        }
                    ]
                },
                new BackToMainSelection<TSubscriber>(subscriber, selectedItemProcessor)
            ]
        }
    }

    private CheckboxEvent(e: Event) {
        const target = e.target;
        if (target && target instanceof HTMLInputElement) {
            const processor = this.itemWasRerolledCheckboxProcessor.bind(this.subscriber);
            processor(target.checked);
        }
    }
}

