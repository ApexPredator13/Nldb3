import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { BiblethumpImage } from "./biblethump-image";
import { DismissModal } from "./dismiss-modal";

export class GenericError implements Component {
    E: FrameworkElement;

    constructor(errorMessage: string) {
        this.E = {
            e: ['div'],
            a: [[A.Class, 'modal-container']],
            c: [
                {
                    e: ['h1', 'An error has occurred!']
                },
                new BiblethumpImage(),
                {
                    e: ['hr']
                },
                {
                    e: ['p', 'The errormessage is:']
                },
                {
                    e: ['p', errorMessage],
                    a: [[A.Class, 'orange']]
                },
                new DismissModal()
            ]
        }
    }
}

