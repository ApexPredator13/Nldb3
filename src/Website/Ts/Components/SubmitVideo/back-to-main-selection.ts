import { ComponentWithSubscribers } from "../../Framework/ComponentBaseClasses/component-with-subscribers";
import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";

export class BackToMainSelection<TSubscriber> extends ComponentWithSubscribers<string, TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(caller: ThisType<TSubscriber>, backToMainSignalProcessor: (signal: string) => any) {
        super(caller, backToMainSignalProcessor);

        this.E = {
            e: ['p'],
            c: [
                {
                    e: ['span', '← ']
                },
                {
                    e: ['a', 'Back to Selection'],
                    a: [[A.Class, 'hand u']],
                    v: [[EventType.Click, () => super.Emit('')]]
                }
            ]
        }
    }
}

