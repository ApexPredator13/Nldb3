import { Component, FrameworkElement, A } from "../../Framework/renderer";

export class BiblethumpImage implements Component {
    E: FrameworkElement;

    constructor() {
        this.E = {
            e: ['img'],
            a: [[A.Src, '/img/biblethump.png']]
        }
    }
}