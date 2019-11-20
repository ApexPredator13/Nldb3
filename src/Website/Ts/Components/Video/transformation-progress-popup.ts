import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { IsaacImage } from "../General/isaac-image";

export class TransformationProgressPopup implements Component {
    E: FrameworkElement;

    constructor(event: GameplayEvent, upscale: boolean, showRunNumber: boolean = false, top?: number) {
        if (event.r1 && event.r2 && event.r3) {
            const runNumber = new Array<FrameworkElement>();

            if (showRunNumber) {
                runNumber.push({ e: ['p', `Run ${event.run_number.toString(10)}`] });
                runNumber.push({ e: ['hr'] });
            }

            this.E = {
                e: ['div'],
                a: [[A.Class, 'popup c' + (upscale ? '' : ' downscale')], top ? [A.Style, `top: ${top.toString(10)}px`] : null],
                c: [
                    {
                        e: ['h3', 'Transformation Progress']
                    },
                    {
                        e: ['hr']
                    },
                    ...runNumber,
                    new IsaacImage(event, 1, undefined, upscale),
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

