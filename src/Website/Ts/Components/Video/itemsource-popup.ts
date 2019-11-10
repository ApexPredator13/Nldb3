import { Component, FrameworkElement, Attribute } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { IsaacImageComponent } from "../General/isaac-image";

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
                    new IsaacImageComponent({ event: event, resourceToUse: 2 }, false),
                    {
                        e: ['span', ' ⟹ ']
                    },
                    new IsaacImageComponent({ event: event, resourceToUse: 1 }, false),
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