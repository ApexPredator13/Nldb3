import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { SearchboxComponent } from "../General/searchbox";
import { BackToMainSelection } from "./back-to-main-selection";

export class HowWasTheItemAbsorbed<TSubscriber extends Object> implements Component {
    E: FrameworkElement;

    constructor(subscriber: TSubscriber, absorberProcessor: (absorberId: string) => any, absorbers: Promise<Array<IsaacResource> | null>) {

        const list = new SearchboxComponent<TSubscriber>(subscriber, 13, absorbers, false);
        list.Subscribe(absorberProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'How was the item absorbed?']
                },
                list,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, absorberProcessor)
            ]
        };
    }
}

