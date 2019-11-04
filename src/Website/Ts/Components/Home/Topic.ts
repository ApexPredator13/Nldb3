import { Component, Attribute, FrameworkElement } from "../../Framework/renderer";

export class TopicComponent implements Component {

    E: FrameworkElement;

    constructor(id: string, yOffset: string) {
        this.E = {
            e: ['div'],
            a: [[Attribute.Class, 'topic'], [Attribute.Id, id]],
            c: [
                {
                    e: ['div'],
                    a: [[Attribute.Style, `background: url('/img/frontpage.png') 0px ${yOffset}px transparent`]]
                },
                { e: ['p', 'Isaac Episodes'] }
            ]
        };
    }
}


