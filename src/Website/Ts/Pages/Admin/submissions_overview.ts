import { Component, FrameworkElement, AsyncComponentPart, A, render, EventType } from "../../Framework/renderer";
import { get } from "../../Framework/http";
import { AdminSubmission } from "../../Models/admin-submission";
import { PageData, registerPage, navigate } from "../../Framework/router";
import { convertSubmissionTypeToString } from "../../Enums/enum-to-string-converters";
import { AdminLink } from "./_admin-link-creator";

export class SubmissionsOverview implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    private limit = 50;
    private offset = 0;

    constructor() {
        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'Submissions']
                },
                {
                    e: ['div'],
                    a: [[A.Id, 'submissions']],
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['button', 'Previous 50'],
                            v: [[EventType.Click, e => this.PreviousPage(e)]]
                        },
                        {
                            e: ['button', 'Next 50'],
                            v: [[EventType.Click, e => this.NextPage(e)]]
                        }
                    ]
                }
            ]
        };

        this.A = [this.CreateAsyncPart()];
    }

    private NextPage(e: Event) {
        e.preventDefault();
        this.offset += 50;
        this.CreateAsyncPart().P.then(e => {
            const html = render(e);
            const container = document.getElementById('submissions');
            if (container && html) {
                container.innerHTML = '';
                container.appendChild(html);
            }
        });
    }

    private PreviousPage(e: Event) {
        e.preventDefault();
        if (this.offset <= 0) {
            return;
        }

        this.offset -= 50;
        this.CreateAsyncPart().P.then(e => {
            const html = render(e);
            const container = document.getElementById('submissions');
            if (container && html) {
                container.innerHTML = '';
                container.appendChild(html);
            }
        });
    }

    private CreateAsyncPart(): AsyncComponentPart {
        const part: AsyncComponentPart = {
            I: 'submissions',
            P: this.GetSubmissions().then(submissions => {
                if (!submissions) {
                    const empty: FrameworkElement = {
                        e: ['div', 'no submissions found']
                    };
                    return empty;
                }

                const lines = new Array<FrameworkElement>();

                for (const submission of submissions) {
                    lines.push({
                        e: ['tr'],
                        c: [
                            {
                                e: ['td', submission.submission_id.toString(10)],
                                a: [[A.Class, 'u hand']],
                                v: [[EventType.Click, e => navigate(AdminLink.EditSubmission(submission.video_id, submission.submission_id), e)]]
                            },
                            {
                                e: ['td', submission.video_title ? submission.video_title : 'no title']
                            },
                            {
                                e: ['td', submission.user_name ? submission.user_name : 'no username']
                            },
                            {
                                e: ['td', submission.latest ? 'latest submission' : '']
                            },
                            {
                                e: ['td', typeof (submission.submission_type) === 'number' ? convertSubmissionTypeToString(submission.submission_type) : '']
                            }
                        ]
                    });
                }

                const table: FrameworkElement = {
                    e: ['table'],
                    c: [
                        {
                            e: ['thead'],
                            c: [
                                {
                                    e: ['tr'],
                                    c: [
                                        {
                                            e: ['th', 'Id']
                                        },
                                        {
                                            e: ['th', 'Title']
                                        },
                                        {
                                            e: ['th', 'Username']
                                        },
                                        {
                                            e: ['th', 'Latest']
                                        },
                                        {
                                            e: ['th', 'Type']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['tbody'],
                            c: lines
                        }
                    ]
                };
                return table;
            })
        };

        return part;
    }

    private GetSubmissions(): Promise<Array<AdminSubmission> | null> {
        return get<Array<AdminSubmission>>(`/Admin/Submissions/${this.limit.toString(10)}/${this.offset.toString(10)}`);
    }

    static RegisterPage() {
        const page: PageData = {
            Component: SubmissionsOverview,
            Title: 'Submissions',
            Url: ['Admin', 'Submissions']
        }
        registerPage(page);
    }
}

