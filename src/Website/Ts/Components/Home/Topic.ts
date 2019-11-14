import { Component, A, FrameworkElement, EventType } from "../../Framework/renderer";
import { navigate } from "../../Framework/router";

export class TopicComponent implements Component {

    E: FrameworkElement;

    constructor(title: string, yOffset: string, url: string) {
        const clickEvent = () => {
            navigate(url);
        };

        this.E = {
            e: ['div'],
            a: [[A.Class, 'topic']],
            c: [
                {
                    e: ['div'],
                    a: [[A.Style, `background: url('/img/frontpage.png') 0px ${yOffset}px transparent`]]
                },
                { e: ['p', title] }
            ],
            v: [[EventType.Click, clickEvent]]
        };
    }
}


