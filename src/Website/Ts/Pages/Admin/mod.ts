import { Component, FrameworkElement, AsyncComponentPart, A, EventType } from "../../Framework/renderer";
import { PageData, registerPage, navigate } from "../../Framework/router";
import { get } from "../../Framework/http";
import { Mod } from "../../Models/mod";
import { ModUrl } from "../../Models/mod-url";
import { DeleteModLinkButton } from "../../Components/Admin/delete-mod-link-button";
import { AdminLink } from "./_admin-link-creator";

export class ModPage implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    private modId: number | undefined;

    constructor(parameters: Array<string>) {
        const modId = Number(parameters[0]);
        console.log('page data', modId);
        if (typeof (modId) === 'number') {
            this.modId = modId;
        }

        this.E = {
            e: ['div', 'loading mod...'],
            a: [[A.Id, 'mod-container']]
        }

        this.A = this.LoadMod();
    }

    private LoadMod(): Array<AsyncComponentPart> {

        
        const part: AsyncComponentPart = {
            I: 'mod-container',
            P: this.modId ? get<Mod>(`/Api/Mods/${this.modId}`).then(mod => {

                const clickAddLinkEvent = (e: Event) => {
                    e.preventDefault();
                    if (typeof (this.modId) === 'number') {
                        navigate(AdminLink.CreateLink(this.modId));
                    }
                };

                return {
                    e: ['div'],
                    c: [
                        {
                            e: ['h1', `Overview for ${mod.name}`]
                        },
                        {
                            e: ['hr']
                        },
                        {
                            e: ['p'],
                            c: [
                                {
                                    e: ['a'],
                                    a: [this.modId ? [A.Href, AdminLink.CreateLink(this.modId)] : null],
                                    v: [[EventType.Click, clickAddLinkEvent]]
                                }
                            ]
                        },
                        {
                            e: ['hr']
                        },
                        {
                            e: ['p', 'Existing Links']
                        },
                        this.CreateLinksTable(mod.links)
                    ]
                }
            }) : Promise.resolve({ e: ['h1', 'Mod not found'] })
        };
        return [part];
    }

    private CreateLinksTable(modLinks: Array<ModUrl> | undefined): FrameworkElement {
        if (!modLinks || modLinks.length === 0) {
            return {
                e: ['p', 'No links have been created yet.']
            };
        }

        const lines = new Array<FrameworkElement>();
        for (const link of modLinks) {
            lines.push({
                e: ['tr'],
                c: [
                    {
                        e: ['td'],
                        c: [
                            {
                                e: ['a', link.link_text],
                                a: [[A.Href, link.url], [A.Target, '_blank']]
                            }
                        ]
                    },
                    {
                        e: ['td'],
                        c: [
                            new DeleteModLinkButton(link)
                        ]
                    }
                ]
            });
        }

        const table: FrameworkElement = {
            e: ['table'],
            c: [
                {
                    e: ['thead'],
                    c: [
                        {
                            e: ['tr'],
                            c: [
                                {
                                    e: ['th', 'Link']
                                },
                                {
                                    e: ['th']
                                }
                            ]
                        }
                    ]
                },
                {
                    e: ['tbody'],
                    c: lines
                }
            ]
        };

        return table;
    }

    static RegisterPage() {
        const page: PageData = {
            Component: ModPage,
            Title: 'Mod Overview',
            Url: ['Admin', 'Mod', '{id}']
        };
        registerPage(page);
    }
}