import { Component, FrameworkElement, EventType, A } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { Boxes } from "../General/boxes";
import { SearchboxComponent } from "../General/searchbox";
import { ComponentWithModal } from "../../Framework/ComponentBaseClasses/component-with-modal";
import { YoutubePlayer } from "./youtube-player";
import { HelpSelectItemsource } from "./help-select-itemsource";

export class WhereDidTheItemComeFrom<TSubscriber> extends ComponentWithModal implements Component {
    E: FrameworkElement;

    constructor(
        subscriber: ThisType<TSubscriber>,
        itemSources: Promise<Array<IsaacResource> | null>,
        selectedItemSourceProcessor: (id: string) => any,
        private youtubePlayer: YoutubePlayer
    ) {
        super();

        const commonSourcesBoxes = new Boxes(subscriber, 8, itemSources, null, false, 10);
        commonSourcesBoxes.Subscribe(selectedItemSourceProcessor);
        const allSourcesSearchbox = new SearchboxComponent(subscriber, 9, itemSources, false);
        allSourcesSearchbox.Subscribe(selectedItemSourceProcessor);

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['h2', 'Where did the item come from?']
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
                            e: ['a', 'What should I select??'],
                            v: [[EventType.Click, () => this.ShowHelp()]],
                            a: [[A.Class, 'hand u']]
                        }
                    ]
                }
            ]
        }
    }

    private ShowHelp() {
        this.youtubePlayer.getYoutubePlayer().pauseVideo();
        super.ShowModal(new HelpSelectItemsource());
    }
}

