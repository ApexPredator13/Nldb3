import { Component, FrameworkElement, A, render, htmlAttributeNameOf, EventType } from "../../Framework/renderer";
import { SubmittedCompleteEpisode } from "../../Models/submitted-complete-episode";
import { post } from "../../Framework/http";
import { History, CharacterHistory, FloorHistory, EventHistory } from '../../Models/history';
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

type removeHistoryElement = {
    valid: boolean,
    characterIndex: number | null,
    floorIndex: number | null,
    eventIndex: number | null,
    eventType: ResourceType | null
}

class HistoryTable<TSubscriber> extends ComponentWithSubscribers<removeHistoryElement, TSubscriber> implements Component {
    E: FrameworkElement;

    private dataForThisEpisode: SubmittedCompleteEpisode;

    constructor(
        caller: ThisType<TSubscriber>,
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
        const currentCharacter = this.GetCurrentCharacter();
        currentCharacter.PlayedFloors.push(floor);
        this.ReloadHistory();
    }

    AddCurse(event: SubmittedGameplayEvent) {
        const currentFloor = this.GetCurrentFloor();
        currentFloor.GameplayEvents.unshift(event);
        this.ReloadHistory();
    }

    AddEvent(event: SubmittedGameplayEvent) {
        const currentFloor = this.GetCurrentFloor();
        currentFloor.GameplayEvents.push(event);
        this.ReloadHistory();
    }

    AddSeed(seed: string | null) {
        const currentCharacter = this.GetCurrentCharacter();
        currentCharacter.Seed = seed;
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

    private RemoveHistoryElement(e: Event) {
        const data = this.GetRemoveIndexData(e);
        console.log('remove history: ', data);
        if (!data.valid) {
            return;
        }

        if (data.characterIndex !== null && data.floorIndex == null && data.eventIndex == null) {
            // user wants to remove character: show confirmation prompt
            const prompt = new WarningRemovingCharacterFromHistory<HistoryTable<TSubscriber>>(this, this.RemoveCharacter, data);
            new ComponentWithModal(this.youtubePlayer).ShowModal(prompt, false);
        } else if (data.characterIndex !== null && data.floorIndex !== null && data.eventIndex == null) {
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

    private GetCurrentFloor(): SubmittedPlayedFloor {
        const currentCharacter = this.GetCurrentCharacter();
        console.log('current floor requested', currentCharacter);
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
            console.log('new history received', history);
            if (history) {
                // recreate table rows
                const newTableContent: FrameworkElement = {
                    e: ['tbody'],
                    c: history.characterHistory.map((character, index) => this.HistoryTableRow(character, index))
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

    private HistoryTableRow(character: CharacterHistory, characterIndex: number): FrameworkElement {

        const rowData = character.floors.map((floor, index): [CharacterHistory | undefined, FloorHistory, Array<EventHistory>] => [index === 0 ? character : undefined, floor, floor.events])

        const row: FrameworkElement = {
            e: ['tr'],
            c: rowData.flatMap(([character, floor, events], floorIndex) => {
                const cells = new Array<FrameworkElement>();

                // display character
                if (character) {
                    cells.push({
                        e: ['td'],
                        c: [
                            {
                                e: ['div'],
                                a: [[A.DataC, characterIndex.toString(10)], [A.Class, 'hand display-inline']],
                                c: [
                                    new IsaacImage(character.characterImage, undefined, undefined, false)
                                ],
                                v: [[EventType.Click, e => this.RemoveHistoryElement(e)]]
                            }
                        ]
                    });
                } else {
                    cells.push({ e: ['td'] });
                }

                // display floor
                if (floor) {
                    cells.push({
                        e: ['td'],
                        c: [
                            {
                                e: ['div'],
                                a: [[A.DataC, characterIndex.toString(10)], [A.DataF, floorIndex.toString(10)], [A.Class, 'hand display-inline']],
                                c: [
                                    new IsaacImage(floor.floorImage, undefined, undefined, false)
                                ],
                                v: [[EventType.Click, e => this.RemoveHistoryElement(e)]]
                            }
                        ]
                    });
                } else {
                    cells.push({ e: ['td'] });
                }

                // display events
                if (events) {
                    cells.push({
                        e: ['td'],
                        c: events.map((event, eventIndex) => {
                            const eventElement: FrameworkElement = {
                                e: ['div'],
                                a: [[A.DataC, characterIndex.toString(10)], [A.DataF, floorIndex.toString(10)], [A.DataE, eventIndex.toString(10)], [A.Class, 'hand display-inline'], [A.DataT, event.image.type.toString(10)]],
                                c: [new IsaacImage(event.image, undefined, undefined, false)],
                                v: [[EventType.Click, e => this.RemoveHistoryElement(e)]]
                            };
                            return eventElement;
                        })
                    });
                } else {
                    cells.push({ e: ['td'] });
                }

                return cells;
            })
        };

        return row;
    }
}

export {
    HistoryTable,
    removeHistoryElement
}


