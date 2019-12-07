import { Component, FrameworkElement, A, render, htmlAttributeNameOf, EventType } from "../../Framework/renderer";
import { SubmittedCompleteEpisode } from "../../Models/submitted-complete-episode";
import { post } from "../../Framework/http";
import { History } from '../../Models/history';
import { IsaacImage } from "../General/isaac-image";
import { SubmittedPlayedCharacter } from "../../Models/submitted-played-character";
import { SubmittedPlayedFloor } from "../../Models/submitted-played-floor";
import { SubmittedGameplayEvent } from "../../Models/submitted-gameplay-event";
import { ComponentWithSubscribers } from "../../Framework/ComponentBaseClasses/component-with-subscribers";
import { ComponentWithModal } from "../../Framework/ComponentBaseClasses/component-with-modal";
import { WarningRemovingCharacterFromHistory } from "./warning-removing-character-from-history";
import { WarningRemovingFloorFromHistory } from "./warning-removing-floor-from-history";
import { ResourceType } from "../../Enums/resource-type";
import { YoutubePlayer } from "./youtube-player";
import { GameplayEventType } from "../../Enums/gameplay-event-type";
import { convertResourceTypeToString } from "../../Enums/enum-to-string-converters";

type removeHistoryElement = {
    valid: boolean,
    characterIndex: number | null,
    floorIndex: number | null,
    eventIndex: number | null,
    eventType: ResourceType | null
}

class HistoryTable<TSubscriber extends Object> extends ComponentWithSubscribers<TSubscriber, removeHistoryElement> implements Component {
    E: FrameworkElement;

    private dataForThisEpisode: SubmittedCompleteEpisode;

