import { Component, FrameworkElement, Attribute } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { IsaacImageComponent } from "../General/isaac-image";

export class TrinketPopup implements Component {
    E: FrameworkElement;

    constructor(event: GameplayEvent, renderTwoPlayerPart: boolean) {

        const twoPlayerPart: FrameworkElement = renderTwoPlayerPart
            ? {
                e: ['div'],
                c: [
                    {
                        e: ['hr']
                    },
                    {
                        e: ['span', 'Used by:']
                    },
                    {
                        e: ['br']
                    },
                    {
                        e: ['span'],
                        a: [[Attribute.Class, event.player === 1 ? 'player-one' : 'player-two']],
                        c: [
                            {
                                e: ['strong', `Player ${event.player ? event.player.toString(10) : ''}`]
                            }
                        ]
                    }
                ]
            }
            : { e: ['div'] };

        this.E = {
            e: ['div'],
            a: [[Attribute.Class, 'popup c']],
            c: [
                {
                    e: ['h3', 'A new trinket was used from here on out!']
                },
                {
                    e: ['hr']
                },
                new IsaacImageComponent({ event: event, resourceToUse: 1 }, false),
                {
                    e: ['br']
                },
                {
                    e: ['span', `${event.r1.name}`]
                },
                twoPlayerPart
            ]
        }
    }
}