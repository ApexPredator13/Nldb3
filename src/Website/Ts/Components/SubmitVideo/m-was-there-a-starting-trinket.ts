import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/renderBoxes";
import { SearchboxComponent } from "../General/renderSearchbox";

export class WasThereAStartingTrinket<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedStaringTrinketProcessor: (trinketId: string) => any,
        noStaringTrinketIcon: Array<IsaacResource>,
        trinkets: Promise<Array<IsaacResource> | null>,
        firstPrompt: boolean
    ) {
        const box = new Boxes(subscriber, 40, noStaringTrinketIcon, '/img/gameplay_events.png', false);
        box.Subscribe(selectedStaringTrinketProcessor);

        const trinketSearchbox = new SearchboxComponent(subscriber, 50, trinkets, false);
        trinketSearchbox.Subscribe(selectedStaringTrinketProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', firstPrompt ? 'Did the character start with any trinkets?' : 'What other trinket did the character start with?']
                },
                box,
                {
                    e: ['hr']
                },
                trinketSearchbox
            ]
        }
    }
}