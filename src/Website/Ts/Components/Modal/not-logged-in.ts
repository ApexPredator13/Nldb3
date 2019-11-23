import { Component, FrameworkElement, A, EventType } from "../../Framework/renderer";
import { signin } from "../../Framework/Customizable/authentication";
import { BiblethumpImage } from "./biblethump-image";
import { DismissModal } from "./dismiss-modal";
import { ComponentWithModal } from "../../Framework/ComponentBaseClasses/component-with-modal";

export class NotLoggedInModal extends ComponentWithModal implements Component {
    E: FrameworkElement;

    constructor() {
        super();

        this.E = {
            e: ['div'],
            a: [[A.Class, 'modal-container']],
            c: [
                {
                    e: ['h1', 'Not logged in!']
                },
                new BiblethumpImage(),
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'Please ']
                        },
                        {
                            e: ['span'],
                            c: [
                                {
                                    e: ['a', 'log yourself in'],
                                    a: [[A.Class, 'u hand orange']],
                                    v: [[EventType.Click, () => signin()]]
                                }
                            ]
                        },
                        {
                            e: ['span', ' or '],
                        },
                        {
                            e: ['span'],
                            c: [
                                {
                                    e: ['a', 'create an account'],
                                    a: [[A.Class, 'u hand orange']],
                                    v: [[EventType.Click, () => signin()]]
                                }
                            ]
                        },
                        {
                            e: ['span', ' before proceeding.']
                        }
                    ]
                },
                new DismissModal()
            ]
        }
    }
}

