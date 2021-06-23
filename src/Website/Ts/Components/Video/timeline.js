import { Html, Div, div, t, style, cl, event, popup, h4, hr, br, strong, do_nothing, p, span } from "../../Framework/renderer";
import { isaacImage } from "../General/isaac-image";
import { isCoop } from "./is-coop";

export function renderTimeline(video, submissionIndex, containerId) {
    video.then(video => {

        const coop = isCoop(video);

        const submission = video.submissions[submissionIndex];

        // floors are identical in co-op play, so we only need to get every second floor
        const floors = coop
            ? submission.played_characters.filter(x => x.run_number % 2 === 0).flatMap(x => x.played_floors)
            : submission.played_characters.flatMap(x => x.played_floors)

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

            let videoLength = hours * 3600 + minutes * 60 + seconds;

            if (coop) {
                videoLength /= 2;
            }
            
            const floorLength = floor.duration - 0.01;
            const percentage = (100 * floorLength) / videoLength - 0.1;

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

            const bossfightEvents = floor.events.filter(event => event.event_type === 4);
            floorElements.push(
                div(
                    style(`width: ${percentage}%; background-color: ${floor.floor.color}`),
                    cl('r', 'timeline-floor'),
                    event('click', () => window.open(`https://youtu.be/${video.id}?t=${floorStartsAt}`, '_blank')),

                    ...bossfightEvents.map(bossfight => isaacImage(bossfight, 1, false)),

                    popup({ top: 50, right: 0 },
                        timelinePopupContent(floor, submission.played_characters[floor.run_number - 1], coop)
                    ),
                )
            );

            floorLowerElements.push(
                div(
                    t(i % 2 !== 0 ? (`↦${floor.floor.name}` + (floor.died_from !== null ? ' (†)' : '')) : ''),
                    style(`width: ${percentage}%`),
                    cl('timeline-floorname', 'l', floor.died_from ? 'orange' : null)
                )
            );
        }

        // draw the 3 timeline lanes
        new Html([
            Div(
                style('width: 98%; margin: 1rem auto;'),
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


function timelinePopupContent(currentFloor, currentCharacter, coop) {
    const bossfights = currentFloor.events.filter(event => event.event_type === 4);
    const numberOfBossfights = bossfights.length;

    const minutes = Math.floor(currentFloor.duration / 60);
    const seconds = currentFloor.duration - minutes * 60;

    const minutesString = minutes ? `${minutes.toString(10)} ${(minutes === 1 ? 'minute' : 'minutes')}` : '';
    const conditionalComma = minutes ? ', ' : '';
    const secondsString = `${seconds.toString(10)} ${seconds === 1 ? 'second' : 'seconds'}`;

    const wonTheRun = currentFloor.events.filter(event => event.event_type === 16);
    const lostTheRun = currentFloor.events.filter(event => event.event_type === 1);

    let bossfightCounter = 1;
    const bossfightSectionElements = numberOfBossfights === 0 ? [p(
        t('No bossfights on this floor')
    )] : bossfights.map(bossfight => {
        return p(
            span(
                t(numberOfBossfights > 1 ? `Bossfight ${bossfightCounter++}:` : 'Bossfight:')
            ),
            br(),
            isaacImage(bossfight, 1),
            br(),
            strong(
                t(bossfight.r1.name)
            )
        )
    });

    return Div(
        cl('c'),

        h4(
            t(currentFloor.floor.name)
        ),
        p(
            t(`~ ${minutesString}${conditionalComma}${secondsString}`)
        ),
        hr(),
        ...bossfightSectionElements,
        wonTheRun && wonTheRun.length > 0 ? div(
            hr(),
            p(
                t(coop ? 'The team won!' : `${currentCharacter.character.name} won the run!`)
            )
        ) : do_nothing,
        lostTheRun && lostTheRun.length > 0 ? div(
            hr(),
            p(
                t(coop ? 'Both players were killed by' : 'NL was killed by')
            ),
            isaacImage(lostTheRun[0], 1),
            p(
                t(lostTheRun[0].r1.name)
            )
        ) : do_nothing
    );
}
