import { Component, FrameworkElement, A } from "../../Framework/renderer";

class StatImageComponent implements Component {

    E: FrameworkElement;

    constructor(xOffset: string, yOffset: string) {
        this.E = {
            e: ['div'],
            a: [[A.Class, 'fp-right'], [A.Style, `background: url('/img/frontpage.png') ${xOffset}px ${yOffset}px transparent; width: 50px; height: 50px`]]
        }
    }
}

class StatTextComponent implements Component {

    E: FrameworkElement;

    constructor(text: string) {
        this.E = {
            e: ['div', text],
            a: [[A.Class, 'fp-left l']]
        };
    }
}

class StatsHeaderComponent implements Component {

    E: FrameworkElement;

    constructor(text: string) {
        this.E = {
            e: ['div'],
            a: [[A.Class, 'fp-stats-header']],
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

