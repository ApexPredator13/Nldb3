import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { ComponentWithSubscribers } from "../../Framework/ComponentBaseClasses/component-with-subscribers";

export class DidNlShowTheSeed<TSubscriber extends Object> extends ComponentWithSubscribers<TSubscriber, string> implements Component {
    E: FrameworkElement;

    constructor(caller: TSubscriber, seedProcessor1: (seed: string) => any, seedProcessor2: (seed: string) => any) {
        super(caller, seedProcessor1, seedProcessor2);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'Did NL show the seed?']
                },
                {
                    e: ['p', 'if so, you can enter it here:']
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['div'],
                            a: [[A.Class, 'display-inline']],
                            c: [
                                {
                                    e: ['input'],
                                    a: [[A.Type, 'text'], [A.MaxLength, '4'], [A.Id, 'seed-1'], [A.Size, '4']],
                                    v: [[EventType.Input, e => { this.Uppercase(e); this.ValidateSeed(); }]]
                                },
                                {
                                    e: ['input'],
                                    a: [[A.Type, 'text'], [A.MaxLength, '4'], [A.Id, 'seed-2'], [A.Size, '4']],
                                    v: [[EventType.Input, e => { this.Uppercase(e); this.ValidateSeed() }]]
                                }
                            ]
                        },
                        {
                            e: ['button', 'Use this seed!'],
                            a: [[A.Disabled, 'true'], [A.Id, 'submit-seed-button']],
                            v: [[EventType.Click, e => this.SubmitSeed(e)]]
                        }
                    ]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['button', 'No, Skip!'],
                            v: [[EventType.Click, () => this.SkipSeed()]]
                        }
                    ]
                }
            ]
        }
    }

    private SkipSeed() {
        super.Emit('');
    }

    private ValidateSeed() {
        const inputFields = this.GetInputFields();

        const button = document.getElementById('submit-seed-button');
        if (!button || !(button instanceof HTMLButtonElement)) {
            return;
        }

        if (inputFields && inputFields.length === 2 && inputFields[0].value.length === 4 && inputFields[1].value.length === 4) {
            button.disabled = false;
            return true;
        }

        button.disabled = true;
        return false;
    }

    private Uppercase(e: Event) {
        const target = e.target;
        if (target && target instanceof HTMLInputElement) {
            target.value = target.value.toUpperCase();
        }
    }

    private SubmitSeed(e: Event) {
        e.preventDefault();
        const seedIsValid = this.ValidateSeed();

        const target = e.target;
        if (target && target instanceof HTMLButtonElement) {
            target.disabled = true;
        }

        if (seedIsValid) {
            const inputFields = this.GetInputFields();
            if (inputFields && inputFields.length === 2) {
                super.Emit(`${inputFields[0].value}${inputFields[1].value}`);
            }
        }
    }

    private GetInputFields() {
        const part1 = document.getElementById('seed-1');
        const part2 = document.getElementById('seed-2');

        if (part1 && part1 instanceof HTMLInputElement && part2 && part2 instanceof HTMLInputElement) {
            return [part1, part2];
        }

        return null;
    }
}