import { Component, FrameworkElement, Attribute } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { PlayedFloor } from "../../Models/played-floor";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { IsaacImage } from "../General/isaac-image";
import { PlayedCharacter } from "../../Models/played-character";

export class TimelinePopup implements Component {
    E: FrameworkElement;

    constructor(floor: PlayedFloor, currentCharacter: PlayedCharacter) {

        const bosses = new Array<FrameworkElement>();
        let numberOfBossfights = 0;

        // pre-count bosses for better description
        for (const event of floor.events) {
            if (event.event_type === GameplayEventType.Bossfight) {
                numberOfBossfights++;
            }
        }

        // loop through bossfights
        let bossfightCounter = 0;
        for (let i = 0; i < floor.events.length; ++i) {
            const gameplayEvent = floor.events[i];
            if (gameplayEvent.event_type === GameplayEventType.Bossfight) {
                bossfightCounter++;

                bosses.push({
                    e: ['p'],
                    c: [
                        {
                            e: ['span', numberOfBossfights > 1 ? `Bossfight ${bossfightCounter}:` : 'Bossfight:']
                        },
                        {
                            e: ['br']
                        },
                        new IsaacImage(gameplayEvent, 1),
                        {
                            e: ['br']
                        },
                        {
                            e: ['strong', gameplayEvent.r1.name]
                        }
                    ]
                });
            }
        }

        // if no bossfights were found, add this line
        if (bosses.length === 0) {
            bosses.push({
                e: ['p', 'No bossfights on this floor']
            });
        }

        // check if NL won the run or died on this floor
        let wonEvent: GameplayEvent | undefined;
        const diedFrom = new Array<FrameworkElement>();
        if (floor.died_from) {
            for (const event of floor.events) {
                if (event.event_type === GameplayEventType.WonTheRun) {
                    wonEvent = event;
                }
                if (event.event_type === GameplayEventType.CharacterDied) {
                    diedFrom.push({
                        e: ['hr']
                    }, {
                        e: ['p'],
                        c: [
                            new IsaacImage(event, 1)
                        ]
                    }, {
                        e: ['p', event.r1.name]
                    });
                    break;
                }
            }
        }

        const wonTheRun = new Array<FrameworkElement>();
        if (wonEvent) {
            wonTheRun.push({
                e: ['hr']
            }, {
                e: ['p', `${currentCharacter.character.name} won the run!`]
            });
        }
        
        // print floor duration
        const minutes = Math.floor(floor.duration / 60);
        const seconds = floor.duration - minutes * 60;

        const minutesString = minutes ? `${minutes.toString(10)} ${(minutes === 1 ? 'minute' : 'minutes')}` : '';
        const secondsString = `${seconds.toString(10)} ${seconds === 1 ? 'second' : 'seconds'}`;

        this.E = {
            e: ['div'],
            a: [[Attribute.Class, 'popup c'], [Attribute.Style, 'top: 40px']],
            c: [
                {
                    e: ['h4', floor.floor.name]
                },
                {
                    e: ['p', `~ ${minutesString}, ${secondsString}`]
                },
                {
                    e: ['hr']
                },
                ...bosses,
                ...diedFrom,
                ...wonTheRun
            ]
        }
    }
}