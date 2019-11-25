import { FrameworkElement, Component, AsyncComponentPart, A, EventType, htmlAttributeNameOf } from "../../Framework/renderer";
import { PageData, registerPage, navigate } from "../../Framework/router";
import { get, postResponse } from "../../Framework/http";
import { Link } from "../_link-creator";
import { AdminLink } from "./_admin-link-creator";
import { IsaacImage } from "../../Components/General/isaac-image";
import { IsaacResource } from "../../Models/isaac-resource";
import { convertExistsInToString, convertTagToString, convertGameModeToString } from "../../Enums/enum-to-string-converters";
import { existsInOptionlist, tagsAsIsaacResources, gameModeOptionList } from "../../Components/Admin/option-lists";
import { Mod } from "../../Models/mod";
import { Option } from "../../Components/General/option";
import { BackToOverviewLinks } from "../../Components/Admin/back-to-overview-links";
import { saveToLocalStorage, getFromLocalStorage } from "../../Framework/browser";
import { ComponentWithForm } from "../../Framework/ComponentBaseClasses/component-with-form";
import { SearchboxComponent } from "../../Components/General/searchbox";
import { Tag } from "../../Enums/tags";
import { ResourceType } from "../../Enums/resource-type";

export class EditResource extends ComponentWithForm implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    private stay: boolean = false
    private resourceId: string;
    private resourceType: ResourceType | undefined;

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
                },
                {
                    e: ['div'],
                    a: [[A.Style, 'width: 100%; height: 700px;']]
                }
            ]
            
        }

        this.A = this.CreatePage();
    }

    private GetLinkForNextPage() {
        return this.stay ? Link.Redirect(AdminLink.EditResource(this.resourceId)) : AdminLink.ResourceOverview(this.resourceType ? this.resourceType : ResourceType.Boss);
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

                this.resourceId = resource.id;
                this.resourceType = resource.resource_type;

                const tagSearchbox = new SearchboxComponent<EditResource>(this, 1, tagsAsIsaacResources(), false);
                tagSearchbox.Subscribe(this.AddTag);


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
                                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_resource_name', true, this.GetLinkForNextPage(), this.stay ? false : true, false)]],
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
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['h2', 'Edit Tags']
                                        },
                                        {
                                            e: ['p', 'Selected Tags:'],
                                        },
                                        {
                                            e: ['p'],
                                            a: [[A.Id, 'selected-tags']],
                                            c: resource.tags ? resource.tags.map(tag => {
                                                const span: FrameworkElement = {
                                                    e: ['span', convertTagToString(tag)],
                                                    a: [[A.DataC, tag.toString(10)], [A.Class, 'selected-tag']],
                                                    v: [[EventType.Click, e => this.RemoveTag(e)]]
                                                };
                                                return span
                                            }) : []
                                        },
                                        tagSearchbox
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
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_icon', true, this.GetLinkForNextPage(), this.stay ? false : true, false)]],
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
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_exists_in', true, this.GetLinkForNextPage(), this.stay ? false : true, false)]],
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
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_mod', true, this.GetLinkForNextPage(), this.stay ? false : true, false)]],
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
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_color', true, this.GetLinkForNextPage(), this.stay ? false : true, false)]],
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
                                            e: ['h2', 'Edit Display Order']
                                        },
                                        {
                                            e: ['form'],
                                            a: [[A.Method, 'post']],
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_display_order', true, this.GetLinkForNextPage(), this.stay ? false : true, false)]],
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
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['h2', 'Edit Game Mode']
                                        },
                                        {
                                            e: ['form'],
                                            a: [[A.Method, 'post']],
                                            v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/change_game_mode', true, this.GetLinkForNextPage(), this.stay ? false : true, false)]],
                                            c: [
                                                {
                                                    e: ['input'],
                                                    a: [[A.Type, 'hidden'], [A.Name, 'ResourceId'], [A.Value, resource.id]]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['label', `Current game mode is: ${resource.game_mode ? convertGameModeToString(resource.game_mode) : 'not set yet'}`]
                                                        },
                                                        {
                                                            e: ['br']
                                                        },
                                                        {
                                                            e: ['select'],
                                                            a: [[A.Name, 'NewGameMode'], [A.Required, 'true'], [A.RequiredErrorMessage, 'Please select an option']],
                                                            v: [[EventType.Change, e => super.ValidateForm(e)]],
                                                            c: [
                                                                new Option('', 'Choose...', typeof(resource.game_mode) === 'number' ? false : true),
                                                                ...gameModeOptionList(typeof (resource.game_mode) === 'number' ? resource.game_mode : undefined)
                                                            ]
                                                        }
                                                    ]
                                                },
                                                {
                                                    e: ['div'],
                                                    c: [
                                                        {
                                                            e: ['button', 'Change Game Mode'],
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


    private GetExistingTags() {
        const existingTags = new Array<Tag>();
        const tagContainer = document.getElementById('selected-tags');
        if (tagContainer && tagContainer instanceof HTMLParagraphElement) {
            const spans = tagContainer.getElementsByTagName('span');
            if (spans && spans.length > 0) {
                const attributeName = htmlAttributeNameOf(A.DataC);
                for (let i = 0; i < spans.length; ++i) {
                    const span = spans[i];
                    const attributeValue = span.getAttribute(attributeName);
                    if (attributeValue) {
                        const attributeAsTag = parseInt(attributeValue, 10);
                        if (!isNaN(attributeAsTag)) {
                            existingTags.push(attributeAsTag as Tag);
                        }
                    }
                }
            }
        }
        return existingTags;
    }

    private RemoveTag(e: Event) {
        const span = e.target;
        if (span && span instanceof HTMLSpanElement) {
            const attributeName = htmlAttributeNameOf(A.DataC);
            const attributeValue = span.getAttribute(attributeName);
            if (attributeValue) {
                const tagToRemove = parseInt(attributeValue, 10) as Tag;
                if (!isNaN(tagToRemove)) {
                    const existingTags = this.GetExistingTags();
                    const newTags = existingTags.filter(existingTag => existingTag !== tagToRemove);
                    const body = {
                        ResourceId: this.resourceId,
                        Tags: newTags
                    };
                    const link = this.GetLinkForNextPage();
                    postResponse('/Admin/change_tags', JSON.stringify(body), true).then(response => {
                        if (response.ok) {
                            navigate(link);
                        } else {
                            console.error(response);
                        }
                    });
                }
            }
        }
    }

    private AddTag(tagAsString: string) {
        const tag = parseInt(tagAsString, 10) as Tag;
        if (!isNaN(tag)) {
            const existingTags = this.GetExistingTags();
            existingTags.push(tag);
            const body = {
                ResourceId: this.resourceId,
                Tags: existingTags
            };
            console.log(body);
            const bodyString = JSON.stringify(body);
            console.log(bodyString);
            const link = this.GetLinkForNextPage();
            postResponse('/Admin/change_tags', JSON.stringify(body), true).then(response => {
                if (response.ok) {
                    navigate(link);
                } else {
                    console.error(response);
                }
            });
        }
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