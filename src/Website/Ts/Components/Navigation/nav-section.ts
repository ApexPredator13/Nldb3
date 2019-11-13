import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { setPageData, goToRouteWithUrl } from "../../Framework/router";

export class NavSection implements Component {

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

