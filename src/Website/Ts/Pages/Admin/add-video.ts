import { Component, FrameworkElement, Attribute, ComponentWithForm, EventType } from "../../Framework/renderer";
import { PageData, registerPage } from "../../Framework/router";

export class AddVideo extends ComponentWithForm implements Component {
    E: FrameworkElement

    constructor() {
        super();

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'Add Videos']
                },
                {
                    e: ['p', 'Enter video IDs seperated by a comma \',\'. New videos will be saved, existing videos will be updated.']
                },
                {
                    e: ['p'],
                    a: [[Attribute.Id, 'errors']]
                },
                {
                    e: ['form'],
                    a: [[Attribute.Method, 'post'], [Attribute.Name, 'VideoIds']],
                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/save_or_update_videos', true, '')]],
                    c: [
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['label', 'Video IDs']
                                },
                                {
                                    e: ['textarea'],
                                    a: [
                                        [Attribute.Placeholder, 'enter video ids, seperated by a comma \',\''],
                                        [Attribute.Required, 'true'],
                                        [Attribute.RequiredErrorMessage, 'This field is required'],
                                        [Attribute.MinLength, '11'],
                                        [Attribute.MinLengthErrorMessage, 'Must be at least 11 characters long']
                                    ],
                                    v: [[EventType.Input, e => super.ValidateForm(e)]]
                                }
                            ]
                        },
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['button', 'Save/Update videos'],
                                    a: [[Attribute.Type, 'submit'], [Attribute.Disabled, 'true']]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }

    static RegisterPage() {
        const data: PageData = {
            AppendTo: 'main-container',
            Component: AddVideo,
            Title: 'Add or update videos',
            Urls: ['/Admin/AddVideo']
        }
        registerPage('add-or-update-video', data);
    }
}



