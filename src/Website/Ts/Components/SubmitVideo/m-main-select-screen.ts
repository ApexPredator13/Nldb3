import { Component, FrameworkElement, EventType, A } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/boxes";
import { SubmitVideo } from "../../Pages/submit-video";

export class MainSelectScreen<TSubscriber extends Object> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        events: Array<IsaacResource>,
        consumables: Array<IsaacResource>,
        selectionProcessor: (selectedEvent: string) => any
    ) {
        const eventBoxes = new Boxes<TSubscriber>(subscriber, 6, events, '/img/gameplay_events.png', false);
        eventBoxes.Subscribe(selectionProcessor);
        const consumableBoxes = new Boxes(subscriber, 7, consumables, '/img/gameplay_events.png', false);
        consumableBoxes.Subscribe(selectionProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What happened?']
                },
                eventBoxes,
                {
                    e: ['h2', 'What was used?']
                },
                consumableBoxes,
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['a', 'Launch Tutorial!'],
                            a: [[A.Class, 'u hand'], [A.Id, 'launch-tutorial']],
                            v: [[EventType.Click, () => {
                                if (subscriber instanceof SubmitVideo) {
                                    subscriber.LaunchMainMenuTutorial();
                                }
                            }]]
                        }
                    ]
                }
            ]
        }
    }
}

