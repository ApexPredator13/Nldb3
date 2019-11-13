import { Component, FrameworkElement, A, EventType, AsyncComponentPart } from "../../Framework/renderer";
import { PageData, registerPage, goToRouteWithUrl, setPageData } from "../../Framework/router";
import { get } from "../../Framework/http";
import { Mod } from "../../Models/mod";
import { DeleteModButton } from "../../Components/Admin/delete-mod-button";

export class Mods implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    constructor() {
        const clickCreateMod = (e: Event) => {
            e.preventDefault();
            goToRouteWithUrl('/Admin/CreateMod');
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
                            a: [[A.Href, '/Admin/CreateMod']],
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
                setPageData('/Admin/Mod', mod.id);
                goToRouteWithUrl(`/Admin/Mod/${mod.id}`);
            };

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
                                a: [[A.Href, `/Admin/Mod/${mod.id}`]],
                                v: [[EventType.Click, modClickEvent]]
                            }
                        ]
                    },
                    {
                        e: ['td', mod.links ? `${mod.links.length.toString(10)} Links` : '0 Links']
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
            AppendTo: 'main-container',
            Component: Mods,
            Title: 'Mods',
            Urls: ['/Admin/Mods']
        };
        registerPage('mods', page);
    }
}