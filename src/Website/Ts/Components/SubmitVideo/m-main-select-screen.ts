import { Component, FrameworkElement, EventType, A } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/renderBoxes";
import { SubmitVideo } from "../../Pages/submit-video";
import { removeClassIfExists, addClassIfNotExists } from "../../Framework/browser";

export class MainSelectScreen<TSubscriber extends Object> implements Component {
    E: FrameworkElement;

    static HighlightTutorial = true;

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
                            a: [[A.Class, 'u hand' + (MainSelectScreen.HighlightTutorial ? ' orange' : ' gray')], [A.Id, 'launch-tutorial']],
                            v: [[EventType.Click, e => {
                                MainSelectScreen.HighlightTutorial = false;

                                if (subscriber instanceof SubmitVideo) {
                                    subscriber.LaunchMainMenuTutorial();
                                }
                                const target = e.target;
                                if (target && target instanceof HTMLAnchorElement) {
                                    removeClassIfExists(target, 'orange');
                                    addClassIfNotExists(target, 'gray');
                                }
                            }]]
                        }
                    ]
                }
            ]
        };
    }
}