    constructor(
        caller: TSubscriber,
        videoId: string,
        removedItemProcessor: (removedElement: removeHistoryElement) => any,
        private youtubePlayer: YoutubePlayer
    ) {
        super(caller, removedItemProcessor);

        this.dataForThisEpisode = {
            VideoId: videoId,
            PlayedCharacters: new Array<SubmittedPlayedCharacter>()
        };

        this.E = {
            e: ['div'],
            a: [[A.Id, 'history-container']],
            c: [
                {
                    e: ['p', 'Event History - click on items to remove them']
                },
                {
                    e: ['table'],
                    a: [[A.Id, 'history']],
                    c: [
                        {
                            e: ['tr'],
                            c: [
                                {
                                    e: ['td', 'Nothing was added yet!']
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }
    
    AddCharacter(character: SubmittedPlayedCharacter) {
        this.dataForThisEpisode.PlayedCharacters.push(character);
        this.ReloadHistory();
    }

    AddFloor(floor: SubmittedPlayedFloor) {
        
        // add time to finished floor
        const currentFloor = this.GetCurrentFloor();
        if (currentFloor) {
            const currentPlayerTime = this.youtubePlayer.GetCurrentTime();
            const timeSoFar = this.RecordedFloorTimeSoFar();
            const timeSpentOnThisFloor = currentPlayerTime - timeSoFar;
            currentFloor.Duration = timeSpentOnThisFloor;
        }

        // then add the next
        const currentCharacter = this.GetCurrentCharacter();
        currentCharacter.PlayedFloors.push(floor);
        this.ReloadHistory();
    }

    AddCurse(event: SubmittedGameplayEvent) {
        const currentFloor = this.GetCurrentFloor();
        if (currentFloor) {
            currentFloor.GameplayEvents.unshift(event);
        }
        this.ReloadHistory();
    }

    AddEvent(event: SubmittedGameplayEvent) {
        const currentFloor = this.GetCurrentFloor();
        if (currentFloor) {
            currentFloor.GameplayEvents.push(event);
        }
        this.ReloadHistory();
    }

    AddEventIfLastEventWasNotOfType(event: SubmittedGameplayEvent, eventType: GameplayEventType, resource1: string) {
        const currentFloor = this.GetCurrentFloor();
        if (currentFloor) {
            if (currentFloor.GameplayEvents.length === 0) {
                currentFloor.GameplayEvents.push(event);
            } else {
                const currentEvent = currentFloor.GameplayEvents[currentFloor.GameplayEvents.length - 1];
                if (currentEvent.EventType !== eventType && currentEvent.RelatedResource1 !== resource1) {
                    currentFloor.GameplayEvents.push(event);
                }
            }
        }
    }

    AddSeed(seed: string | null) {
        const currentCharacter = this.GetCurrentCharacter();
        currentCharacter.Seed = seed;
    }

    GetSeed() {
        const currentCharacter = this.GetCurrentCharacter();
        return currentCharacter.Seed;
    }

    CurrentCharacterHasSeed(): boolean {
        const currentCharacter = this.GetCurrentCharacter();
        if (currentCharacter.Seed) {
            return true;
        } else {
            return false;
        }
    }

    WeAreOnFirstFloor(): boolean {
        const currentCharacter = this.GetCurrentCharacter();
        if (currentCharacter.PlayedFloors.length === 1) {
            return true;
        } else {
            return false;
        }
    }

    CharacterHasNoFloorsSelected(): boolean {
        const currentCharacter = this.GetCurrentCharacter();
        if (!currentCharacter.PlayedFloors || currentCharacter.PlayedFloors.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    CharacterHasStartingItems(): boolean {
        const currentCharacter = this.GetCurrentCharacter();
        const events = currentCharacter.PlayedFloors.flatMap(floor => floor.GameplayEvents);
        return events.some(event => event.EventType === GameplayEventType.ItemCollected && event.RelatedResource2 === 'StartingItem');
    }

    GetCollectedEpisodeData() {
        return this.dataForThisEpisode;
    }

    private RecordedFloorTimeSoFar(): number {
        const character = this.GetCurrentCharacter();
        if (!character.PlayedFloors || character.PlayedFloors.length === 0) {
            return 0;
        }

        const recordedFloorTimeSoFar = character.PlayedFloors
            .map(floor => typeof (floor.Duration) === 'number' ? floor.Duration : 0)
            .reduce((acc, curr) => acc += curr);

        console.log('recorded floor time so far: ', recordedFloorTimeSoFar);
        return recordedFloorTimeSoFar;
    }

    private RemoveHistoryElement(e: Event) {
        const data = this.GetRemoveIndexData(e);
        if (!data.valid) {
            return;
        }

        if (data.characterIndex !== null && data.floorIndex === null && data.eventIndex === null) {
            // user wants to remove character: show confirmation prompt
            const prompt = new WarningRemovingCharacterFromHistory<HistoryTable<TSubscriber>>(this, this.RemoveCharacter, data);
            new ComponentWithModal(this.youtubePlayer).ShowModal(prompt, false);
        } else if (data.characterIndex !== null && data.floorIndex !== null && data.eventIndex === null) {
            // user wants to remove floor: show confirmation prompt
            const prompt = new WarningRemovingFloorFromHistory<HistoryTable<TSubscriber>>(this, this.RemoveFloor, data);
            new ComponentWithModal(this.youtubePlayer).ShowModal(prompt, false)
        } else if (data.characterIndex !== null && data.floorIndex !== null && data.eventIndex !== null) {
            // user wants to remove event: just let him do it
            this.RemoveEvent(data);
        }
    }

    private RemoveCharacter(characterToRemove: removeHistoryElement | null) {
        new ComponentWithModal().DismissModal();
        if (characterToRemove && characterToRemove.characterIndex !== null) {
            this.dataForThisEpisode.PlayedCharacters.splice(characterToRemove.characterIndex, 1);
            this.ReloadHistory();
            super.Emit(characterToRemove);
        }
    }

    private RemoveFloor(floorToRemove: removeHistoryElement | null) {
        new ComponentWithModal().DismissModal();
        if (floorToRemove && floorToRemove.characterIndex !== null && floorToRemove.floorIndex !== null) {
            this.dataForThisEpisode.PlayedCharacters[floorToRemove.characterIndex].PlayedFloors.splice(floorToRemove.floorIndex, 1);
            this.ReloadHistory();
            super.Emit(floorToRemove);
        }
    }

    private RemoveEvent(eventToRemove: removeHistoryElement | null) {
        if (eventToRemove && eventToRemove.characterIndex !== null && eventToRemove.floorIndex !== null && eventToRemove.eventIndex !== null) {
            this.dataForThisEpisode.PlayedCharacters[eventToRemove.characterIndex].PlayedFloors[eventToRemove.floorIndex].GameplayEvents.splice(eventToRemove.eventIndex, 1);
            this.ReloadHistory();
            super.Emit(eventToRemove);
        }
    }

    private GetRemoveIndexData(e: Event): removeHistoryElement {
        const target = e.currentTarget;

        const invalidResult = {
            valid: false,
            characterIndex: null,
            eventIndex: null,
            floorIndex: null,
            eventType: null
        };

        if (!target || !(target instanceof HTMLDivElement)) {
            return invalidResult;
        }

        const characterAttributeName = htmlAttributeNameOf(A.DataC);
        const floorAttributeName = htmlAttributeNameOf(A.DataF);
        const eventAttributeName = htmlAttributeNameOf(A.DataE);
        const eventTypeAttributeName = htmlAttributeNameOf(A.DataT);

        const characterIndex = target.getAttribute(characterAttributeName);
        const floorIndex = target.getAttribute(floorAttributeName);
        const eventIndex = target.getAttribute(eventAttributeName);
        const eventType = target.getAttribute(eventTypeAttributeName);

        if (!characterIndex && !floorIndex && !eventIndex && !eventType) {
            return invalidResult;
        } else {
            e.stopPropagation();
            return {
                valid: true,
                characterIndex: characterIndex ? parseInt(characterIndex, 10) : null,
                eventIndex: eventIndex ? parseInt(eventIndex, 10) : null,
                floorIndex: floorIndex ? parseInt(floorIndex, 10) : null,
                eventType: eventType ? parseInt(eventType, 10) : null
            };
        }
    }

    private GetCurrentCharacter(): SubmittedPlayedCharacter {
        const currentCharacterIndex = this.dataForThisEpisode.PlayedCharacters.length - 1;
        return this.dataForThisEpisode.PlayedCharacters[currentCharacterIndex];;
    }

    private GetCurrentFloor(): SubmittedPlayedFloor | null {
        const currentCharacter = this.GetCurrentCharacter();
        if (!currentCharacter.PlayedFloors || currentCharacter.PlayedFloors.length === 0) {
            return null;
        }

        const currentFloorIndex = currentCharacter.PlayedFloors.length - 1;
        return currentCharacter.PlayedFloors[currentFloorIndex];
    }


    private ReloadHistory() {
        // find table
        const table = document.getElementById('history');
        if (!table || !(table instanceof HTMLTableElement)) {
            return;
        }

        // reload history
        post<History>('/api/resources/history', JSON.stringify(this.dataForThisEpisode)).then((history: History | null) => {

            if (history) {

                const trs = new Array<FrameworkElement>();
                for (let c = 0; c < history.characterHistory.length; ++c) {
                    const character = history.characterHistory[c];

                    for (let f = 0; f < character.floors.length; ++f) {
                        const tds = new Array<FrameworkElement>();

                        // add character icon on first floor
                        if (f === 0) {
                            tds.push({
                                e: ['td'],
                                c: [
                                    {
                                        e: ['div'],
                                        a: [
                                            [A.DataC, c.toString(10)],
                                            [A.Class, 'hand display-inline'],
                                            [A.Title, 'Click to remove character']
                                        ],
                                        c: [
                                            new IsaacImage(character.characterImage, undefined, undefined, false)
                                        ],
                                        v: [[EventType.Click, e => this.RemoveHistoryElement(e)]]
                                    }
                                ],
                                
                            });
                        } else {
                            tds.push({
                                e: ['td']
                            });
                        }

                        // add floor icon
                        const floor = character.floors[f];
                        const events = floor.events;

                        tds.push({
                            e: ['td'],
                            c: [
                                {
                                    e: ['div'],
                                    a: [
                                        [A.DataC, c.toString(10)],
                                        [A.DataF, f.toString(10)],
                                        [A.Class, 'hand display-inline'],
                                        [A.Title, 'Click to remove floor']
                                    ],
                                    c: [
                                        new IsaacImage(floor.floorImage, undefined, undefined, false)
                                    ],
                                    v: [[EventType.Click, e => this.RemoveHistoryElement(e)]]
                                }
                            ]
                        });

                        // add events
                        tds.push({
                            e: ['td'],
                            c: events.map((event, e) => {
                                const eventElement: FrameworkElement = {
                                    e: ['div'],
                                    a: [
                                        [A.DataC, c.toString(10)],
                                        [A.DataF, f.toString(10)],
                                        [A.DataE, e.toString(10)],
                                        [A.Class, 'hand display-inline'],
                                        [A.DataT, event.image.type.toString(10)],
                                        [A.Title, `Click to remove ${convertResourceTypeToString(event.image.type).toLowerCase()}`]
                                    ],
                                    c: [new IsaacImage(event.image, undefined, undefined, false)],
                                    v: [[EventType.Click, e => this.RemoveHistoryElement(e)]]
                                };
                                return eventElement;
                            })
                        });

                        trs.push({
                            e: ['tr'],
                            c: tds
                        });
                    }
                }

                console.log(trs);

                // recreate table rows
                const newTableContent: FrameworkElement = {
                    e: ['tbody'],
                    c: trs
                }

                // replace table rows
                const html = render(newTableContent);
                if (html) {
                    table.innerHTML = '';
                    table.appendChild(html);
                }
            }
        });
    }
}

export {
    HistoryTable,
    removeHistoryElement
}


