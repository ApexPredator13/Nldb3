import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { PageData, registerPage, navigate } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { BackToOverviewLinks } from "../../Components/Admin/back-to-overview-links";

export class ModDeleted implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        const backToMods = (e: Event) => {
            e.preventDefault();
            navigate(AdminLink.Mods());
        }

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['p', `Mod with name ${parameters[0]} was deleted.`]
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Back to Mods'],
                            a: [[A.Href, AdminLink.Mods()]],
                            v: [[EventType.Click, backToMods]]
                        },
                        new BackToOverviewLinks()
                    ]
                }
            ]
        }
    }

    static RegisterPage() {
        const data: PageData = {
            Url: ['Admin', 'ModDeleted', '{modName}'],
            Component: ModDeleted,
            Title: 'Mod Deleted'
        };
        registerPage(data);
    }
}

