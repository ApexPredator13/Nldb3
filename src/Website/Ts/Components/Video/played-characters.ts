import { Component, FrameworkElement, A, AsyncComponentPart } from "../../Framework/renderer";
import { Video } from "../../Models/video";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { IsaacImage } from "../General/isaac-image";

export class PlayedCharacters implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    constructor(video: Promise<Video | null>, submissionToUse: number) {
        this.E = {
            e: ['div'],
            a: [[A.Id, 'played-characters-container'], [A.Class, 'video-page-element']],
        }

        this.A = this.CreateAsyncPart(video, submissionToUse);
    }

    private CreateAsyncPart(video: Promise<Video | null>, submissionToUse: number): Array<AsyncComponentPart> {
        const part: AsyncComponentPart = {
            I: 'played-characters-container',
            P: video.then(video => {
                if (!video) {
                    const failedToLoad: FrameworkElement = {
                        e: ['div']
                    };
                    return failedToLoad;
                }

                const submission = video.submissions[submissionToUse];

                const characterElements = new Array<FrameworkElement>();

                for (const character of submission.played_characters) {

                    const numberOfFloors = character.played_floors.length;
                    const numberOfItemsCollected = character.played_floors.map(floor => {
                        const itemEvents = floor.events.filter(event => event.event_type === GameplayEventType.ItemCollected || event.event_type === GameplayEventType.ItemTouched);
                        return itemEvents.length;
                    }).reduce((acc, curr) => acc + curr);

                    const numberOfBossfights = character.played_floors.map(floor => {
                        const bossfightEvents = floor.events.filter(event => event.event_type === GameplayEventType.Bossfight);
                        return bossfightEvents.length;
                    }).reduce((acc, curr) => acc + curr);

                    const livedOrKilledByPart = new Array<FrameworkElement | Component>();
                    if (character.died_from) {
                        livedOrKilledByPart.push({
                            e: ['p', `${character.character.name} was killed by ${character.died_from.name}`]
                        });
                        livedOrKilledByPart.push(new IsaacImage(character.died_from));
                        const floor = character.played_floors[character.played_floors.length - 1].floor;
                        livedOrKilledByPart.push({
                            e: ['p'],
                            c: [
                                {
                                    e: ['span', 'on ']
                                },
                                {
                                    e: ['span'],
                                    c: [
                                        {
                                            e: ['strong', `${floor.name === 'Chest' ? 'the Chest' : floor.name}`],
                                            a: [[A.Style, `color: ${floor.color}`]],
                                        }
                                    ]
                                }
                            ]
                        });
                    } else {
                        livedOrKilledByPart.push({
                            e: ['p'],
                            c: [
                                {
                                    e: ['span'],
                                    c: [
                                        {
                                            e: ['strong', `${character.character.name} won the run!`],
                                        }
                                    ]
                                }
                            ]
                        });
                    }

                    characterElements.push({
                        e: ['div'],
                        a: [[A.Class, 'display-inline played-character'], [A.Style, 'vertical-align: top;']],
                        c: [
                            {
                                e: ['h2'],
                                c: [
                                    {
                                        e: ['strong', character.character.name],
                                        a: [[A.Style, `color: ${character.character.color};`]]
                                    }
                                ]
                            },
                            new IsaacImage(character.character),
                            {
                                e: ['hr']
                            },
                            {
                                e: ['p'],
                                c: [
                                    {
                                        e: ['span', `${character.character.name} went through ${numberOfFloors.toString(10)} floors,`]
                                    },
                                    {
                                        e: ['br']
                                    },
                                    {
                                        e: ['span', `collected ${numberOfItemsCollected.toString(10)} items,`]
                                    },
                                    {
                                        e: ['br']
                                    },
                                    {
                                        e: ['span', `and encountered ${numberOfBossfights.toString(10)} bosses.`]
                                    }
                                ]
                            },
                            {
                                e: ['hr']
                            },
                            ...livedOrKilledByPart
                        ]
                    });
                }

                return {
                    e: ['div'],
                    a: [[A.Class, 'display-inline']],
                    c: characterElements
                };
            })
        };

        return [part];
    }
}


