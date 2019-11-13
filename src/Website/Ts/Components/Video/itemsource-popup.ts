import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { IsaacImage } from "../General/isaac-image";

export class ItemsourcePopup implements Component {
    E: FrameworkElement;

    constructor(event: GameplayEvent, twoPlayerMode: boolean) {

        if (!event.r1 || !event.r2) {
            this.E = {
                e: ['div']
            }
        } else {
            const renderTwoPlayerPart = twoPlayerMode === true && event.player !== null;

            const twoPlayerPart: FrameworkElement = renderTwoPlayerPart
                ? {
                    e: ['div'],
                    c: [
                        {
                            e: ['hr']
                        },
                        {
                            e: ['span', 'Collected by:']
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
                        e: ['h3', 'Item Collected']
                    },
                    {
                        e: ['hr']
                    },
                    {
                        e: ['span', event.r1.name]
                    },
                    {
                        e: ['br']
                    },
                    new IsaacImage(event, 2, undefined, false),
                    {
                        e: ['span', ' ⟹ ']
                    },
                    new IsaacImage(event, 1, undefined, false),
                    {
                        e: ['br']
                    },
                    {
                        e: ['span', `From: ${event.r2.name}`]
                    },
                    twoPlayerPart
                ]
            };
        }
    }
}