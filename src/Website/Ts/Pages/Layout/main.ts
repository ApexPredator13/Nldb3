import { Component, FrameworkElement, A } from "../../Framework/renderer";

export class MainComponent implements Component {
    E: FrameworkElement;

    constructor() {
        this.E = {
            e: ['main'],
            a: [[A.Class, 'w80'], [A.Id, 'main-container']]
        }
    }
}