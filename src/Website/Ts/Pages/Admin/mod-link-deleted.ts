import { Component, FrameworkElement } from "../../Framework/renderer";
import { PageData, registerPage } from "../../Framework/router";
import { BackToOverviewLinks } from "../../Components/Admin/back-to-overview-links";

export class ModLinkDeletedPage implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        const linkDisplayName = parameters[0];

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['p', `Link '${linkDisplayName}' was deleted.`]
                },
                new BackToOverviewLinks()
            ]
        }
    }

    static RegisterPage() {
        const data: PageData = {
            Component: ModLinkDeletedPage,
            Title: 'Link Deleted',
            Url: ['Admin', 'ModLinkDeleted', '{name}']
        }
        registerPage(data);
    }
}

