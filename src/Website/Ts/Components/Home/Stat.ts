import { Component, FrameworkElement, Attribute } from "../../Framework/renderer";

class StatImageComponent implements Component {

    E: FrameworkElement;

    constructor(xOffset: string, yOffset: string) {
        this.E = {
            e: ['div'],
            a: [[Attribute.Class, 'fp-right'], [Attribute.Style, `background: url('/img/frontpage.png') ${xOffset}px ${yOffset}px transparent; width: 50px; height: 50px`]]
        }
    }
}

class StatTextComponent implements Component {

    E: FrameworkElement;

    constructor(text: string) {
        this.E = {
            e: ['div', text],
            a: [[Attribute.Class, 'fp-left l']]
        };
    }
}

class StatsHeaderComponent implements Component {

    E: FrameworkElement;

    constructor(text: string) {
        this.E = {
            e: ['div'],
            a: [[Attribute.Class, 'fp-stats-header']],
            c: [
                {
                    e: ['h3', text]
                }
            ]
        };
    }
}

export {
    StatImageComponent,
    StatTextComponent,
    StatsHeaderComponent
}

