import { Component, FrameworkElement, Attribute } from "../../Framework/renderer";

export class MainComponent implements Component {
    E: FrameworkElement;

    constructor() {
        this.E = {
            e: ['main'],
            a: [[Attribute.Class, 'w80'], [Attribute.Id, 'main-container']]
        }
    }
}