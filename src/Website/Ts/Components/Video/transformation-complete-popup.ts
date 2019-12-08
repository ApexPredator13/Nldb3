import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { IsaacImage } from "../General/isaac-image";

export class TransformationCompletePopup implements Component {
    E: FrameworkElement;

    constructor(event: GameplayEvent, throughReroll: boolean) {
        if (event.r1 && event.r2) {
            this.E = {
                e: ['div'],
                a: [[A.Class, 'popup c downscale']],
                c: [
                    {
                        e: ['h3', 'Transformation Complete!']
                    },
                    {
                        e: ['hr']
                    },
                    new IsaacImage(event, 2, undefined, false),
                    {
                        e: ['br']
                    },
                    {
                        e: ['span', 'NL successfully transformed']
                    },
                    {
                        e: ['br']
                    },
                    {
                        e: ['span', `into ${event.r2.name}`]
                    },
                    {
                        e: ['br']
                    },
                    {
                        e: ['span', throughReroll ? 'after rerolling his character with' : 'by collecting 3 specific items.']
                    },
                    throughReroll ? new IsaacImage(event, 1, undefined, false) : { e: ['div'] }
                ]
            }
        } else {
            this.E = { e: ['div'] };
        }
    }
}

