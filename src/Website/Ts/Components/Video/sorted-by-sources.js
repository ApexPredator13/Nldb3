import { Html, Div, table, id, thead, tr, th, t, tbody, td } from "../../Framework/renderer";
import { isaacImage } from "../General/isaac-image";

export function renderItemsSortedBySources(video, submissionIndex, containerId) {
    video.then(video => {
        const submission = video.submissions[submissionIndex];

        new Html([
            Div(
                table(
                    id('sorted-items-table'),
                    thead(
                        tr(
                            th(
                                t('Item Source')
                            ),
                            th(
                                t('Items')
                            )
                        )
                    ),
                    tbody(
                        ...getItemEventsFromSubmission(submission)
                    )
                )
            )
        ], containerId)

    });
}

function getItemEventsFromSubmission(submission) {
    const events = new Map();

    // loop through all events, sort them
    for (const character of submission.played_characters) {
        for (const floor of character.played_floors) {
            for (const event of floor.events) {
                if (event.event_type === 2 || event.event_type === 18) {
                    const source = event.r2;
                    if (events.has(source.id)) {
                        const sortedItems = events.get(source.id);
                        if (sortedItems) {
                            sortedItems.items.push(isaacImage(event, 1));
                        }
                    } else {
                        events.set(source.id, {
                            source: isaacImage(event, 2),
                            items: [isaacImage(event, 1)]
                        });
                    }
                }
            }
        }
    }

    // create a table row for every set
    const result = [];
    for (const set of events) {
        result.push(
            tr(
                td(
                    set[1].source
                ),
                td(
                    ...(set[1].items)
                )
            )
        )
    }

    return result;
}


