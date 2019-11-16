import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { PageData, registerPage, navigate } from "../../Framework/router";
import { BackToOverviewLinks } from "../../Components/Admin/back-to-overview-links";
import { AdminLink } from "./_admin-link-creator";

export class ModLinkDeletedPage implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        const modId = Number(parameters[0]);
        const linkDisplayName = parameters[1];

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', `Link '${linkDisplayName}' was deleted.`]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Back to mod'],
                            a: [[A.Href, AdminLink.Mod(modId)]],
                            v: [[EventType.Click, e => navigate(AdminLink.Mod(modId), e)]]
                        }
                    ]
                },
                new BackToOverviewLinks()
            ]
        }
    }

    static RegisterPage() {
        const data: PageData = {
            Component: ModLinkDeletedPage,
            Title: 'Link Deleted',
            Url: ['Admin', 'ModLinkDeleted', '{modId}', '{name}']
        }
        registerPage(data);
    }
}

