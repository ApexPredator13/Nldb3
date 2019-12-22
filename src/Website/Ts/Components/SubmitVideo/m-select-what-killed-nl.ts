import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { SearchboxComponent } from "../General/renderSearchbox";
import { BackToMainSelection } from "./back-to-main-selection";

export class SelectWhatKilledNl<TSubscriber> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        selectedEnemyProcessor: (enemyId: string) => any,
        enemies: Promise<Array<IsaacResource> | null>
    ) {
        const searchbox = new SearchboxComponent(subscriber, 22, enemies, false);
        searchbox.Subscribe(selectedEnemyProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', '😐 What killed Nl?']
                },
                searchbox,
                {
                    e: ['hr']
                },
                new BackToMainSelection(subscriber, selectedEnemyProcessor)
            ]
        };
    }
}

