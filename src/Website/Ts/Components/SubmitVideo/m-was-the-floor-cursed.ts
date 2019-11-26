import { Component, FrameworkElement } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/boxes";
import { SearchboxComponent } from "../General/searchbox";

export class WasTheFloorCursed<TSubscriber extends Object> implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        noCurse: Array<IsaacResource>,
        allCurses: Promise<Array<IsaacResource> | null>,
        selectedCurseProcessor: (id: string) => any
    ) {
        const noCurseBox = new Boxes<TSubscriber>(subscriber, 6, noCurse, '/img/gameplay_events.png', false);
        noCurseBox.Subscribe(selectedCurseProcessor);
        const allCursesSearchBox = new SearchboxComponent<TSubscriber>(subscriber, 7, allCurses, false);
        allCursesSearchBox.Subscribe(selectedCurseProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'Was the floor cursed?']
                },
                noCurseBox,
                {
                    e: ['hr']
                },
                allCursesSearchBox
            ]
        }
    }
}