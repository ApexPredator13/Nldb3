import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/Boxes";
import { SearchboxComponent } from "../Gen../General/Searchboxexport class WasThereAStartingItem<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedStaringItemProcessor: (itemId: string) => any,
        noStaringItemIcon: Array<IsaacResource>,
        items: Promise<Array<IsaacResource> | null>,
        firstPrompt: boolean
    ) {
        const box = new Boxes(subscriber, 40, noStaringItemIcon, '/img/gameplay_events.png', false);
        box.Subscribe(selectedStaringItemProcessor);

        const itemSearchbox = new SearchboxComponent(subscriber, 50, items, false);
        itemSearchbox.Subscribe(selectedStaringItemProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', firstPrompt ? 'Did the character start with any items?' : 'What other item did the character start with?']
                },
                box,
                {
                    e: ['hr']
                },
                itemSearchbox
            ]
        }
    }
}