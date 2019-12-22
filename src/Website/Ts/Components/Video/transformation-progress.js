import { Render, Div, id, cl, t, p, div, popup } from "../../Framework/renderer";
import { isaacImage } from "../General/isaac-image";
import { transformationPopupContent } from "./events-table";

function renderTransformationProgress(video, submissionIndex, containerId) {
    video.then(video => filterTransformationEvents(video, submissionIndex)).then(sortedEvents => {

        const pyramid = [];

        let lastEventKey = '';

        for (const event of sortedEvents) {
            const transformationCompleted = event[1].length >= 3;
            pyramid.push(
                div(
                    cl('pyramid-transformation-bar'),
                    event[1].map(event => {
                        let addNewRunBorder = false;
                        if (lastEventKey && !lastEventKey.endsWith(event.run_number.toString(10))) {
                            addNewRunBorder = true;
                        }

                        const block = div(
                            cl(
                                'transformation-stats-block',
                                transformationCompleted ? ' transformation-completed' : null,
                                addNewRunBorder ? ' transformation-stats-block-next-run' : null
                            ),
                            popup(
                                transformationPopupContent(true, event)
                            )
                        )

                        return block;
                    })
                )
            );

            lastEventKey = event[0];
        }

        const icons = [];

        for (const event of sortedEvents) {

            let addNewRunBorder = false;
            if (lastEventKey && !lastEventKey.endsWith(event[1][0].run_number.toString(10))) {
                addNewRunBorder = true;
            }

            icons.push(
                div(
                    cl(
                        'pyramid-transformation-icon',
                        addNewRunBorder ? ' transformation-stats-block-next-run' : null
                    ),
                    isaacImage(event[1][0], 2)
                )
            );

            lastEventKey = event[0];
        }

        new Render([
            Div(
                id('video-transformation-stats-container'),
                cl('video-page-element'),

                sortedEvents.size === 0 ? p(
                    t('No transformation-progress was made this episode')
                ) : div(
                    id('transformation-progress-container'),
                    div(
                        cl('transformation-progress-row'),
                        ...pyramid
                    ),
                    div(
                        cl('transformation-progress-row'),
                        ...icons
                    )
                )
            )
        ], containerId);
    });
}

function filterTransformationEvents(video, useSubmission) {

    if (!video) {
        return new Map();
    }

    const submission = video.submissions[useSubmission];
    const sortedTransformationProgressEvents = new Map();

    // extract all transformation progress events
    for (const character of submission.played_characters) {
        for (const floor of character.played_floors) {
            for (const event of floor.events) {
                if (event.event_type === 12 && event.r2) {
                    if (sortedTransformationProgressEvents.has(`${event.r2.id}-${event.run_number}`)) {
                        const existingEntry = sortedTransformationProgressEvents.get(`${event.r2.id}-${event.run_number}`);
                        if (existingEntry) {
                            existingEntry.push(event);
                        }
                    } else {
                        sortedTransformationProgressEvents.set(`${event.r2.id}-${event.run_number}`,[event]);
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
    renderTransformationProgress
}


