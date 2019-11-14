import { Component, FrameworkElement, A, EventType, AsyncComponentPart } from "../../Framework/renderer";
import { PageData, registerPage, navigate } from "../../Framework/router";
import { get } from "../../Framework/http";
import { Mod } from "../../Models/mod";
import { DeleteModButton } from "../../Components/Admin/delete-mod-button";
import { AdminLink } from "./_admin-link-creator";

export class ModsPage implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    constructor() {
        const clickCreateMod = (e: Event) => {
            e.preventDefault();
            navigate(AdminLink.CreateMod());
        }

        const asyncContainerId = 'mods-list';

        this.E = {
            e: ['div'],
            a: [[A.Id, asyncContainerId]],
            c: [
                {
                    e: ['h1', 'Mods']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Create a new Mod'],
                            a: [[A.Href, AdminLink.CreateMod()]],
                            v: [[EventType.Click, clickCreateMod]]
                        }
                    ]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['div']
                }
            ]
        };

        this.A = this.LoadModsAndCreateTable(asyncContainerId);
    }

    private LoadModsAndCreateTable(containerId: string): Array<AsyncComponentPart> {
        const part: AsyncComponentPart = {
            A: true,
            I: containerId,
            P: get<Array<Mod>>('/Api/Mods').then(mods => this.CreateModsTable(mods))
        };
        return [part];
    }

    private CreateModsTable(mods: Array<Mod>): FrameworkElement {

        const lines = new Array<FrameworkElement>();

        for (const mod of mods) {
            const modClickEvent = (e: Event) => {
                e.preventDefault();
                if (mod.id) {
                    navigate(AdminLink.Mod(mod.id));
                }
            };

            let linkText = '0 Links';
            if (mod.links && mod.links.length === 1) {
                linkText = '1 Link';
            } else if (mod.links && mod.links.length > 1) {
                linkText = `${mod.links.length} links`
            }
            

            lines.push({
                e: ['tr'],
                c: [
                    {
                        e: ['td', typeof (mod.id) === 'number' ? mod.id.toString(10) : '']
                    },
                    {
                        e: ['td'],
                        c: [
                            {
                                e: ['a', mod.name],
                                a: [mod.id ? [A.Href, AdminLink.Mod(mod.id)] : null],
                                v: [[EventType.Click, modClickEvent]]
                            }
                        ]
                    },
                    {
                        e: ['td', linkText]
                    },
                    {
                        e: ['td'],
                        c: [new DeleteModButton(mod)]
                    }
                ]
            });
        }

        return {
            e: ['table'],
            c: [
                {
                    e: ['thead'],
                    c: [
                        {
                            e: ['tr'],
                            c: [
                                {
                                    e: ['th', 'Id']
                                },
                                {
                                    e: ['th', 'Mod Name']
                                },
                                {
                                    e: ['th'],
                                    a: [[A.Colspan, '2']]
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
        }
    }

    static RegisterPage() {
        const page: PageData = {
            Component: ModsPage,
            Title: 'Mods',
            Url: ['Admin', 'Mods']
        };
        registerPage(page);
    }
}