import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { navigate } from "../../Framework/router";

export function navSection(px, url, text) {
    const iconStyle = `background: url('/img/gameplay_events.png') -${px}px 0 transparent`;

    return 
}

export class NavSection implements Component {

    E: FrameworkElement;

    constructor(px: number, url: string, text: string) {
        const iconStyle = `background: url('/img/gameplay_events.png') -${px}px 0 transparent`;

        this.E = {
            e: ['a'],
            a: [[A.Href, url], [A.Class, 'nav-point hand']],
            v: [[EventType.Click, e => this.Navigate(url, e)]],
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

    private Navigate(link: string, e: Event) {
        navigate(link, e);
    }
}

