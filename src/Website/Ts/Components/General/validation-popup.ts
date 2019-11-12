import { Component, FrameworkElement, Attribute } from "../../Framework/renderer";

export class ValidationPopup implements Component {
    E: FrameworkElement;

    constructor(message: string, inputElement: HTMLElement) {
        const parent = inputElement.parentElement
        if (!parent) {
            this.E = {
                e: ['div']
            }
            return;
        }

        const parentRect = parent.getBoundingClientRect();
        const inputRect = inputElement.getBoundingClientRect();
        const distanceToLeft = parentRect.left - inputRect.left;

        this.E = {
            e: ['div'],
            a: [[Attribute.Class, 'popup'], [Attribute.Style, `top: -80px; left: ${Math.floor(-distanceToLeft)}px; right: auto`]],
            c: [
                {
                    e: ['p', message]
                }
            ]
        }
    }
}


