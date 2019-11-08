import { Component, FrameworkElement, Attribute, EventType } from "../../Framework/renderer";
import { goToRouteWithUrl } from "../../Framework/router";

export class NavSectionComponent implements Component {

    E: FrameworkElement;

    constructor(px: number, href: string, text: string) {
        const iconStyle = `background: url('/img/gameplay_events.png') -${px}px 0 transparent`;

        this.E = {
            e: ['a'],
            a: [[Attribute.Href, href], [Attribute.Class, 'nav-point']],
            v: [[EventType.Click, e => { e.preventDefault(); goToRouteWithUrl(href.toLowerCase()); }]],
            c: [
                {
                    e: ['div'],
                    a: [[Attribute.Class, 'nav-icon'], [Attribute.Style, iconStyle]]
                },
                {
                    e: ['span', text],
                }
            ]
        }
    }
}

