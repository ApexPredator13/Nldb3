import { Component, FrameworkElement, EventType, A } from "../../Framework/renderer";
import { ComponentWithModal } from "../../Framework/ComponentBaseClasses/component-with-modal";

export class DismissModal extends ComponentWithModal implements Component {
    E: FrameworkElement;

    constructor() {
        super();
        this.E = {
            e: ['p'],
            c: [
                {
                    e: ['a', 'Dismiss'],
                    a: [[A.Class, 'u hand']],
                    v: [[EventType.Click, () => super.DismissModal()]]
                }
            ]
        };
    }
}

