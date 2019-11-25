import { ComponentWithSubscribers } from "../../Framework/ComponentBaseClasses/component-with-subscribers";
import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { removeHistoryElement } from "./history-table";

export class WarningRemovingCharacterFromHistory<TSubscriber> extends ComponentWithSubscribers<removeHistoryElement | null, TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        caller: ThisType<TSubscriber>,
        signalProcessor: (signal: removeHistoryElement | null) => any,
        private historyElementInQuestion: removeHistoryElement
    ) {
        super(caller, signalProcessor);

        this.E = {
            e: ['div'],
            a: [[A.Class, 'modal-container']],
            c: [
                {
                    e: ['h2', 'Warning!']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['p', 'Removing the character will also remove all floors and collected items the character has gone through.']
                },
                {
                    e: ['p', 'Really delete the character?']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['button', 'No, Cancel!'],
                            a: [[A.Class, 'btn-yellow'], [A.Id, 'cancel']],
                            v: [[EventType.Click, e => this.ButtonClick(e)]]
                        },
                        {
                            e: ['button', 'Yes, Really!'],
                            a: [[A.Class, 'btn-red'], [A.Id, 'confirm']],
                            v: [[EventType.Click, e => this.ButtonClick(e)]]
                        }
                    ]
                }
            ]
        }
    }

    private ButtonClick(e: Event) {
        const target = e.target;
        if (target && target instanceof HTMLButtonElement) {
            if (target.id === 'cancel') {
                console.log('cancel');
                super.Emit(null);
            } else if (target.id === 'confirm') {
                console.log('confirm');
                super.Emit(this.historyElementInQuestion);
            }
        }
    }
}


