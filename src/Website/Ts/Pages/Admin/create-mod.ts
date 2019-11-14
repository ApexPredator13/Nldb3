import { Component, FrameworkElement, ComponentWithForm, A, EventType } from "../../Framework/renderer";
import { PageData, registerPage } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";

export class CreateModPage extends ComponentWithForm implements Component {
    E: FrameworkElement;

    constructor() {
        super();

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'New Mod']
                },
                {
                    e: ['form'],
                    a: [[A.Method, 'post']],
                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/create_mod', true, AdminLink.Mods())]],
                    c: [
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['label', 'Mod Name']
                                },
                                {
                                    e: ['input'],
                                    a: [
                                        [A.Type, 'text'],
                                        [A.Name, 'ModName'],
                                        [A.MaxLength, '256'],
                                        [A.MaxLengthErrorMessage, 'Name is too long'],
                                        [A.Required, 'true']
                                    ],
                                    v: [[EventType.Input, e => super.ValidateForm(e)]]
                                }
                            ]
                        },
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['button', 'Create Mod'],
                                    a: [[A.Type, 'submit'], [A.Class, 'btn-green'], [A.Disabled, 'true']],
                                    v: [[EventType.Input, e => super.ValidateForm(e)]]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }

    static RegisterPage() {
        const pageData: PageData = {
            Component: CreateModPage,
            Title: 'Create Mod',
            Url: ['Admin', 'CreateMod']
        }
        registerPage(pageData);
    }
}


