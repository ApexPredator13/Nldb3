import { Component, FrameworkElement, EventType, A, AsyncComponentPart } from "../../Framework/renderer";
import { existsInOptionlist, gameModeOptionList, resourceTypeOptionList, tagsOptionList } from "../../Components/Admin/option-lists";
import { GameMode } from "../../Enums/game-mode";
import { ResourceType } from "../../Enums/resource-type";
import { get } from "../../Framework/http";
import { Mod } from "../../Models/mod";
import { Option } from "../../Components/General/option";
import { ExistsIn } from "../../Enums/exists-in";
import { PageData, registerPage } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { ComponentWithForm } from "../../Framework/ComponentBaseClasses/component-with-form";

export class CreateIsaacResource extends ComponentWithForm implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    constructor() {
        super();

        this.E = {
            e: ['div'],
            a: [[A.Id, 'form-container']]
        }

        this.A = this.CreateAsyncPart();
    }


    private CreateAsyncPart(): Array<AsyncComponentPart> {

        const part: AsyncComponentPart = {
            I: 'form-container',
            P: get<Array<Mod>>('/Api/Mods').then(mods => {

                if (!mods) {
                    const failedToLoadMods: FrameworkElement = {
                        e: ['div', 'Failed to load mods']
                    };
                    return failedToLoadMods;
                }

                const modOptionList = mods.map(mod => new Option(mod.id ? mod.id.toString(10) : '', mod.name))
                modOptionList.unshift(new Option('', 'No Mod', true));

                return {
                    e: ['div'],
                    c: [
                        {
                            e: ['h1', 'Create new Resource']
                        },
                        {
                            e: ['hr']
                        },
                        {
                            e: ['form'],
                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/create_resource', true, AdminLink.EditResource(super.GetFormValue('new-resource-id')))]],
                            a: [[A.Enctype, 'multipart/form-data'], [A.Method, 'post']],
                            c: [
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Id']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'text'],
                                                [A.Name, 'Id'],
                                                [A.Id, 'new-resource-id'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'The resource id is required'],
                                                [A.MaxLength, '30'],
                                                [A.MaxLengthErrorMessage, 'The resource id cannot be longer than 30 characters']
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Name']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'text'],
                                                [A.Name, 'Name'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'Please enter a name!']
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Exists In']
                                        },
                                        {
                                            e: ['select'],
                                            a: [
                                                [A.Name, 'ExistsIn'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'please select the version in which this resource exists']
                                            ],
                                            c: existsInOptionlist(ExistsIn.EveryVersion),
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Icon']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'file'],
                                                [A.Name, 'Icon'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'Please specify an icon']
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Game Mode Exclusivity']
                                        },
                                        {
                                            e: ['select'],
                                            a: [
                                                [A.Name, 'GameMode'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'Please select in which game modes the resource can be found in']
                                            ],
                                            c: gameModeOptionList(GameMode.AllModes),
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Color']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'text'],
                                                [A.Name, 'Color'],
                                                [A.Value, '#'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'Please enter a color or a color name'],
                                                [A.MinLength, '2'],
                                                [A.MinLengthErrorMessage, 'Please enter a valid color']
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Resource Type']
                                        },
                                        {
                                            e: ['select'],
                                            a: [
                                                [A.Name, 'ResourceType'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'Please enter what type of resource this is']
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]],
                                            c: resourceTypeOptionList(ResourceType.Item)
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Mod']
                                        },
                                        {
                                            e: ['select'],
                                            a: [[A.Name, 'FromMod']],
                                            c: modOptionList,
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Display Order']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'number'],
                                                [A.Name, 'DisplayOrder'],
                                                [A.Value, '']
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Difficulty']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'number'],
                                                [A.Name, 'Difficulty'],
                                                [A.Value, '']
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Tags'],
                                        },
                                        {
                                            e: ['select'],
                                            a: [[A.Name, 'Tags'], [A.Multiple, 'true'], [A.Size, '30']],
                                            c: tagsOptionList(),
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['button', 'Save'],
                                            a: [[A.Type, 'submit'], [A.Disabled, 'true']]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            })
        };

        return [part];
    }

    static RegisterPage() {
        const page: PageData = {
            Component: CreateIsaacResource,
            Title: 'create new resource',
            Url: ['Admin', 'CreateResource']
        }
        registerPage(page);
    }
}

