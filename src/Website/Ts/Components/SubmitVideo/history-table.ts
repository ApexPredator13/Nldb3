import { Component, FrameworkElement, A, render, htmlAttributeNameOf, EventType } from "../../Framework/renderer";
import { SubmittedCompleteEpisode } from "../../Models/submitted-complete-episode";
import { post } from "../../Framework/http";
import { History, CharacterHistory, FloorHistory, EventHistory } from '../../Models/history';
import { IsaacImage } from "../General/isaac-image";
import { SubmittedPlayedCharacter } from "../../Models/submitted-played-character";
import { SubmittedPlayedFloor } from "../../Models/submitted-played-floor";
import { SubmittedGameplayEvent } from "../../Models/submitted-gameplay-event";

type removeHistoryElement = {
    valid: boolean,
    characterIndex: number | null,
    floorIndex: number | null,
    eventIndex: number | null
}

export class HistoryTable implements Component {
    E: FrameworkElement;

    private dataForThisEpisode: SubmittedCompleteEpisode;

    constructor(videoId: string) {

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

    private RemoveHistoryElement(e: Event) {
        const data = this.GetRemoveIndexData(e);
        if (!data.valid) {
            return;
        }

        // character was removed
        if (data.characterIndex && !data.floorIndex && !data.eventIndex) {
            this.dataForThisEpisode.PlayedCharacters.splice(data.characterIndex, 1);
        }

        // floor was removed
        if (data.characterIndex && data.floorIndex && !data.eventIndex) {
            this.dataForThisEpisode.PlayedCharacters[data.characterIndex].PlayedFloors.splice(data.floorIndex, 1);
        }

        // event was removed
        if (data.characterIndex && data.floorIndex && data.eventIndex) {
            this.dataForThisEpisode.PlayedCharacters[data.characterIndex].PlayedFloors[data.floorIndex].GameplayEvents.splice(data.eventIndex, 1);
        }

        this.ReloadHistory();
    }

    private GetRemoveIndexData(e: Event): removeHistoryElement {
        const target = e.target;

        const invalidResult = {
            valid: false,
            characterIndex: null,
            eventIndex: null,
            floorIndex: null
        };

        if (!target || !(target instanceof HTMLDivElement)) {
            return invalidResult;
        }

        const characterAttributeName = htmlAttributeNameOf(A.DataC);
        const floorAttributeName = htmlAttributeNameOf(A.DataF);
        const eventAttributeName = htmlAttributeNameOf(A.DataE);

        const characterIndex = target.getAttribute(characterAttributeName);
        const floorIndex = target.getAttribute(floorAttributeName);
        const eventIndex = target.getAttribute(eventAttributeName);

        if (!characterIndex && !floorIndex && !eventIndex) {
            return invalidResult;
        } else {
            return {
                valid: true,
                characterIndex: characterIndex ? Number(characterIndex) : null,
                eventIndex: eventIndex ? Number(eventIndex) : null,
                floorIndex: floorIndex ? Number(floorIndex) : null
            };
        }
    }

    private GetCurrentCharacter(): SubmittedPlayedCharacter {
        const currentCharacterIndex = this.dataForThisEpisode.PlayedCharacters.length - 1;
        return this.dataForThisEpisode.PlayedCharacters[currentCharacterIndex];;
    }

    private GetCurrentFloor(): SubmittedPlayedFloor {
        const currentCharacter = this.GetCurrentCharacter();
        const currentFloorIndex = currentCharacter.PlayedFloors.length;
        return currentCharacter.PlayedFloors[currentFloorIndex];
    }


    private ReloadHistory() {
        // find table
        const table = document.getElementById('history');
        if (!table || !(table instanceof HTMLTableElement)) {
            return;
        }

        // reload history
        post<History>('/api/resources/history', JSON.stringify(this.dataForThisEpisode)).then(history => {
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
                                a: [[A.DataC, characterIndex.toString(10)], [A.DataF, floorIndex.toString(10)], [A.DataE, eventIndex.toString(10)], [A.Class, 'hand display-inline']],
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

    CreateCharacterTableCell(character: CharacterHistory, characterIndex: number): FrameworkElement {
        return {
            e: ['td'],
            a: [[A.Class, 'hand'], [A.DataC, characterIndex.toString(10)]],
            c: [ new IsaacImage(character.characterImage, undefined, undefined, false) ]
        };
    }
}

