import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { IsaacImage } from "../General/isaac-image";

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
                        a: [[A.Class, event.player === 1 ? 'player-one' : 'player-two']],
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
            a: [[A.Class, 'popup c downscale']],
            c: [
                {
                    e: ['h3', 'A new trinket was used from here on out!']
                },
                {
                    e: ['hr']
                },
                new IsaacImage(event, 1, undefined, false),
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