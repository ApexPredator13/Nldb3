import { Component, FrameworkElement, EventType, A } from "../../Framework/renderer";
import { AdminLink } from "./_admin-link-creator";
import { PageData, registerPage } from "../../Framework/router";
import { ComponentWithForm } from "../../Framework/ComponentBaseClasses/component-with-form";

export class CreateModLinkPage extends ComponentWithForm implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        const modId = Number(parameters[0]);
        super();

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['form'],
                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/create_mod_link', true, AdminLink.Mod(modId))]],
                    c: [
                        {
                            e: ['input'],
                            a: [[A.Type, 'hidden'], [A.Name, 'ModId'], [A.Value, modId.toString(10)]]
                        },
                        {
                            e: ['div'],
                            a: [[A.Class, 'fc']],
                            c: [
                                {
                                    e: ['label', 'Display Text']
                                },
                                {
                                    e: ['input'],
                                    a: [[A.Name, 'LinkText'], [A.Required, 'true'], [A.MaxLength, '100'], [A.Type, 'text']],
                                    v: [[EventType.Input, e => super.ValidateForm(e)]]
                                }
                            ]
                        },
                        {
                            e: ['div'],
                            a: [[A.Class, 'fc']],
                            c: [
                                {
                                    e: ['label', 'URL']
                                },
                                {
                                    e: ['input'],
                                    a: [[A.Type, 'text'], [A.Name, 'Url'], [A.Required, 'true']],
                                    v: [[EventType.Input, e => super.ValidateForm(e)]]
                                }
                            ]
                        },
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['button', 'Create Link'],
                                    a: [[A.Type, 'submit'], [A.Disabled, 'true']]
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
            Component: CreateModLinkPage,
            Title: 'Create Link',
            Url: ['Admin', 'CreateLink', '{modId}']
        };
        registerPage(page);
    }
}


