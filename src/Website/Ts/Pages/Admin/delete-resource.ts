import { ComponentWithForm, Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { AdminLink } from "./_admin-link-creator";
import { navigate, PageData, registerPage } from "../../Framework/router";
import { ResourceType } from "../../Enums/resource-type";

export class DeleteResource extends ComponentWithForm implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        super();

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', `Delete Resource with ID ${parameters[1]}?`]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['form'],
                    a: [[A.Method, 'post']],
                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/delete_isaac_resource', true, AdminLink.ResourceDeleted(Number(parameters[0]) as ResourceType, parameters[1]))]],
                    c: [
                        {
                            e: ['input'],
                            a: [[A.Type, 'hidden'], [A.Name, 'resourceId'], [A.Value, parameters[1]]]
                        },
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['button', 'Yes, Delete!'],
                                    a: [[A.Type, 'submit'], [A.Class, 'btn-red']]
                                }
                            ]
                        },
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['button', 'No, Cancel!'],
                                    a: [[A.Class, 'btn-yellow']],
                                    v: [[EventType.Click, e => navigate(AdminLink.EditResource(parameters[0]), e)]]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }

    static RegisterPage() {
        const page: PageData = {
            Component: DeleteResource,
            Title: 'Delete Resource',
            Url: ['Admin', 'DeleteResource', '{resourceType}','{resourceId}']
        };
        registerPage(page);
    }
}


