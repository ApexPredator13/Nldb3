import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { getPageData, PageData, registerPage, goToRouteWithUrl } from "../../Framework/router";

export class ModDeleted implements Component {
    E: FrameworkElement;

    constructor() {
        const modName = getPageData();

        const backToMods = (e: Event) => {
            e.preventDefault();
            goToRouteWithUrl('/Admin/Mods');
        }

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['p', `Mod with name ${modName} was deleted.`]
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Back to Mods'],
                            a: [[A.Href, '/Admin/Mods']],
                            v: [[EventType.Click, backToMods]]
                        }
                    ]
                }
            ]
        }
    }

    static RegisterPage() {
        const data: PageData = {
            Urls: ['/Admin/ModDeleted'],
            AppendTo: 'main-container',
            Component: ModDeleted,
            Title: 'Mod Deleted'
        };
        registerPage('mod-deleted', data);
    }
}

