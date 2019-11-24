import { FrameworkElement, Component, AsyncComponentPart, A, EventType } from "../../Framework/renderer";
import { PageData, registerPage, navigate } from "../../Framework/router";
import { get } from "../../Framework/http";
import { Link } from "../_link-creator";
import { AdminLink } from "./_admin-link-creator";
import { IsaacImage } from "../../Components/General/isaac-image";
import { IsaacResource } from "../../Models/isaac-resource";
import { convertExistsInToString } from "../../Enums/enum-to-string-converters";
import { existsInOptionlist, tagsOptionList } from "../../Components/Admin/option-lists";
import { Mod } from "../../Models/mod";
import { Option } from "../../Components/General/option";
import { BackToOverviewLinks } from "../../Components/Admin/back-to-overview-links";
import { saveToLocalStorage, getFromLocalStorage } from "../../Framework/browser";
import { ComponentWithForm } from "../../Framework/ComponentBaseClasses/component-with-form";

export class EditResource extends ComponentWithForm implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    private stay: boolean = false
    private resourceId: string;

    constructor(parameters: Array<string>) {
        super();
        this.resourceId = parameters[0];

        const stayOnPage = getFromLocalStorage<{ stay: boolean }>('stay-on-edit-page');
        this.stay = stayOnPage ? stayOnPage.stay : false;

        const clickCheckboxEvent = (e: Event) => {
            const target = e.target;
            if (target && target instanceof HTMLInputElement) {
                this.stay = target.checked;
                saveToLocalStorage('stay-on-edit-page', { stay: target.checked });
            }
        };


        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'Stay on this page after saving changes? ']
                        },
                        {
                            e: ['input'],
                            a: [[A.Type, 'checkbox'], stayOnPage && stayOnPage.stay ? [A.Checked, 'true'] : null],
                            v: [[EventType.Click, clickCheckboxEvent]]
                        }
                    ]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['div', 'loading...'],
                    a: [[A.Id, 'resource-details-container']]
                }
            ]
            
        }

        this.A = this.CreatePage();
    }

    private GetLinkForNextPage(resource: IsaacResource) {
        return this.stay ? Link.Redirect(AdminLink.EditResource(this.resourceId)) : AdminLink.ResourceOverview(resource.resource_type);
    }

    CreatePage(): Array<AsyncComponentPart> {
        const result: AsyncComponentPart = {
            I: 'resource-details-container',
            P: Promise.all([get<Array<Mod>>('/api/mods'), get<IsaacResource>(`/api/Resources/${this.resourceId}/?includeMod=true`)]).then(([mods, resource]) => {

                if (!mods || !resource) {
                    return {
                        e: ['div', 'cannot load resource']
                    };
                }

                const page: FrameworkElement = {
                    e: ['div'],
                    c: [
                        {
                            e: ['h1', `Edit: ${resource.name}`]
                        },
                        {
                            e: ['hr']
                        },
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['h2', 'Change Name']
                                },
                                {
                                    e: ['form'],
                                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_resource_name', true, this.GetLinkForNextPage(resource), this.stay ? false : true, false)]],
                                    a: [[A.Method, 'post']],
                                    c: [
                                        {
                                            e: ['div'],
                                            a: [[A.Class, 'fc']],
                                            c: [
                                                {
                                                    e: ['label', 'Change Name']
                                                },
                                                {
                                                    e: ['input'],
                                                    a: [[A.Type, 'hidden'], [A.Name, 'ResourceId'], [A.Value, resource.id]]
                                                },
                                                {
                                                    e: ['input'],
                                                    a: [
                                                        [A.Type, 'text'],
                                                        [A.Name, 'NewName'],
                                                        [A.Value, resource.name],
                                                        [A.Required, 'true'],
                                                        [A.MaxLength, '100'],
                                                        [A.RequiredErrorMessage, 'Please enter a name'],
                                                        [A.MaxLengthErrorMessage, 'Max name length = 100 characters']
                                                    ],
                                                    v: [[EventType.Input, e => super.ValidateForm(e)]]
                                                }
                                            ]
                                        },
                                        {
                                            e: ['div'],
                                            c: [
                                                {
                                                    e: ['button', 'Change Name'],
                                                    a: [[A.Type, 'submit'], [A.Disabled, 'true']]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    e: ['hr']
                                },
                                {
                                    e: ['h2', 'Change Icon']
                                },
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['p', 'Current Icon:']
                                        },
                                        {
                                            e: ['div'],
                                            a: [[A.Style, 'background-color: rgba(255,255,255,0.2); display: inline-block; padding: 1rem; border-radius: 1rem;']],
                                            c: [
                                                new IsaacImage(resource, undefined, undefined, false),
                                                new IsaacImage(resource, undefined, undefined, true)
                                            ]
                                        },
                                        {
                                            e: ['form'],
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_icon', true, this.GetLinkForNextPage(resource), this.stay ? false : true, false)]],
                                            a: [[A.Enctype, 'multipart/form-data'], [A.Method, 'post']],
                                            c: [
                                                {
                                                    e: ['input'],
                                                    a: [[A.Type, 'hidden'], [A.Name, 'ResourceId'], [A.Value, resource.id]]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['label', 'Change Icon']
                                                        },
                                                        {
                                                            e: ['br']
                                                        },
                                                        {
                                                            e: ['input'],
                                                            a: [[A.Type, 'file'], [A.Name, 'NewIcon'], [A.Required, 'true'], [A.RequiredErrorMessage, 'Please choose a new icon']],
                                                            v: [[EventType.Change, e => super.ValidateForm(e)]]
                                                        }
                                                    ]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['button', 'Save new Icon'],
                                                            a: [[A.Type, 'submit'], [A.Disabled, 'true']]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    e: ['hr']
                                },
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['h2', 'Existance']
                                        },
                                        {
                                            e: ['p'],
                                            c: [
                                                {
                                                    e: ['span', 'This item currently exists in: ']
                                                },
                                                {
                                                    e: ['span', convertExistsInToString(resource.exists_in)],
                                                    a: [[A.Class, 'orange']]
                                                }
                                            ]
                                        },
                                        {
                                            e: ['form'],
                                            a: [[A.Method, 'post']],
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_exists_in', true, this.GetLinkForNextPage(resource), this.stay ? false : true, false)]],
                                            c: [
                                                {
                                                    e: ['input'],
                                                    a: [[A.Type, 'hidden'], [A.Name, 'ResourceId'], [A.Value, resource.id]]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['label', 'Change Existance:']
                                                        },
                                                        {
                                                            e: ['select'],
                                                            c: existsInOptionlist(resource.exists_in),
                                                            a: [[A.Required, 'true'], [A.RequiredErrorMessage, 'Please choose an option'], [A.Name, 'NewExistsIn']],
                                                            v: [[EventType.Change, e => super.ValidateForm(e)]]
                                                        }
                                                    ]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['button', 'Change Existance'],
                                                            a: [[A.Type, 'submit'], [A.Disabled, 'true']]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    e: ['hr']
                                },
                                {
                                    e: ['h2', 'Update Mod']
                                },
                                {
                                    e: ['p'],
                                    c: [
                                        {
                                            e: ['span', resource.mod ? `This resource is from a mod: ` : 'This resource does not belong to a mod']
                                        },
                                        {
                                            e: ['span', resource.mod ? resource.mod.name : ''],
                                            a: [[A.Class, 'orange']]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['form'],
                                            a: [[A.Method, 'post']],
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_mod', true, this.GetLinkForNextPage(resource), this.stay ? false : true, false)]],
                                            c: [
                                                {
                                                    e: ['input'],
                                                    a: [[A.Type, 'hidden'], [A.Name, 'ResourceId'], [A.Value, resource.id]]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['select'],
                                                            a: [[A.Name, 'ModId'], [A.Required, 'true'], [A.RequiredErrorMessage, 'Please select an option']],
                                                            v: [[EventType.Change, e => super.ValidateForm(e)]],
                                                            c: [
                                                                new Option('', 'No Mod', resource.mod ? false : true),
                                                                ...mods.map(mod => new Option(mod.id ? mod.id.toString(10) : '', mod.name, resource.mod && resource.mod.id === mod.id))
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['button', 'Change Mod'],
                                                            a: [[A.Type, 'submit'], [A.Disabled, 'true']]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    e: ['hr']
                                },
                                {
                                    e: ['h2', 'Change Color']
                                },
                                {
                                    e: ['p', 'This is the Current Color'],
                                    a: [[A.Style, `color: ${resource.color} !important;`]]
                                },
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['form'],
                                            a: [[A.Method, 'post']],
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_color', true, this.GetLinkForNextPage(resource), this.stay ? false : true, false)]],
                                            c: [
                                                {
                                                    e: ['input'],
                                                    a: [[A.Type, 'hidden'], [A.Name, 'ResourceId'], [A.Value, resource.id]]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['input'],
                                                            a: [[A.Type, 'text'], [A.Name, 'Color'], [A.Required, 'true'], [A.RequiredErrorMessage, 'Please select a color!'], [A.Value, '#']],
                                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                                        }
                                                    ]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['button', 'Change Color'],
                                                            a: [[A.Type, 'submit'], [A.Disabled, 'true']]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    e: ['hr']
                                },
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['h2', 'Edit Tags']
                                        },
                                        {
                                            e: ['form'],
                                            a: [[A.Method, 'post']],
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_tags', true, this.GetLinkForNextPage(resource), this.stay ? false : true, false)]],
                                            c: [
                                                {
                                                    e: ['input'],
                                                    a: [[A.Type, 'hidden'], [A.Name, 'ResourceId'], [A.Value, resource.id]]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['select'],
                                                            a: [[A.Name, 'Tags'], [A.Multiple, 'true'], [A.Size, '30']],
                                                            v: [[EventType.Input, e => super.ValidateForm(e)]],
                                                            c: tagsOptionList(resource.tags)
                                                        }
                                                    ]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['button', 'Change Tags'],
                                                            a: [[A.Type, 'submit'], [A.Disabled, 'true']]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    e: ['hr']
                                },
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['h2', 'Edit Display Order']
                                        },
                                        {
                                            e: ['form'],
                                            a: [[A.Method, 'post']],
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_display_order', true, this.GetLinkForNextPage(resource), this.stay ? false : true, false)]],
                                            c: [
                                                {
                                                    e: ['input'],
                                                    a: [[A.Type, 'hidden'], [A.Name, 'ResourceId'], [A.Value, resource.id]]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['label', 'Leaving order empty will set it to NULL']
                                                        },
                                                        {
                                                            e: ['br']
                                                        },
                                                        {
                                                            e: ['input'],
                                                            a: [[A.Type, 'number'], [A.Name, 'DisplayOrder'], [A.Value, typeof (resource.display_order) === 'number' ? resource.display_order : '']],
                                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                                        }
                                                    ]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['button', 'Change Order'],
                                                            a: [[A.Type, 'submit'], [A.Disabled, 'true']]
                                                        }
                                                    ]
                                                }
                                            ]
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
                                            e: ['a', 'Next Resource'],
                                            a: [[A.Href, AdminLink.RedirectNextResource(resource.resource_type, resource.id)]],
                                            v: [[EventType.Click, e => navigate(AdminLink.RedirectNextResource(resource.resource_type, resource.id), e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['p'],
                                    c: [
                                        {
                                            e: ['a', 'Back to resources'],
                                            a: [[A.Href, AdminLink.ResourceOverview(resource.resource_type)]],
                                            v: [[EventType.Click, e => navigate(AdminLink.ResourceOverview(resource.resource_type), e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['p'],
                                    c: [
                                        {
                                            e: ['a', 'Delete resource'],
                                            a: [[A.Href, AdminLink.DeleteResource(resource.resource_type, resource.id)]],
                                            v: [[EventType.Click, e => navigate(AdminLink.DeleteResource(resource.resource_type, resource.id), e)]]
                                        }
                                    ]
                                },
                                new BackToOverviewLinks()
                            ]
                        }
                    ]
                }
                return page;
            })
        };

        return [result];
    }

    static RegisterPage() {
        const page: PageData = {
            Component: EditResource,
            Title: 'Edit Resource',
            Url: ['Admin', 'EditResource', '{resourceId}']
        }
        registerPage(page);
    }
}