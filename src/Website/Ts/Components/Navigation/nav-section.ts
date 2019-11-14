import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { navigate } from "../../Framework/router";

export class NavSection implements Component {

    E: FrameworkElement;

    constructor(px: number, url: string, text: string) {
        const iconStyle = `background: url('/img/gameplay_events.png') -${px}px 0 transparent`;

        const clickEvent = (e: Event) => {
            e.preventDefault();

            navigate(url);
        }

        this.E = {
            e: ['a'],
            a: [[A.Href, url], [A.Class, 'nav-point']],
            v: [[EventType.Click, clickEvent]],
            c: [
                {
                    e: ['div'],
                    a: [[A.Class, 'nav-icon'], [A.Style, iconStyle]]
                },
                {
                    e: ['span', text],
                }
            ]
        }
    }
}

