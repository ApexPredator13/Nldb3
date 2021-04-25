import { Html, div, Div, id, tr, td, t, attr, popup, cl, h3, hr, br, span, do_nothing, strong, Table, thead, th, tbody, style } from "../../Framework/renderer";
import { isaacImage } from "../General/isaac-image";

function renderEventsTable(videoPromise, submissionIndex, containerId) {
    const tableContainer = 'video-page-tables';

    // draw container
    new Html([
        Div(
            id(tableContainer),
            t('loading data...')
        )
    ], containerId);

    // when video data is available, draw table
    videoPromise.then(v => {
        const submission = v.submissions[submissionIndex];

        new Html([
            Table(
                thead(
                    tr(
                        th(
                            t('Floor')
                        ),
                        th(
                            t('Items')
                        ),
                        th(
                            t('Consumables')
                        ),
                        th(
                            t('Trinkets')
                        ),
                        th(
                            t('Transformation'),
                            attr({ colspan: '2' })
                        )
                    )
                ),
                tbody(
                    ...floors(submission)
                )
            )
        ], tableContainer);
    });
}


function floors(episode) {
    const tableRows = [];

    for (const character of episode.played_characters) {

        tableRows.push(runHeader(character));

        for (const floor of character.played_floors) {
            tableRows.push(
                tr(
                    td(
                        t(`(${floor.floor_number}) ${floor.floor.name}`)
                    ),
                    td(
                        ...itemProgress(floor, episode.is_two_player)
                    ),
                    td(
                        ...consumableProgress(floor, episode.is_two_player)
                    ),
                    td(
                        ...trinketProgress(floor, episode.is_two_player)
                    ),
                    td(
                        ...transformationProgress(floor, false)
                    ),
                    td(
                        ...transformationComplete(floor)
                    )
                )
            )
        }
    }

    return tableRows;
}

function itemProgress(playedFloor, twoPlayerMode) {
    return playedFloor.events
        .filter(event => event.event_type === 2 || event.event_type === 18 || event.event_type === 23)
        .map(event => {

            // 23: item switched out
            // 18: item was briefly touched
            // 2: item was collected
            let header = 'Item Collected';
            switch (event.event_type) {
                case 18: header = 'Item was used briefly'; break;
                case 23: header = 'Item was left behind'; break;
            }

            return div(
                cl('display-inline'),
                style('position: relative; z-index: 1'),
                isaacImage(event, 1),

                popup({ bottom: 65, left: 0 },
                    Div(
                        cl('c'),

                        h3(
                            t(header)
                        ),
                        hr(),
                        span(
                            t(event.r1.name)
                        ),
                        br(),
                        // reverse images if event was 'item left behind' instead of 'item collected / touched'
                        isaacImage(event, event.event_type === 23 ? 1 : 2),
                        span(
                            t(' ⟹ ')
                        ),
                        isaacImage(event, event.event_type === 23 ? 2 : 1),
                        br(),
                        span(
                            t(event.event_type === 23
                                ? `${event.r1.name} was left behind in favor of ${event.r2.name}`
                                : `From  ${event.r2.name}`)
                        ),
                        twoPlayerMode ? div(
                            hr(),
                            span(
                                t('Collected by:')
                            ),
                            br(),
                            span(
                                cl(event.player === 1 ? 'player-one' : 'player-two'),
                                strong(
                                    t(`Player ${event.player ? event.player.toString(10) : ''}`)
                                )
                            )
                        ) : do_nothing
                    )
                )
            );
        })
}


function transformationProgress(playedFloor) {
    return playedFloor.events
        .filter(event => event.event_type === 12)
        .map(event => {
            return div(
                cl('display-inline', 'c'),

                isaacImage(event, 1),
                popup({ bottom: 65, left: 0 },
                    transformationPopupContent(event)
                )
            )
        });
}

function transformationPopupContent(event) {
    return Div(
        h3(
            t('Transformation Progress')
        ),
        hr(),
        isaacImage(event, 1),
        br(),
        span(
            t(`${event.r1.name} collected`)
        ),
        br(),
        hr(),
        span(
            t(`${event.r3.toString(10)} / 3 items necessary for ${event.r2.name}`)
        ),
        br(),
        span(
            t('collected during regular gamplay')
        )
    );
}

function transformationComplete(playedFloor) {
    return playedFloor.events
        .filter(event => event.event_type === 11 || event.event_type === 21)
        .map(event => {
            return div(
                cl('display-inline'),

                isaacImage(event, 2),
                popup({ bottom: 65, left: 0 },
                    Div(
                        cl('c'),

                        h3(
                            t('Transformation Complete!')
                        ),
                        hr(),
                        isaacImage(event, 2),
                        br(),
                        span(
                            t('NL successfully transformed')
                        ),
                        br(),
                        span(
                            t(`into ${event.r2.name}`)
                        ),
                        br(),
                        span(
                            t(event.event_type === 21 ? 'after rerolling his character with' : 'by collecting 3 specific items.')
                        ),
                        event.event_type === 21 ? isaacImage(event, 1) : do_nothing
                    )
                )
            )
        });
}

function consumableProgress(playedFloor, twoPlayerMode) {
    return playedFloor.events
        .filter(event => event.event_type === 10 || event.event_type === 5 || event.event_type === 7 || event.event_type === 6)
        .map(event => {

            let popupHeader = '';
            switch (event.event_type) {
                case 10:
                    popupHeader = 'Consumable Used';
                    break;
                case 5:
                    popupHeader = 'Pill Taken!';
                    break;
                case 7:
                    popupHeader = 'Rune Used!';
                    break;
                case 6:
                    popupHeader = 'Tarot Card used!';
                    break;
            }

            return div(
                cl('display-inline'),
                isaacImage(event, 1),
                popup({ bottom: 65, left: 0 },
                    Div(
                        cl('c'),

                        h3(
                            t(popupHeader)
                        ),
                        hr(),
                        br(),
                        isaacImage(event, 1),
                        br(),
                        span(
                            t(event.r1.name)
                        ),

                        twoPlayerMode ? div(
                            hr(),
                            span(
                                t('Used by:')
                            ),
                            br(),
                            span(
                                cl(event.player === 1 ? 'player-one' : 'player-two'),
                                strong(
                                    t(`Player ${event.player}`)
                                )
                            )
                        ) : do_nothing
                    )
                )
            );
        });
}


function trinketProgress(playedFloor, twoPlayerMode) {
    return playedFloor.events
        .filter(event => event.event_type === 8)
        .map(event => {
            return div(
                cl('display-inline'),

                isaacImage(event, 1),

                popup({ bottom: 65, left: 0 },
                    Div(
                        cl('c'),

                        h3(
                            t('A new trinket was used from here on out!')
                        ),
                        hr(),
                        isaacImage(event, 1),
                        br(),
                        span(
                            t(event.r1.name)
                        ),
                        twoPlayerMode ? div(
                            hr(),
                            span(
                                t('Used by')
                            ),
                            br(),
                            span(
                                cl(event.player === 1 ? 'player-one' : 'player-two'),
                                strong(
                                    t(`Player ${event.player ? event.player.toString(10) : ''}`)
                                )
                            )
                        ) : do_nothing
                    )
                )
            );
        });
}

function runHeader(playedCharacter) {
    return tr(
        td(
            t(playedCharacter.seed ? `Run ${playedCharacter.run_number} (Seed: ${playedCharacter.seed})` : `Run ${playedCharacter.run_number}`),
            attr({ colspan: '6', style: 'background-color: rgba(255,255,255,0.1)' })
        )
    )
}

export {
    transformationPopupContent,
    renderEventsTable
}