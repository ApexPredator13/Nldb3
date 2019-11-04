import { Component, FrameworkElement } from "../../Framework/renderer";

export class NavigationComponent implements Component {
    E: FrameworkElement;

    constructor() {
        this.E = {
            e: ['div', 'placeholder']
        }
    }
}

