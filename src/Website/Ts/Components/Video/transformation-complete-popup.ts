import { Component, FrameworkElement, Attribute } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { IsaacImageComponent } from "../General/isaac-image";

export class TransformationCompletePopup implements Component {
    E: FrameworkElement;

    constructor(event: GameplayEvent) {
        if (event.r1 && event.r2) {
            this.E = {
                e: ['div'],
                a: [[Attribute.Class, 'popup c']],
                c: [
                    {
                        e: ['h3', 'Transformation Complete!']
                    },
                    {
                        e: ['hr']
                    },
                    new IsaacImageComponent({ event: event, resourceToUse: 2 }, false),
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
                    }
                ]
            }
        } else {
            this.E = { e: ['div'] };
        }
    }
}