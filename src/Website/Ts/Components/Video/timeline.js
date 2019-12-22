import { Render, Div, div, t, style, cl, event, popup, h4, hr, br, strong, do_nothing } from "../../Framework/renderer";
import { isaacImage } from "../General/isaac-image";

export function renderTimeline(video, submissionIndex, containerId) {
    video.then(video => {

        const submission = video.submissions[submissionIndex];
        const floors = submission.played_characters.flatMap(x => x.played_floors);

        const floorUpperElements = [];
        const floorElements = [];
        const floorLowerElements = [];


        /* loop through the floors, creating the timeline containers
         * 
         * -> Basement 1                           -> Caves 1                   // floorUpperElements
         * ---------------------------------------------------------
         * XXXXXXXXXXXXXXXXX | XXXXXXXXXXXXXXXXX | XXXXXXXXXXXXXXXXX            // floorElements
         * ---------------------------------------------------------
         *                     -> Basement 2                                    // floorLowerElements
        */
        for (let i = 0; i < floors.length; ++i) {
            const floor = floors[i];

            const durationSplit = video.duration.split(':');
            const hours = Number(durationSplit[0]);
            const minutes = Number(durationSplit[1]);
            const seconds = Number(durationSplit[2]);

            const videoLength = hours * 3600 + minutes * 60 + seconds;
            const floorLength = floor.duration - 0.01;
            const percentage = (100 * floorLength) / videoLength;

            floorUpperElements.push(
                div(
                    t(i % 2 === 0 ? (`↦${floor.floor.name}` + (floor.died_from !== null ? ' (†)' : '')) : ''),
                    style(`width: ${percentage}%`),
                    cl('timeline-floorname', 'l', floor.died_from ? 'orange' : null)
                )
            );

            let floorStartsAt = 0;
            for (let x = 0; x < i; ++x) {
                floorStartsAt += floors[x].duration;
            }

            floorElements.push(
                div(
                    t(i % 2 !== 0 ? (`↦${floor.floor.name}` + (floor.died_from !== null ? ' (†)' : '')) : ''),
                    style(`width: ${percentage}%`),
                    cl('r', 'timeline-floor'),
                    event('click', () => window.open(`https://youtu.be/${video.id}?t=${floorStartsAt}`, '_blank')),

                    ...(floor.events.filter(event => event.event_type === 4).map(bossfight => {
                        isaacImage(bossfight, 1, false)
                    })),

                    popup({ top: 50, left: 0 },
                        timelinePopupContent(floor, submission.played_characters[floor.run_number - 1])
                    ),
                )
            );

            floorLowerElements.push(
                div(
                    t(i % 2 !== 0 ? (`↦${floor.floor.name}` + (floor.died_from !== null ? ' (†)' : '')) : ''),
                    style(`width: ${percentage}%`),
                    cl('timeline-floorname', 'l', floor.died_from ? ' orange' : null)
                )
            );
        }

        // draw the 3 timeline lanes
        new Render([
            Div(
                div(
                    cl('timeline-flex'),
                    ...floorUpperElements
                ),
                div(
                    cl('timeline-flex'),
                    ...floorElements
                ),
                div(
                    cl('timeline-flex'),
                    ...floorLowerElements
                )
            )
        ], containerId);
    });
}


function timelinePopupContent(currentFloor, currentCharacter) {
    const bossfights = floor.events.filter(event => event.event_type === 4);
    const numberOfBossfights = bossfights.length;

    const minutes = Math.floor(floor.duration / 60);
    const seconds = floor.duration - minutes * 60;

    const minutesString = minutes ? `${minutes.toString(10)} ${(minutes === 1 ? 'minute' : 'minutes')}` : '';
    const conditionalComma = minutes ? ', ' : '';
    const secondsString = `${seconds.toString(10)} ${seconds === 1 ? 'second' : 'seconds'}`;

    const wonTheRun = currentFloor.events.filter(event => event.event_type === 16);
    const lostTheRun = currentFloor.events.filter(event => event.event_type === 17);

    return Div(
        cl('c'),

        h4(
            t(currentFloor.floor.name)
        ),
        p(
            t(`~ ${minutesString}${conditionalComma}${secondsString}`)
        ),
        hr(),
        numberOfBossfights === 0 ? p(
            t('No bossfights on this floor')
        ) : bossfights.map(bossfight => {
            return p(
                span(
                    t(numberOfBossfights > 1 ? `Bossfight ${bossfightCounter}:` : 'Bossfight:')
                ),
                br(),
                isaacImage(bossfight, 1),
                br(),
                strong(
                    t(bossfight.r1.name)
                )
            )
        }),
        wonTheRun && wonTheRun.length > 0 ? div(
            hr(),
            p(
                t(`${currentCharacter.character.name} won the run!`)
            )
        ) : do_nothing,
        lostTheRun && lostTheRun.length > 0 ? div(
            hr(),
            p(
                t('NL was killed by')
            ),
            isaacImage(lostTheRun[0], 1),
            p(
                t(lostTheRun[0].r1.name)
            )
        ) : do_nothing
    );
}
