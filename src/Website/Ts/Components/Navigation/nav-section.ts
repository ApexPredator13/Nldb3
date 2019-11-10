import { Component, FrameworkElement, Attribute, EventType } from "../../Framework/renderer";
import { setPageData, goToRouteWithUrl } from "../../Framework/router";

export class NavSectionComponent implements Component {

    E: FrameworkElement;

    constructor(px: number, url: string, text: string, pageData?: any) {
        const iconStyle = `background: url('/img/gameplay_events.png') -${px}px 0 transparent`;

        const clickEvent = (e: Event) => {
            e.preventDefault();
            if (pageData) {
                setPageData('resource-overview', pageData);
            }

            goToRouteWithUrl(url);
        }

        this.E = {
            e: ['a'],
            a: [[Attribute.Href, url], [Attribute.Class, 'nav-point']],
            v: [[EventType.Click, clickEvent]],
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

