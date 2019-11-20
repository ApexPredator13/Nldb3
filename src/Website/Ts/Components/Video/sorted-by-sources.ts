import { Component, FrameworkElement, AsyncComponentPart, A } from "../../Framework/renderer";
import { IsaacImage } from "../General/isaac-image";
import { IsaacResource } from "../../Models/isaac-resource";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { Video } from "../../Models/video";

type sortedItems = {
    source: IsaacImage,
    items: Array<IsaacImage>
};

export class ItemsSortedBySources implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>

    private results = new Map<string, sortedItems>();

    constructor(video: Promise<Video>, submissionToUse: number) {

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['table'],
                    a: [[A.Id, 'sorted-items-table']],
                    c: [
                        {
                            e: ['thead'],
                            c: [
                                {
                                    e: ['tr'],
                                    c: [
                                        {
                                            e: ['th', 'Item Source']
                                        },
                                        {
                                            e: ['th', 'Items']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        this.A = this.CreateAsyncPart(video, submissionToUse);
    }

    private AddToResult(item: IsaacResource, source: IsaacResource) {
        if (this.results.has(source.id)) {
            const sortedItems = this.results.get(source.id);
            if (sortedItems) {
                sortedItems.items.push(new IsaacImage(item))
            }
        } else {
            const entry: sortedItems = {
                source: new IsaacImage(source),
                items: new Array<IsaacImage>(new IsaacImage(item))
            }
            this.results.set(source.id, entry);
        }
    }

    private CreateAsyncPart(video: Promise<Video>, submissionToUse: number): Array<AsyncComponentPart> {
        const part: AsyncComponentPart = {
            A: true,
            I: 'sorted-items-table',
            P: video.then(video => {
                for (const character of video.submissions[submissionToUse].played_characters) {
                    for (const floor of character.played_floors) {
                        for (const event of floor.events) {
                            if (event.event_type === GameplayEventType.ItemCollected || event.event_type === GameplayEventType.ItemTouched) {
                                if (event.r1 && event.r2) {
                                    this.AddToResult(event.r1, event.r2);
                                }
                            }
                        }
                    }
                }

                const lines = new Array<FrameworkElement>();

                for (const line of this.results) {
                    lines.push({
                        e: ['tr'],
                        c: [
                            {
                                e: ['td'],
                                a: [[A.Class, 'c']],
                                c: [line[1].source]
                            },
                            {
                                e: ['td'],
                                c: line[1].items
                            }
                        ]
                    });
                }

                return {
                    e: ['tbody'],
                    c: lines
                }
            })
        };

        return [part];
    }
}

