import { ComponentWithForm } from "../../Framework/ComponentBaseClasses/component-with-form";
import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { PageData, registerPage } from "../../Framework/router";
import { AdminLink } from "./_admin-link-creator";
import { gameplayEventTypeOptionList } from "../../Components/Admin/option-lists";
import { Option } from "../../Components/General/option";
import { GameplayEventType } from "../../Enums/gameplay-event-type";

export class InsertGameplayEvent extends ComponentWithForm implements Component {
    E: FrameworkElement;

    private videoId: string;
    private submissionId: number;
    private insertAfterEventId: number;
    private playedCharacterId: number;
    private playedFloorId: number;
    private runNumber: number;
    private floorNumber: number;

    constructor(parameters: Array<string>) {
        super();

        this.videoId = parameters[0];
        this.submissionId = parseInt(parameters[1], 10);
        this.insertAfterEventId = parseInt(parameters[2], 10);
        this.playedCharacterId = parseInt(parameters[3], 10);
        this.playedFloorId = parseInt(parameters[4], 10);
        this.runNumber = parseInt(parameters[5], 10);
        this.floorNumber = parseInt(parameters[6], 10);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h1', 'Insert Gameplay Event']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['form'],
                    a: [[A.Method, 'post']],
                    v: [[EventType.Submit, e => super.HandleSubmit(e, '/Admin/insert_gameplay_event', true, AdminLink.EditSubmission(this.videoId, this.submissionId))]],
                    c: [
                        {
                            e: ['fieldset'],
                            c: [
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Insert after event with id']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'number'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'Event Id is required!'],
                                                [A.Name, 'InsertAfterEvent'],
                                                [A.Value, this.insertAfterEventId.toString(10)]
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Video ID']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'text'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'Video ID is required!'],
                                                [A.Name, 'VideoId'],
                                                [A.Value, this.videoId]
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Played Character ID']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'number'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'ID for played character is required!'],
                                                [A.Name, 'PlayedCharacterId'],
                                                [A.Value, this.playedCharacterId.toString(10)]
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Played Floor ID']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'number'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'ID for played floor is required!'],
                                                [A.Name, 'PlayedFloorId'],
                                                [A.Value, this.playedFloorId.toString(10)]
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Run Number']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'number'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'run number is required!'],
                                                [A.Name, 'RunNumber'],
                                                [A.Value, this.runNumber.toString(10)]
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Floor Number']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'number'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'floor number is required!'],
                                                [A.Name, 'FloorNumber'],
                                                [A.Value, this.floorNumber.toString(10)]
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Event was consequence of event with id (used only for transformation that completed after picking up transformation item #3):']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'number'],
                                                [A.Name, 'InConsequenceOf'],
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['fieldset'],
                            c: [
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Gameplay event type']
                                        },
                                        {
                                            e: ['select'],
                                            a: [[A.Name, 'NewEvent.EventType']],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]],
                                            c: gameplayEventTypeOptionList(GameplayEventType.ItemCollected)
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Resource 1']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'text'],
                                                [A.Name, 'NewEvent.RelatedResource1'],
                                                [A.Required, 'true'],
                                                [A.RequiredErrorMessage, 'Resource 1 is required']
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Resource 2']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'text'],
                                                [A.Name, 'NewEvent.RelatedResource2']
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Resource 3 (used for transformation progress only)']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'number'],
                                                [A.Name, 'NewEvent.RelatedResource3']
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Current Player (empty for: down to next floor, bossfight, curse, won the run, character died, lost the run)']
                                        },
                                        {
                                            e: ['input'],
                                            a: [
                                                [A.Type, 'number'],
                                                [A.Name, 'NewEvent.Player'],
                                            ],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    a: [[A.Class, 'fc']],
                                    c: [
                                        {
                                            e: ['label', 'Was Rerolled? (default is false for everything)']
                                        },
                                        {
                                            e: ['select'],
                                            a: [[A.Name, 'NewEvent.Rerolled'], [A.Required, 'true'], [A.RequiredErrorMessage, 'Rerolled value must be selected']],
                                            v: [[EventType.Input, e => super.ValidateForm(e)]],
                                            c: [
                                                new Option('true', 'True', false),
                                                new Option('false', 'False', true)
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['button', 'Insert Event'],
                            a: [[A.Type, 'submit'], [A.Disabled, 'true']]
                        }
                    ]
                }
            ]
        };
    }

    static RegisterPage() {
        const page: PageData = {
            Title: 'Insert Gameplay Event',
            Component: InsertGameplayEvent,
            Url: ['Admin', 'InsertGameplayEvent', '{videoId}', '{SubmissionId}', '{InsertAfterEventId}', '{playedCharacterId}', '{playedFloorId}', '{runNumber}', '{floorNumber}']
        };
        registerPage(page);
    }
}

