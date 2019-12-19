import { Render, Div, div, t, p, strong, style, cl, h2, hr, br } from "../../Framework/renderer";
import { isaacImage } from "../General/isaac-image";

export function renderPlayedCharacters(video, submissionIndex, containerId) {
    video.then(video => {
        new Render([
            Div(
                video.submissions[submissionIndex].played_characters.map(character => {

                    // extract necessary data for the character
                    const numberOfFloors = character.played_floors.length;
                    const numberOfItemsCollected = character.played_floors.map(floor => {
                        const itemEvents = floor.events.filter(event => event.event_type === 2 || event.event_type === 18);
                        return itemEvents.length;
                    }).reduce((acc, curr) => acc + curr);

                    const numberOfBossfights = character.played_floors.map(floor => {
                        const bossfightEvents = floor.events.filter(event => event.event_type === 4);
                        return bossfightEvents.length;
                    }).reduce((acc, curr) => acc + curr);

                    const floor = character.played_floors[character.played_floors.length - 1].floor;


                    // return character info for every played character
                    return div(
                        cl('display-inline', 'played-character'),
                        style('vertical-align: top'),

                        h2(
                            strong(
                                style(`color: ${character.character.color}`),
                                t(character.character.name)
                            )
                        ),
                        isaacImage(character.character),
                        hr(),
                        p(
                            span(
                                t(`${character.character.name} went through ${numberOfFloors.toString(10)} floors,`)
                            ),
                            br(),
                            span(
                                t(`collected ${numberOfItemsCollected.toString(10)} items,`)
                            ),
                            br(),
                            span(
                                t(`and encountered ${numberOfBossfights.toString(10)} bosses.`)
                            )
                        ),
                        hr(),

                        // character won or died
                        character.died_from ? div(
                            p(
                                t(`${character.character.name} was killed by ${character.died_from.name}`)
                            ),
                            isaacImage(character.died_from),
                            p(
                                span(
                                    t('on')
                                ),
                                span(
                                    strong(
                                        style(`color: ${floor.color}`),
                                        t(`${floor.name === 'Chest' ? 'the Chest' : floor.name}`)
                                    )
                                )
                            )
                        ) : div(
                            p(
                                span(
                                    strong(
                                        t(`${character.character.name} won the run!`)
                                    )
                                )
                            )
                        )
                    )
                })
            )
        ], containerId);
    });
}
