import { Component, FrameworkElement, Attribute, EventType } from "../../Framework/renderer";
import { PageData, registerPage, goToRouteWithUrl } from "../../Framework/router";

export class AdminOverview implements Component {
    E: FrameworkElement

    constructor() {
        const clickModsLink = (e: Event) => {
            e.preventDefault();
            goToRouteWithUrl('/Admin/Mods');
        }
        const clickIsaacContentLink = (e: Event) => {
            e.preventDefault();
            goToRouteWithUrl('/Admin/Isaac/');
        }
        const clickAddVideoLink = (e: Event) => {
            e.preventDefault();
            goToRouteWithUrl('/Admin/AddVideos');
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
                            a: [[Attribute.Href, '/Admin/Mods']],
                            v: [[EventType.Click, clickModsLink]]
                        }
                    ]
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Manage Isaac Content'],
                            a: [[Attribute.Href, '/Admin/Isaac']],
                            v: [[EventType.Click, clickIsaacContentLink]]
                        }
                    ]
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Manually Add/Update Videos'],
                            a: [[Attribute.Href, '/Admin/AddVideos']],
                            v: [[EventType.Click, clickAddVideoLink]]
                        }
                    ]
                }
            ]
        }
    }

    static RegisterPage() {
        const data: PageData = {
            AppendTo: 'main-container',
            Component: AdminOverview,
            Title: 'Admin Overview',
            Urls: ['/Admin/Overview']
        }
        registerPage('admin-overview', data)
    }
}