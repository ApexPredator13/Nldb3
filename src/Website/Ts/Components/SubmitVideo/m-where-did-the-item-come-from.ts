import { Component, FrameworkElement, EventType, A } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/Boxes";
import { SearchboxComponent } from "../Gen../General/Searchboxport { ComponentWithModal } from "../../Framework/ComponentBaseClasses/component-with-modal";
import { YoutubePlayer } from "./youtube-player";
import { HelpSelectItemsource } from "./help-select-itemsource";
import { BackToMainSelection } from "./back-to-main-selection";

export class WhereDidTheItemComeFrom<TSubscriber extends Object> extends ComponentWithModal implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: TSubscriber,
        itemSources: Promise<Array<IsaacResource> | null>,
        selectedItemSourceProcessor: (id: string) => any,
        youtubePlayer: YoutubePlayer,
        touchedItem: boolean
    ) {
        super(youtubePlayer);

        const commonSourcesBoxes = new Boxes(subscriber, 8, itemSources, null, false, 10);
        commonSourcesBoxes.Subscribe(selectedItemSourceProcessor);
        const allSourcesSearchbox = new SearchboxComponent(subscriber, 9, itemSources, false);
        allSourcesSearchbox.Subscribe(selectedItemSourceProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', touchedItem ? 'What spawned the spacebar item NL touched and put down again?' : 'Where did the item come from?']
                },
                commonSourcesBoxes,
                {
                    e: ['hr']
                },
                allSourcesSearchbox,
                {
                    e: ['hr']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', '❔ ']
                        },
                        {
                            e: ['a', 'What should I select??'],
                            v: [[EventType.Click, () => super.ShowModal(new HelpSelectItemsource())]],
                            a: [[A.Class, 'hand u']]
                        },
                        {
                            e: ['br']
                        },
                        new BackToMainSelection<TSubscriber>(subscriber, selectedItemSourceProcessor)
                    ]
                }
            ]
        }
    }
}

