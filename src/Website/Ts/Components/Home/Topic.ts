import { Component, Attribute, FrameworkElement, EventType } from "../../Framework/renderer";
import { goToRouteWithUrl, setPageData } from "../../Framework/router";

export class TopicComponent implements Component {

    E: FrameworkElement;

    constructor(title: string, yOffset: string, url: string, pageData?: any) {
        const clickEvent = () => {
            if (pageData) {
                setPageData('resource-overview', pageData);
            }
            goToRouteWithUrl(url);
        };

        this.E = {
            e: ['div'],
            a: [[Attribute.Class, 'topic']],
            c: [
                {
                    e: ['div'],
                    a: [[Attribute.Style, `background: url('/img/frontpage.png') 0px ${yOffset}px transparent`]]
                },
                { e: ['p', title] }
            ],
            v: [[EventType.Click, clickEvent]]
        };
    }
}


