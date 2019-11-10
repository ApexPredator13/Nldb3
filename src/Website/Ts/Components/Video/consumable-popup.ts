﻿import { Component, FrameworkElement, Attribute } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { IsaacImageComponent } from "../General/isaac-image";

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
                    e: ['h3', header]
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