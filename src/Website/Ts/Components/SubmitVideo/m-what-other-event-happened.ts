import { ComponentWithSubscribers } from "../../Framework/ComponentBaseClasses/component-with-subscribers";
import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { BackToMainSelection } from "./back-to-main-selection";

export class WhatOtherEventHappened<TSubscriber extends Object> extends ComponentWithSubscribers<TSubscriber, 'clicker' | 'reroll-transform'> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectionProcessor: (selection: string) => any
    ) {
        super(subscriber, selectionProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What other event happened?']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'NL used the CLICKER'],
                            a: [[A.Class, 'u hand']],
                            v: [[EventType.Click, () => super.Emit('clicker')]]
                        }
                    ]
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'NL REROLLED his character, and a TRANSFORMATION happened!'],
                            a: [[A.Class, 'u hand']],
                            v: [[EventType.Click, () => super.Emit('reroll-transform')]]
                        }
                    ]
                },
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, selectionProcessor)
            ]
        }
    }
}

