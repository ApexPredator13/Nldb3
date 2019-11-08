import { Component, FrameworkElement, Attribute } from "../../Framework/renderer";

export class Option implements Component {
    E: FrameworkElement;
    constructor(value: string, text: string, selected?: boolean) {
        this.E = {
            e: ['option', text],
            a: [[Attribute.Value, value], selected ? [Attribute.Selected, 'true'] : null]
        }
    }
}