import { Component, FrameworkElement } from "../../Framework/renderer";
import { getPageData, PageData, registerPage } from "../../Framework/router";
import { BackToOverviewLinks } from "../../Components/Admin/back-to-overview-links";

export class ModLinkDeleted implements Component {
    E: FrameworkElement;

    constructor() {
        const linkDisplayName = getPageData<string>();

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
            AppendTo: 'main-container',
            Component: ModLinkDeleted,
            Title: 'Link Deleted',
            Urls: ['/Admin/ModLinkDeleted']
        }
        registerPage('mod-link-deleted', data);
    }
}

