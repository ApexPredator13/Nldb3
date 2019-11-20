import { Component, FrameworkElement, A } from "../../renderer";

export class OtherElements implements Component {
    E: FrameworkElement;

    constructor() {
        this.E = {
            e: ['div'],
            a: [[A.Id, 'modal'], [A.Class, 'display-none']]
        }
    }
}

