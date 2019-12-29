import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { AdminLink } from "./_admin-link-creator";
import { ResourceType } from "../../Enums/resource-type";
import { navigate, PageData, registerPage } from "../../Framework/router";
import { BackToOverviewLinks } from "../../Components/Admin/go-back-links";

export class ResourceDeleted implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', `Resource '${parameters[1]}' was deleted.`]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', '← Back to resource overview'],
                            a: [[A.Href, AdminLink.ResourceOverview(Number(parameters[0]) as ResourceType)]],
                            v: [[EventType.Click, e => navigate(AdminLink.ResourceOverview(Number(parameters[0])), e)]]
                        }
                    ]
                },
                new BackToOverviewLinks()
            ]
        }
    }

    static RegisterPage() {
        const data: PageData = {
            Title: 'Resource Deleted',
            Component: ResourceDeleted,
            Url: ['Admin', 'ResourceDeleted', '{resourceType}', '{resourceId}']
        };
        registerPage(data);
    }
}

