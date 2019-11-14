import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { PageData, registerPage, navigate } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { ResourceType } from "../../Enums/resource-type";

export class AdminOverviewPage implements Component {
    E: FrameworkElement

    constructor() {
        const clickModsLink = (e: Event) => {
            e.preventDefault();
            navigate(AdminLink.Mods());
        }
        const clickIsaacContentLink = (e: Event) => {
            e.preventDefault();
            navigate(AdminLink.ResourceOverview(ResourceType.Item));
        }
        const clickAddVideoLink = (e: Event) => {
            e.preventDefault();
            navigate(AdminLink.AddVideos());
        }

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'Admin Area']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Manage Mods'],
                            a: [[A.Href, AdminLink.Mods()]],
                            v: [[EventType.Click, clickModsLink]]
                        }
                    ]
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Manage Isaac Content'],
                            a: [[A.Href, AdminLink.ResourceOverview(ResourceType.Item)]],
                            v: [[EventType.Click, clickIsaacContentLink]]
                        }
                    ]
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Manually Add/Update Videos'],
                            a: [[A.Href, AdminLink.AddVideos()]],
                            v: [[EventType.Click, clickAddVideoLink]]
                        }
                    ]
                }
            ]
        }
    }

    static RegisterPage() {
        const data: PageData = {
            Component: AdminOverviewPage,
            Title: 'Admin Overview',
            Url: ['Admin', 'Overview']
        }
        registerPage(data)
    }
}