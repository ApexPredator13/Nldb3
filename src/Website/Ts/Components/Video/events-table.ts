import { Component, FrameworkElement, AsyncComponentPart, A } from "../../Framework/renderer";
import { SubmittedEpisode } from "../../Models/submitted-episode";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { IsaacImage } from "../General/isaac-image";
import { ItemsourcePopup } from "./itemsource-popup";
import { TransformationProgressPopup } from "./transformation-progress-popup";
import { TransformationCompletePopup } from "./transformation-complete-popup";
import { Video } from "../../Models/video";
import { PlayedFloor } from "../../Models/played-floor";
import { PlayedCharacter } from "../../Models/played-character";
import { ConsumablePopup } from "./consumable-popup";
import { TrinketPopup } from "./trinket-popup";

export class EventsTableComponent implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    private containerId = 'video-page-tables';

    constructor(private video: Promise<Video | null>, private episodeIndex: number) {
        this.E = {
            e: ['div'],
            a: [[A.Id, this.containerId]]
        };

        this.A = [
            this.CreateTable()
        ];
    }

    private CreateTable(): AsyncComponentPart {
        const componentPart: AsyncComponentPart = {
            I: this.containerId,
            P: this.video.then(v => {

                if (!v) {
                    const failedToLoad: FrameworkElement = {
                        e: ['div']
                    };
                    return failedToLoad;
                }

                const e = v.submissions[this.episodeIndex];

                const floors: Array<FrameworkElement> = this.BuildFloors(e);

                const element: FrameworkElement = {
                    e: ['table'],
                    c: [
                        {
                            e: ['thead'],
                            c: [
                                {
                                    e: ['tr'],
                                    c: [
                                        {
                                            e: ['th', 'Floor']
                                        },
                                        {
                                            e: ['th', 'Items']
                                        },
                                        {
                                            e: ['th', 'Consumables']
                                        },
                                        {
                                            e: ['th', 'Trinkets']
                                        },
                                        {
                                            e: ['th', 'Transformation'],
                                            a: [[A.Colspan, '2']]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['tbody'],
                            c: floors
                        }
                    ]
                };
                return element;
            })
        };

        return componentPart;
    }

    private BuildFloors(e: SubmittedEpisode): Array<FrameworkElement> {

        const lines: Array<FrameworkElement> = new Array<FrameworkElement>();

        // loop through the enitre run
        for (const character of e.played_characters) {

            // create a row for every run
            const runHeader = this.CreateRunHeader(character);
            lines.push(runHeader);

            // create a row for every floor
            for (const floor of character.played_floors) {

                // create item icons and popups
                const itemsAndPopups = this.CreateItemsAndPopupsForFloor(floor, e.is_two_player);
                const transformationProgress = this.CreateTransformationProgress(floor);
                const transformationComplete = this.CreateTransformationComplete(floor);
                const consumables = this.CreateConsumablesProgress(floor, e.is_two_player);
                const trinkets = this.CreateTrinketProgress(floor, e.is_two_player);
                    
                const positionRelative = 'position: relative';

                const line: FrameworkElement = {
                    e: ['tr'],
                    c: [
                        {
                            e: ['td', `(${floor.floor_number}) ${floor.floor.name}`]
                        },
                        {
                            e: ['td'],
                            a: [[A.Style, positionRelative]],
                            c: itemsAndPopups
                        },
                        {
                            e: ['td'],
                            a: [[A.Style, positionRelative]],
                            c: consumables
                        },
                        {
                            e: ['td'],
                            a: [[A.Style, positionRelative]],
                            c: trinkets
                        },
                        {
                            e: ['td'],
                            a: [[A.Style, positionRelative]],
                            c: transformationProgress
                        },
                        {
                            e: ['td'],
                            a: [[A.Style, positionRelative]],
                            c: transformationComplete
                        }
                    ]
                }
                lines.push(line);
            }
        }

        return lines;
    }

    private CreateItemsAndPopupsForFloor(floor: PlayedFloor, twoPlayerMode: boolean): Array<Component> {
        const itemsAndPopups = new Array<Component>();

        for (const event of floor.events) {
            if (event.event_type === GameplayEventType.ItemCollected || event.event_type === GameplayEventType.ItemTouched) {
                itemsAndPopups.push(new IsaacImage(event, 1, new ItemsourcePopup(event, twoPlayerMode)));
            }
        }

        return itemsAndPopups;
    }


    private CreateTransformationProgress(floor: PlayedFloor): Array<Component> {
        const transformationProgress = new Array<Component>();

        for (const event of floor.events) {
            if (event.event_type === GameplayEventType.TransformationProgress && event.r2 && typeof (event.r3) === 'number') {
                transformationProgress.push(new IsaacImage(event, 1, new TransformationProgressPopup(event, false)));
            }
        }

        return transformationProgress;
    }


    private CreateTransformationComplete(floor: PlayedFloor): Array<Component> {
        const transformationComplete = new Array<Component>();

        for (const event of floor.events) {
            if (event.event_type === GameplayEventType.TransformationComplete && event.r2) {
                transformationComplete.push(new IsaacImage(event, 2, new TransformationCompletePopup(event, false)));
            } else if (event.event_type === GameplayEventType.RerollTransform) {
                transformationComplete.push(new IsaacImage(event, 2, new TransformationCompletePopup(event, true)));
            }
        }

        return transformationComplete;
    }

    private CreateConsumablesProgress(floor: PlayedFloor, twoPlayerMode: boolean): Array<Component> {
        const consumables = new Array<Component>();

        for (const event of floor.events) {
            if (event.event_type === GameplayEventType.OtherConsumable
                || event.event_type === GameplayEventType.Pill
                || event.event_type === GameplayEventType.Rune
                || event.event_type === GameplayEventType.TarotCard) {
                consumables.push(new IsaacImage(event, 1, new ConsumablePopup(event, twoPlayerMode)));
            }
        }

        return consumables;
    }

    private CreateTrinketProgress(floor: PlayedFloor, twoPlayerMode: boolean): Array<Component> {
        const trinkets = new Array<Component>();

        for (const event of floor.events) {
            if (event.event_type === GameplayEventType.Trinket) {
                trinkets.push(new IsaacImage(event, 1, new TrinketPopup(event, twoPlayerMode)));
            }
        }

        return trinkets;
    }


    private CreateRunHeader(character: PlayedCharacter): FrameworkElement {
        return {
            e: ['tr'],
            c: [
                {
                    e: ['td', character.seed ? `Run ${character.run_number} (Seed: ${character.seed})` : `Run ${character.run_number}`],
                    a: [[A.Colspan, '6'], [A.Style, 'background-color: rgba(255,255,255,0.1);']]
                }
            ]
        };
    }
}