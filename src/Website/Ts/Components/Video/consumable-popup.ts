import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { IsaacImage } from "../General/isaac-image";

export class ConsumablePopup implements Component {
    E: FrameworkElement;

    constructor(event: GameplayEvent, renderTwoPlayerPart: boolean) {
        let header = '';
        switch (event.event_type) {
            case GameplayEventType.OtherConsumable:
                header = 'Consumable Used';
                break;
            case GameplayEventType.Pill:
                header = 'Pill Taken!';
                break;
            case GameplayEventType.Rune:
                header = 'Rune Used!';
                break;
            case GameplayEventType.TarotCard:
                header = 'Tarot Card used!';
                break;
        }

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
                    e: ['h3', header]
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

