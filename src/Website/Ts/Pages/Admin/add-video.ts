﻿import { FrameworkElement, A, EventType, Component } from "../../Framework/renderer";
import { PageData, registerPage } from "../../Framework/router";
import { BackToOverviewLinks } from "../../Components/Admin/back-to-overview-links";
import { AdminLink } from "./_admin-link-creator";
import { ComponentWithForm } from "../../Framework/ComponentBaseClasses/component-with-form";

export class AddVideoPage extends ComponentWithForm implements Component {
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
                    a: [[A.Id, 'errors']]
                },
                {
                    e: ['form'],
                    a: [[A.Method, 'post']],
                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/save_or_update_videos', true, AdminLink.VideosSaved((document.getElementById('video-ids-textarea') as HTMLTextAreaElement).value))]],
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
                                        [A.Placeholder, 'enter video ids, seperated by a comma \',\''],
                                        [A.Required, 'true'],
                                        [A.RequiredErrorMessage, 'This field is required'],
                                        [A.MinLength, '11'],
                                        [A.MinLengthErrorMessage, 'Must be at least 11 characters long'],
                                        [A.Name, 'VideoIds'],
                                        [A.Id, 'video-ids-textarea']
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
                                    a: [[A.Type, 'submit'], [A.Disabled, 'true']]
                                }
                            ]
                        }
                    ]
                },
                new BackToOverviewLinks()
            ]
        }
    }

    static RegisterPage() {
        const page: PageData = {
            Component: AddVideoPage,
            Title: 'Add or update videos',
            Url: ['Admin', 'AddVideo']
        }
        registerPage(page);
    }
}



