import { ComponentWithForm } from "../../Framework/ComponentBaseClasses/component-with-form";
import { Component, FrameworkElement, EventType, A } from "../../Framework/renderer";
import { AdminLink } from "./_admin-link-creator";
import { navigate, PageData, registerPage } from "../../Framework/router";

export class DeleteEvent extends ComponentWithForm implements Component {
    E: FrameworkElement;

    private videoId: string;
    private submissionId: number;
    private eventId: number;

    constructor(parameters: Array<string>) {
        super();

        this.videoId = parameters[0];
        this.submissionId = parseInt(parameters[1], 10);
        this.eventId = parseInt(parameters[2], 10);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', `Delete Event with ID ${this.eventId}?`]
                },
                {
                    e: ['form'],
                    a: [[A.Method, 'post']],
                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/delete_gameplay_event', true, AdminLink.EditSubmission(this.videoId, this.submissionId))]],
                    c: [
                        {
                            e: ['input'],
                            a: [[A.Type, 'hidden'], [A.Name, 'GameplayEventId'], [A.Value, this.eventId.toString(10)]]
                        },
                        {
                            e: ['button', 'Yes, Delete!'],
                            a: [[A.Type, 'submit']]
                        }
                    ]
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Cancel'],
                            a: [[A.Class, 'u hand']],
                            v: [[EventType.Click, e => navigate(AdminLink.EditSubmission(this.videoId, this.submissionId), e)]]
                        }
                    ]
                }
            ]
        }
    }

    static RegisterPage() {
        const page: PageData = {
            Component: DeleteEvent,
            Title: 'Delete Event',
            Url: ['Admin', 'DeleteEvent', '{videoId}', '{submissionId}', '{eventId}']
        };
        registerPage(page);
    }
}