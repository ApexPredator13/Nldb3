import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { PageData, registerPage } from "../../Framework/router";
import { ComponentWithForm } from "../../Framework/ComponentBaseClasses/component-with-form";
import { AdminLink } from "./_admin-link-creator";

export class DeleteSubmission extends ComponentWithForm implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        super();

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'Delete Submission']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['form'],
                    a: [[A.Method, 'post']],
                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/delete_submission', true, AdminLink.AdminSubmissions())]],
                    c: [
                        {
                            e: ['input'],
                            a: [[A.Type, 'hidden'], [A.Name, 'SubmissionId'], [A.Value, parameters[0]]]
                        },
                        {
                            e: ['button', 'Yes, delete submission!'],
                            a: [[A.Type, 'submit']]
                        }
                    ]
                }
            ]
        };
    }

    static RegisterPage() {
        const page: PageData = {
            Component: DeleteSubmission,
            Title: 'Delete Submission',
            Url: ['Admin', 'DeleteSubmission', '{submissionId}']
        };
        registerPage(page);
    }
}


