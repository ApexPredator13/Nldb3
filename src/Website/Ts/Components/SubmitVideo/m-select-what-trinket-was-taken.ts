import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { SearchboxComponent } from "../General/searchbox";
import { BackToMainSelection } from "./back-to-main-selection";

export class SelectWhatTrinketWasTaken<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedTrinketProcessor: (trinketId: string) => any,
        allTrinkets: Promise<Array<IsaacResource> | null>
    ) {
        const trinketSelectBox = new SearchboxComponent<TSubscriber>(subscriber, 19, allTrinkets, false);
        trinketSelectBox.Subscribe(selectedTrinketProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'What trinket was taken?']
                },
                {
                    e: ['p', 'Note: only select trinkets that NL took and used for a while, not ones that were merely picked up and dropped again right after!']
                },
                trinketSelectBox,
                {
                    e: ['hr']
                },
                new BackToMainSelection<TSubscriber>(subscriber, selectedTrinketProcessor)
            ]
        }
    }
}