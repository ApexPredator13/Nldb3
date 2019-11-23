import { Component, FrameworkElement, AsyncComponentPart, A } from "../../Framework/renderer";
import { Video } from "../../Models/video";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { IsaacImage } from "../General/isaac-image";
import { TransformationProgressPopup } from "./transformation-progress-popup";
import { GameplayEvent } from "../../Models/gameplay-event";
import { ComponentWithPopup } from "../../Framework/ComponentBaseClasses/component-with-popup";

class TransformationProgress extends ComponentWithPopup implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    constructor(video: Promise<Video | null>, useSubmission: number) {
        super();

        this.E = {
            e: ['div'],
            a: [[A.Id, 'video-transformation-stats-container'], [A.Class, 'video-page-element']]
        };

        this.A = this.CreateAsyncPart(video, useSubmission);
    }

    private CreateAsyncPart(video: Promise<Video | null>, useSubmission: number): Array<AsyncComponentPart> {

        const part: AsyncComponentPart = {
            I: 'video-transformation-stats-container',
            P: video.then(video => filterTransformationEvents(video, useSubmission)).then(sortedEvents => {

                if (sortedEvents.size === 0) {
                    return {
                        e: ['p', 'No transformation-progress was made this episode']
                    };
                }

                const pyramid = new Array<FrameworkElement>();

                let lastEventKey = '';

                for (const event of sortedEvents) {
                    const transformationCompleted = event[1].length >= 3;
                    pyramid.push({
                        e: ['div'],
                        a: [[A.Class, 'pyramid-transformation-bar']],
                        c: event[1].map((event) => {

                            // check if it's a new run - it has the run-number suffixed to the key
                            let addNewRunBorder = false;
                            if (lastEventKey && !lastEventKey.endsWith(event.run_number.toString(10))) {
                                addNewRunBorder = true;
                            }

                            const block: FrameworkElement = {
                                e: ['div'],
                                a: [[A.Class, 'transformation-stats-block popup-container' + (transformationCompleted ? ' transformation-completed' : '') + (addNewRunBorder ? ' transformation-stats-block-next-run' : '')]]
                            };
                            super.CreatePopupForElement(block, new TransformationProgressPopup(event, true, true, 60));
                            return block;
                        })
                    });

                    lastEventKey = event[0];
                }
                
                const icons = new Array<FrameworkElement>();

                lastEventKey = '';
                for (const event of sortedEvents) {

                    let addNewRunBorder = false;
                    if (lastEventKey && !lastEventKey.endsWith(event[1][0].run_number.toString(10))) {
                        addNewRunBorder = true;
                    }

                    icons.push({
                        e: ['div'],
                        a: [[A.Class, 'pyramid-transformation-icon' + (addNewRunBorder ? ' transformation-stats-block-next-run' : '')]],
                        c: [new IsaacImage(event[1][0], 2)]
                    });

                    lastEventKey = event[0];
                }

                const container: FrameworkElement = {
                    e: ['div'],
                    a: [[A.Id, 'transformation-progress-container']],
                    c: [
                        {
                            e: ['div'],
                            a: [[A.Class, 'transformation-progress-row']],
                            c: pyramid
                        },
                        {
                            e: ['div'],
                            a: [[A.Class, 'transformation-progress-row']],
                            c: icons
                        }
                    ]
                };

                return container;
            })
        };

        return [part];
    }
}

const filterTransformationEvents = (video: Video | null, useSubmission: number): Map<string, Array<GameplayEvent>> => {

    if (!video) {
        return new Map<string, Array<GameplayEvent>>();
    }

    const submission = video.submissions[useSubmission];
    const sortedTransformationProgressEvents = new Map<string, Array<GameplayEvent>>();

    // extract all transformation progress events
    for (const character of submission.played_characters) {
        for (const floor of character.played_floors) {
            for (const event of floor.events) {
                if (event.event_type === GameplayEventType.TransformationProgress && event.r2) {
                    if (sortedTransformationProgressEvents.has(`${event.r2.id}-${event.run_number}`)) {
                        const existingEntry = sortedTransformationProgressEvents.get(`${event.r2.id}-${event.run_number}`);
                        if (existingEntry) {
                            existingEntry.push(event);
                        }
                    } else {
                        sortedTransformationProgressEvents.set(`${event.r2.id}-${event.run_number}`, new Array<GameplayEvent>(event));
                    }
                }
            }
        }
    }

    for (const sortedEvent of sortedTransformationProgressEvents) {
        sortedEvent[1] = sortedEvent[1].reverse();
    }

    return sortedTransformationProgressEvents;
}

export {
    filterTransformationEvents,
    TransformationProgress
}