import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { goToRouteWithUrl } from "../../Framework/router";

export class BackToOverviewLinks implements Component {
    E: FrameworkElement;
    
    constructor() {
        const backToOverviewClick = (e: Event) => {
            e.preventDefault();
            goToRouteWithUrl('/Admin/Overview');
        };

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', '← Back to Overview'],
                            a: [[A.Href, '/Admin/Overview']],
                            v: [[EventType.Click, backToOverviewClick]]
                        }
                    ]
                }
            ]
        }
    }
}