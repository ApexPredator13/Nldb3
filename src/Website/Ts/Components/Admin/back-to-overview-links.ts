import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { navigate } from "../../Framework/router";
import { AdminLink } from "../../Pages/Admin/_admin-link-creator";

export class BackToOverviewLinks implements Component {
    E: FrameworkElement;
    
    constructor() {
        const backToOverviewClick = (e: Event) => {
            e.preventDefault();
            navigate(AdminLink.AdminOverview());
        };

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', '← Back to Overview'],
                            a: [[A.Href, AdminLink.AdminOverview()]],
                            v: [[EventType.Click, backToOverviewClick]]
                        }
                    ]
                }
            ]
        }
    }
}

