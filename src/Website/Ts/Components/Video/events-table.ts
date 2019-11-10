import { Component, FrameworkElement, AsyncComponentPart, Attribute } from "../../Framework/renderer";
import { SubmittedEpisode } from "../../Models/submitted-episode";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { IsaacImageComponent, imageComponentInit } from "../General/isaac-image";
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

    constructor(private video: Promise<Video>, private episodeIndex: number) {
        this.E = {
            e: ['div'],
            a: [[Attribute.Id, this.containerId], [Attribute.Class, 'video-page-box']]
        };

        this.A = [
            this.CreateTable()
        ];
    }

    private CreateTable(): AsyncComponentPart {
        const componentPart: AsyncComponentPart = {
            I: this.containerId,
            P: this.video.then(v => {

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
                                            a: [[Attribute.Colspan, '2']]
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
                console.log('two player mode');
                const itemsAndPopups = this.CreateItemsAndPopupsForFloor(floor, e.is_two_player);
                const transformationProgress = this.CreateTransformationProgress(floor, e.is_two_player);
                const transformationComplete = this.CreateTransformationComplete(floor, e.is_two_player);
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
                            a: [[Attribute.Style, positionRelative]],
                            c: itemsAndPopups
                        },
                        {
                            e: ['td'],
                            a: [[Attribute.Style, positionRelative]],
                            c: consumables
                        },
                        {
                            e: ['td'],
                            a: [[Attribute.Style, positionRelative]],
                            c: trinkets
                        },
                        {
                            e: ['td'],
                            a: [[Attribute.Style, positionRelative]],
                            c: transformationProgress
                        },
                        {
                            e: ['td'],
                            a: [[Attribute.Style, positionRelative]],
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
                const init: imageComponentInit = {
                    event: event,
                    resourceToUse: 1,
                    popup: {
                        component: ItemsourcePopup,
                        twoPlayerMode: twoPlayerMode
                    }
                };
                itemsAndPopups.push(new IsaacImageComponent(init));
            }
        }

        return itemsAndPopups;
    }


    private CreateTransformationProgress(floor: PlayedFloor, twoPlayerMode: boolean): Array<Component> {
        const transformationProgress = new Array<Component>();

        for (const event of floor.events) {
            if (event.event_type === GameplayEventType.TransformationProgress && event.r2 && typeof (event.r3) === 'number') {
                const init: imageComponentInit = {
                    event: event,
                    resourceToUse: 1,
                    popup: {
                        component: TransformationProgressPopup,
                        twoPlayerMode: twoPlayerMode
                    }
                };
                transformationProgress.push(new IsaacImageComponent(init));
            }
        }

        return transformationProgress;
    }


    private CreateTransformationComplete(floor: PlayedFloor, twoPlayerMode: boolean): Array<Component> {
        const transformationComplete = new Array<Component>();

        for (const event of floor.events) {
            if (event.event_type === GameplayEventType.TransformationComplete && event.r2) {
                const init: imageComponentInit = {
                    event: event,
                    resourceToUse: 2,
                    popup: {
                        component: TransformationCompletePopup,
                        twoPlayerMode: twoPlayerMode
                    }
                };
                transformationComplete.push(new IsaacImageComponent(init));
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
                const init: imageComponentInit = {
                    event: event,
                    resourceToUse: 1,
                    popup: {
                        component: ConsumablePopup,
                        twoPlayerMode: twoPlayerMode
                    }
                };
                consumables.push(new IsaacImageComponent(init));
            }
        }

        return consumables;
    }

    private CreateTrinketProgress(floor: PlayedFloor, twoPlayerMode: boolean): Array<Component> {
        const trinkets = new Array<Component>();

        for (const event of floor.events) {
            if (event.event_type === GameplayEventType.Trinket) {
                const init: imageComponentInit = {
                    event: event,
                    resourceToUse: 1,
                    popup: {
                        component: TrinketPopup,
                        twoPlayerMode: twoPlayerMode
                    }
                };
                trinkets.push(new IsaacImageComponent(init));
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
                    a: [[Attribute.Colspan, '6']]
                }
            ]
        };
    }
}