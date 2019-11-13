import { Component, FrameworkElement, A } from "../../Framework/renderer";

export class Option implements Component {
    E: FrameworkElement;
    constructor(value: string, text: string, selected?: boolean) {
        this.E = {
            e: ['option', text],
            a: [[A.Value, value], selected ? [A.Selected, 'true'] : null]
        }
    }
}