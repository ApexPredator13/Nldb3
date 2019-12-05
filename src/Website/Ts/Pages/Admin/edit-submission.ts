import { Component, FrameworkElement, AsyncComponentPart, A, EventType } from "../../Framework/renderer";
import { PageData, registerPage, navigate } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { get } from "../../Framework/http";
import { PlayedCharacter } from "../../Models/played-character";
import { IsaacImage } from "../../Components/General/isaac-image";
import { PlayedFloor } from "../../Models/played-floor";
import { GameplayEvent } from "../../Models/gameplay-event";
import { convertGameplayEventTypeToString } from "../../Enums/enum-to-string-converters";

export class EditSubmission implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    private videoId: string;
    private submissionId: string;

    constructor(parameters: Array<string>) {

        this.videoId = parameters[0];
        this.submissionId = parameters[1];

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'Edit Played Characters']
                },
                {
                    e: ['div', 'loading...'],
                    a: [[A.Id, 'edit-characters']]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h1', 'Edit Floors']
                },
                {
                    e: ['div', 'loading...'],
                    a: [[A.Id, 'edit-floors']]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h1', 'Edit Events']
                },
                {
                    e: ['div', 'loading...'],
                    a: [[A.Id, 'edit-events']]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Back to submissions'],
                            v: [[EventType.Click, e => navigate(AdminLink.AdminSubmissions(), e)]],
                            a: [[A.Class, 'u hand']]
                        }
                    ]
                }
            ]
        };

        this.A = this.CreateAsyncPart();
    }

    private CreateAsyncPart(): Array<AsyncComponentPart> {
        // load characters...
        const characters: AsyncComponentPart = {
            I: 'edit-characters',
            P: get<Array<PlayedCharacter>>(`/Admin/Submissions/${this.videoId}/${this.submissionId}/Characters`).then(characters => {
                if (!characters) {
                    return {
                        e: ['div', 'no characters found']
                    };
                }

                const lines = new Array<FrameworkElement>();

                for (const character of characters) {
                    lines.push({
                        e: ['tr'],
                        c: [
                            {
                                e: ['td'],
                                c: [
                                    new IsaacImage(character.character, undefined, undefined, false)
                                ]
                            },
                            {
                                e: ['td', character.character.name],
                                a: [[A.Class, 'u hand']]
                                // click: go to edit character page
                            },
                            {
                                e: ['td', character.action.toString(10)]
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
                                            e: ['th', 'Played Character'],
                                            a: [[A.Colspan, "2"]]
                                        },
                                        {
                                            e: ['th', 'Action #']
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
                }

                return table;
            })
        };


        // load floors...
        const floors: AsyncComponentPart = {
            I: 'edit-floors',
            P: get<Array<PlayedFloor>>(`/Admin/Submissions/${this.videoId}/${this.submissionId}/Floors`).then(floors => {
                if (!floors) {
                    return {
                        e: ['div', 'no floors found']
                    };
                }

                const lines = new Array<FrameworkElement>();

                for (const floor of floors) {
                    lines.push({
                        e: ['tr'],
                        c: [
                            {
                                e: ['td'],
                                c: [
                                    new IsaacImage(floor.floor, undefined, undefined, false)
                                ]
                            },
                            {
                                e: ['td', floor.floor.name],
                                a: [[A.Class, 'u hand']]
                                // click: go to edit floor page
                            },
                            {
                                e: ['td', floor.action.toString(10)]
                            },
                            {
                                e: ['td', floor.duration.toString(10)]
                            },
                            {
                                e: ['td', floor.floor_number.toString(10)]
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
                                            e: ['th', 'Played Floor'],
                                            a: [[A.Colspan, "2"]]
                                        },
                                        {
                                            e: ['th', 'Action #']
                                        },
                                        {
                                            e: ['th', 'Duration']
                                        },
                                        {
                                            e: ['th', 'Floor Number']
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
                }

                return table;
            })
        };

        // load events...
        const events: AsyncComponentPart = {
            I: 'edit-events',
            P: get<Array<GameplayEvent>>(`/Admin/Submissions/${this.videoId}/${this.submissionId}/Events`).then(events => {
                if (!events) {
                    return {
                        e: ['div', 'no events found']
                    };
                }

                const lines = new Array<FrameworkElement>();

                for (const event of events) {
                    lines.push({
                        e: ['tr'],
                        c: [
                            {
                                e: ['td', event.id.toString(10)]
                            },
                            {
                                e: ['td', event.action.toString(10)]
                            },
                            {
                                e: ['td'],
                                c: [
                                    new IsaacImage(event, 1, undefined, false)
                                ]
                            },
                            {
                                e: ['td', convertGameplayEventTypeToString(event.event_type)],
                                a: [[A.Class, 'u hand']],
                                v: [[EventType.Click, e => navigate(AdminLink.EditGameplayEvent(event.id), e)]]
                            },
                            {
                                e: ['td', 'Delete'],
                                a: [[A.Class, 'u hand']],
                                v: [[EventType.Click, e => navigate(AdminLink.DeleteEvent(this.videoId, parseInt(this.submissionId, 10), event.id), e)]]
                            },
                            {
                                e: ['td', 'Add Event'],
                                a: [[A.Class, 'u hand']],
                                v: [[EventType.Click, e => navigate(AdminLink.InsertGameplayEvent(this.videoId, parseInt(this.submissionId, 10), event.id, event.played_character, event.played_floor, event.run_number, event.floor_number), e)]]
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
                                            e: ['th', 'Action #']
                                        },
                                        {
                                            e: ['th', 'Event'],
                                            a: [[A.Colspan, "3"]]
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
                }

                return table;
            })
        };

        return [characters, floors, events];
    }

    static RegisterPage() {
        const page: PageData = {
            Component: EditSubmission,
            Title: 'Edit Submission',
            Url: ['Admin', 'EditSubmission', '{videoId}', '{submissionId}']
        }
        registerPage(page);
    }
}