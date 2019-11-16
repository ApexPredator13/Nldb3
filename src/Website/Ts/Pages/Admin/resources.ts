import { Component, FrameworkElement, AsyncComponentPart, A, EventType, ComponentWithForm, render } from "../../Framework/renderer";
import { PageData, registerPage, navigate, addAfterRenderActionToPage } from "../../Framework/router";
import { get } from "../../Framework/http";
import { IsaacResource } from "../../Models/isaac-resource";
import { ResourceType } from "../../Enums/resource-type";
import { AdminLink } from "./_admin-link-creator";
import { Option } from '../../Components/General/option';
import { convertGameModeToString, convertExistsInToString } from "../../Enums/enum-to-string-converters";
import { saveToLocalStorage, getFromLocalStorage } from "../../Framework/browser";
import { IsaacImage } from "../../Components/General/isaac-image";

export class ResourcesPage extends ComponentWithForm implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>

    private resourceType = ResourceType.Item;

    constructor(parameters: Array<string>) {
        super();
        this.resourceType = Number(parameters[0]) as ResourceType;

        const selectEvent = (e: Event) => {
            const target = e.target;
            if (target && target instanceof HTMLSelectElement) {
                const value = Number(target.value) as ResourceType;
                this.resourceType = value;
                saveToLocalStorage('last_selected_resource_type', value);
                this.ReloadResources();
            }
        }

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'Resource Overview']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Create a new resource'],
                            a: [[A.Href, AdminLink.CreateNewResource()]],
                            v: [[EventType.Click, e => navigate(AdminLink.CreateNewResource(), e)]]
                        }
                    ]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['select'],
                            v: [[EventType.Change, selectEvent]],
                            c: [
                                new Option('', 'Choose...'),
                                new Option(ResourceType.Boss.toString(10), 'Bosses', this.resourceType === ResourceType.Boss),
                                new Option(ResourceType.Character.toString(10), 'Characters', this.resourceType === ResourceType.Character),
                                new Option(ResourceType.CharacterReroll.toString(10), 'Character Rerolls', this.resourceType === ResourceType.CharacterReroll),
                                new Option(ResourceType.Curse.toString(10), 'Curses', this.resourceType === ResourceType.Curse),
                                new Option(ResourceType.Enemy.toString(10), 'Enemies', this.resourceType === ResourceType.Enemy),
                                new Option(ResourceType.Floor.toString(10), 'Floors', this.resourceType === ResourceType.Floor),
                                new Option(ResourceType.Item.toString(10), 'Items', this.resourceType === ResourceType.Item),
                                new Option(ResourceType.ItemSource.toString(10), 'Item Sources', this.resourceType === ResourceType.ItemSource),
                                new Option(ResourceType.OtherConsumable.toString(10), 'Other Consumable', this.resourceType === ResourceType.OtherConsumable),
                                new Option(ResourceType.Pill.toString(10), 'Pills', this.resourceType === ResourceType.Pill),
                                new Option(ResourceType.Rune.toString(10), 'Runes', this.resourceType === ResourceType.Rune),
                                new Option(ResourceType.TarotCard.toString(10), 'Tarot Cards', this.resourceType === ResourceType.TarotCard),
                                new Option(ResourceType.Transformation.toString(10), 'Transformations', this.resourceType === ResourceType.Transformation),
                                new Option(ResourceType.Trinket.toString(10), 'Trinkets', this.resourceType === ResourceType.Trinket),
                                new Option(ResourceType.Unspecified.toString(10), 'Unspecified', this.resourceType === ResourceType.Unspecified)
                            ]
                        }
                    ]
                },
                {
                    e: ['div', 'loading resources...'],
                    a: [[A.Id, 'loaded-resources']]
                }
            ]
        };

        this.A = this.LoadResources();
    }

    private LoadResources(): Array<AsyncComponentPart> {
        const part: AsyncComponentPart = {
            I: 'loaded-resources',
            P: get<Array<IsaacResource>>(`/Api/Resources/?ResourceType=${this.resourceType.toString(10)}&IncludeMod=true`).then(resources => {

                const tableLines = new Array<FrameworkElement>();

                for (const resource of resources) {
                    const clickEvent = (e: Event) => {
                        saveToLocalStorage('resource-position', { position: window.scrollY });
                        addAfterRenderActionToPage(AdminLink.ResourceOverview(this.resourceType), () => {
                            const lastScrollposition = getFromLocalStorage<{ position: number }>('resource-position');
                            if (lastScrollposition) {
                                console.log('scrolling to:', lastScrollposition.position);
                                window.scrollTo(0, lastScrollposition.position);
                            }
                        });
                        
                        navigate(AdminLink.EditResource(resource.id), e);
                    };

                    tableLines.push({
                        e: ['tr'],
                        c: [
                            {
                                e: ['td'],
                                c: [
                                    new IsaacImage(resource, undefined, undefined, false),
                                ]
                            },
                            {
                                e: ['td'],
                                c: [
                                    {
                                        e: ['a', resource.name],
                                        a: [[A.Href, AdminLink.EditResource(resource.id)]],
                                        v: [[EventType.Click, clickEvent]]
                                    }
                                ]
                            },
                            {
                                e: ['td', resource.id]
                            },
                            {
                                e: ['td', convertGameModeToString(resource.game_mode)]
                            },
                            {
                                e: ['td', convertExistsInToString(resource.exists_in)]
                            },
                            {
                                e: ['td', `x: ${resource.x}, y: ${resource.y}, w: ${resource.w}, h: ${resource.h}`]
                            },
                            {
                                e: ['td'],
                                c: [
                                    {
                                        e: ['span', resource.color],
                                        a: [[A.Style, `color: ${resource.color} !important;`]]
                                    }
                                ]
                            },
                            {
                                e: ['td', resource.mod ? resource.mod.name : '']
                            },
                            {
                                e: ['td', typeof(resource.display_order) === 'number' ? resource.display_order.toString(10) : '']
                            },
                            {
                                e: ['td', typeof (resource.difficulty) === 'number' ? resource.difficulty.toString(10) : '']
                            },
                            {
                                e: ['td', resource.tags ? resource.tags.map(tag => tag.toString(10)).join(', ') : '']
                            },
                        ]
                    });
                }

                const result: FrameworkElement = {
                    e: ['table'],
                    c: [
                        {
                            e: ['thead'],
                            c: [
                                {
                                    e: ['tr'],
                                    c: [
                                        {
                                            e: ['th', 'Icon']
                                        },
                                        {
                                            e: ['th', 'Name']
                                        },
                                        {
                                            e: ['th', 'Id']
                                        },
                                        {
                                            e: ['th', 'Game Mode']
                                        },
                                        {
                                            e: ['th', 'Exists In']
                                        },
                                        {
                                            e: ['th', 'Image Coordinates']
                                        },
                                        {
                                            e: ['th', 'Color']
                                        },
                                        {
                                            e: ['th', 'Mod']
                                        },
                                        {
                                            e: ['th', 'Order']
                                        },
                                        {
                                            e: ['th', 'Difficulty']
                                        },
                                        {
                                            e: ['th', 'Tags']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['tbody'],
                            c: tableLines
                        }
                    ]
                };
                return result;
            })
        }

        return [part];
    }


    private ReloadResources() {
        const result = this.LoadResources();

        if (result[0]) {
            result[0].P.then(e => {
                const html = render(e);
                if (html) {
                    const container = document.getElementById('loaded-resources');
                    if (container) {
                        container.innerHTML = '';
                        container.appendChild(html)
                    }
                }
            });
        }
    }


    static RegisterPage() {
        const page: PageData = {
            Component: ResourcesPage,
            Title: 'Resources',
            Url: ['Admin', 'Resources', '{type}']
        };
        registerPage(page);
    }
}


