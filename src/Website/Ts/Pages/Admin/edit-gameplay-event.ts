import { Component, FrameworkElement, A, AsyncComponentPart, EventType } from "../../Framework/renderer";
import { get } from "../../Framework/http";
import { GameplayEvent } from "../../Models/gameplay-event";
import { PageData, registerPage } from "../../Framework/router";
import { ComponentWithForm } from "../../Framework/ComponentBaseClasses/component-with-form";
import { AdminLink } from "./_admin-link-creator";
import { convertGameplayEventTypeToString } from "../../Enums/enum-to-string-converters";
import { gameplayEventTypeOptionList } from "../../Components/Admin/option-lists";

export class EditGameplayEvent extends ComponentWithForm implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    private eventId: string;

    constructor(parameters: Array<string>) {
        super();

        this.eventId = parameters[0];

        this.E = {
            e: ['div'],
            a: [[A.Id, 'gameplay-event-container']]
        };

        this.A = this.CreateAsyncPart();
    }

    private CreateAsyncPart(): Array<AsyncComponentPart> {

        const part: AsyncComponentPart = {
            I: 'gameplay-event-container',
            P: get<GameplayEvent>(`/Admin/GameplayEvent/${this.eventId}`).then(event => {
                if (!event) {
                    const notFound: FrameworkElement = {
                        e: ['div', 'Event was not found.']
                    };
                    return notFound;
                }

                const x: FrameworkElement = {
                    e: ['div'],
                    c: [
                        {
                            e: ['h2', `Change Event Type (currently: ${convertGameplayEventTypeToString(event.event_type)})`]
                        },
                        {
                            e: ['form'],
                            v: [[EventType.Submit, e => super.HandleSubmit(e, `/Admin/update_gameplay_event_type`, true, AdminLink.EditGameplayEvent(parseInt(this.eventId, 10)), false, true, true)]],
                            c: [
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['input'],
                                            a: [[A.Type, 'hidden'], [A.Name, 'GameplayEventId'], [A.Value, this.eventId]]
                                        },
                                        {
                                            e: ['select'],
                                            a: [[A.Name, 'NewGameplayEventType'], [A.Required, 'true'], [A.RequiredErrorMessage, 'A gameplay event type must be selected!']],
                                            c: gameplayEventTypeOptionList(event.event_type),
                                            v: [[EventType.Input, e => super.ValidateForm(e)]]
                                        }
                                    ]
                                },
                                {
                                    e: ['div'],
                                    c: [
                                        {
                                            e: ['button', 'Change Gameplay Event Type'],
                                            a: [[A.Disabled, 'true'], [A.Type, 'submit']],
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['hr']
                        }
                    ]
                };

                return x;
            })
        }

        return [part];
    }

    static RegisterPage() {
        const page: PageData = {
            Component: EditGameplayEvent,
            Title: 'Edit Gameplay Event',
            Url: ['Admin', 'EditGameplayEvent', '{gameplayEventId}']
        }

        registerPage(page);
    }
}


