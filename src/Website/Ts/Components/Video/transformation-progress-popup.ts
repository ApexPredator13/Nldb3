import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { IsaacImage } from "../General/isaac-image";

export class TransformationProgressPopup implements Component {
    E: FrameworkElement;

    constructor(event: GameplayEvent) {
        if (event.r1 && event.r2 && event.r3) {
            this.E = {
                e: ['div'],
                a: [[A.Class, 'popup c downscale']],
                c: [
                    {
                        e: ['h3', 'Transformation Progress']
                    },
                    {
                        e: ['hr']
                    },
                    new IsaacImage(event, 1, undefined, false),
                    {
                        e: ['br']
                    },
                    {
                        e: ['span', `${event.r1.name} collected`]
                    },
                    {
                        e: ['br']
                    },
                    {
                        e: ['hr']
                    },
                    {
                        e: ['span', `${event.r3.toString(10)} / 3 items necessary for ${event.r2.name}`]
                    }
                ]
            }
        } else {
            this.E = { e: ['div'] };
        }
    }
}

