import { loadDivElementById, addClassIfNotExists, removeClassIfExists } from './lib/dom-operations';
import { initializeDropdownContainers, registerDropdownMenuCallbackFunction } from './lib/dropdown-menu';
import { initializeBoxes, registerBoxCallbackFunction, replaceBoxes } from './lib/resource-boxes';
import { SubmittedCompleteEpisode } from './interfaces/submitted-complete-episode';
import { SubmittedPlayedCharacter } from './interfaces/submitted-played-character';
import { SubmittedPlayedFloor } from './interfaces/submitted-played-floor';
import { SubmittedGameplayEvent } from './interfaces/submitted-gameplay-event';
import { GameplayEventType } from './lib/gameplay-event-type';
import { callbackFunctionRegistration } from './lib/selection-callback-function';
import { GetResourceRequest } from './interfaces/get-resource-request';
import { getEffectNumber } from './lib/api-calls';
import { History, HistoryImage } from './interfaces/history';

const uiElements: Map<string, HTMLDivElement> = new Map<string, HTMLDivElement>();

let editCharacter: number | null = null;
let editFloor: number | null = null;
let editGameplayEvent: number | null = null;

let currentCharacter: number = 0;
let currentFloor: number = 0;
const historyContainer = document.getElementById("history") as HTMLTableElement;

const resetCurrentEvent = (): SubmittedGameplayEvent => {
    return {
        EventType: GameplayEventType.Unspecified,
        Player: null,
        RelatedResource1: '',
        RelatedResource2: null,
        RelatedResource3: null
    };
}

let removeHistoryElement = (event: MouseEvent): void => {
    if (!event.target) {
        return;
    }
    const target = event.target as HTMLDivElement;
    const e = target.getAttribute('e');
    const f = target.getAttribute('f');
    const c = target.getAttribute('c');

    if (e && f && c) {
        const cNumber = parseInt(c, 10);
        const fNumber = parseInt(f, 10);
        const eNumber = parseInt(e, 10);
        episode.PlayedCharacters[cNumber].PlayedFloors[fNumber].GameplayEvents.splice(eNumber, 1);
    } else if (f && c) {
        const cNumber = parseInt(c, 10);
        const fNumber = parseInt(f, 10);
        episode.PlayedCharacters[cNumber].PlayedFloors.splice(fNumber, 1);
        hideAllExcept('select-floor');
    } else if (c) {
        const cNumber = parseInt(c, 10);
        episode.PlayedCharacters.splice(cNumber, 1);
        hideAllExcept('select-character');
    }
    reloadHistory();
}

let createHistoryCell = (i: HistoryImage, characterId?: number | undefined, floorId?: number | undefined, eventId?: number | undefined): HTMLTableCellElement => {
    const cell = document.createElement('td');
    cell.appendChild(createHistoryImage(i, characterId, floorId, eventId));
    return cell;
}

let createHistoryImage = (i: HistoryImage, characterId?: number | undefined, floorId?: number | undefined, eventId?: number | undefined): HTMLDivElement => {
    const element = document.createElement('div');
    element.style.background = `url('/img/isaac.png') -${i.x <= 0 ? 0 : i.x}px -${i.y <= 0 ? 0 : i.y}px transparent`;
    element.style.width = `${i.w <= 5 ? 31 : i.w}px`;
    element.style.height = `${i.h <= 5 ? 31 : i.h}px`;
    element.style.display = 'inline-block';

    if (characterId !== undefined) {
        element.setAttribute('c', characterId.toString(10));
    }
    if (floorId !== undefined) {
        element.setAttribute('f', floorId.toString(10));
    }
    if (eventId !== undefined) {
        element.setAttribute('e', eventId.toString(10));
    }
    element.addEventListener('click', removeHistoryElement);
    return element;
}

let reloadHistory = (): void => {
    const requestData: RequestInit = {
        method: 'POST',
        body: JSON.stringify(episode),
        headers: {
            'Content-Type': 'application/json'
        }
    }
    fetch(`/api/resources/history`, requestData).then(response => response.json()).then((history: History) => {
        console.log('response: ', history);
        const table = document.createElement('table');
        let currentRow: HTMLTableRowElement | null = null;
        for (let c = 0; c < history.characterHistory.length; c++) {
            const row = document.createElement('tr');
            table.appendChild(row);
            row.appendChild(createHistoryCell(history.characterHistory[c].characterImage, c));

            for (let f = 0; f < history.characterHistory[c].floors.length; f++) {
                if (f === 0) {
                    currentRow = row;
                    row.appendChild(createHistoryCell(history.characterHistory[c].floors[f].floorImage, c, f));
                    row.appendChild(document.createElement('td'));
                } else {
                    const newFloorRow = document.createElement('tr');
                    currentRow = newFloorRow;

                    newFloorRow.appendChild(document.createElement('td'));
                    newFloorRow.appendChild(createHistoryCell(history.characterHistory[c].floors[f].floorImage, c, f));
                    newFloorRow.appendChild(document.createElement('td'));

                    table.appendChild(newFloorRow);
                }

                for (let e = 0; e < history.characterHistory[c].floors[f].events.length; e++) {
                    if (!currentRow) {
                        continue;
                    }
                    currentRow.children[2].appendChild(createHistoryImage(history.characterHistory[c].floors[f].events[e].image, c, f, e));
                }
            }
        }
        historyContainer.innerHTML = '';
        historyContainer.appendChild(table);
    });
}

let currentEvent: SubmittedGameplayEvent = resetCurrentEvent();
let currentPlayer: number = 1;

const episode: SubmittedCompleteEpisode = {
    VideoId: window.location.href.substr(window.location.href.length - 11, 11),
    PlayedCharacters: new Array<SubmittedPlayedCharacter>()
};

const hideAllExcept = (except: string): void => {
    for (const container of uiElements) {
        if (container[1].id === except) {
            addClassIfNotExists(container[1], 'display-normal');
            removeClassIfExists(container[1], 'display-none');
        } else {
            removeClassIfExists(container[1], 'display-normal');
            addClassIfNotExists(container[1], 'display-none');
        }
    }
}

const selectCharacter = (data: { id: string, image: HTMLDivElement | null }) => {
    console.log('selected character: ', data.id);
    if (editCharacter !== null) {
        episode.PlayedCharacters[editCharacter].CharacterId = data.id;
        editCharacter = null;
    } else {
        episode.PlayedCharacters.push({
            CharacterId: data.id,
            GameMode: 7,
            PlayedFloors: new Array<SubmittedPlayedFloor>()
        });
        currentCharacter = episode.PlayedCharacters.length - 1;
        hideAllExcept('select-mode');
        reloadHistory();
    }
}

const selectMode = (mode: { id: string, image: HTMLDivElement | null }): void => {
    console.log('selected mode: ', mode)
    episode.PlayedCharacters[editCharacter !== null ? editCharacter : currentCharacter].GameMode = parseInt(mode.id, 10);
    editCharacter = null;
    hideAllExcept('select-floor');
}

const selectFloor = (data: { id: string, image: HTMLDivElement | null }): void => {
    console.log('selected floor: ', data.id);

    if (editFloor !== null) {
        episode.PlayedCharacters[currentCharacter].PlayedFloors[editFloor].FloorId = data.id;
        editFloor = null;
        editCharacter = null;
        // todo: hide except
    } else {
        episode.PlayedCharacters[currentCharacter].PlayedFloors.push({
            FloorId: data.id,
            Duration: null,
            GameplayEvents: new Array<SubmittedGameplayEvent>()
        });
        currentFloor = episode.PlayedCharacters[currentCharacter].PlayedFloors.length - 1;
        hideAllExcept('select-curse');
        console.log(currentFloor);
    }

    reloadHistory();

    getEffectNumber(data.id).then(effectNumber => {
        if (effectNumber.length > 0) {
            const loadFloorBosses: GetResourceRequest = {
                ResourceType: 1,
                Asc: true,
                IncludeMod: false,
                OrderBy1: undefined,
                OrderBy2: undefined,
                RequiredTags: effectNumber
            };
            const bossBoxContainer = uiElements.get('select-boss');
            if (bossBoxContainer) {
                for (const div of bossBoxContainer.children) {
                    if (div.hasAttribute('data-id')) {
                        replaceBoxes(loadFloorBosses, <HTMLDivElement>div);
                    }
                }
            }
        }
    });
}

const addGameplayEvent = (data: { id: string, image: HTMLDivElement | null }, gameplayEvent: GameplayEventType, resourceNumber: 1 | 2 | 3, show: string) => {
    console.log('selected ', data.id);
    if (currentEvent.EventType !== gameplayEvent) {
        currentEvent = resetCurrentEvent();
        currentEvent.EventType = gameplayEvent;
    }

    if (resourceNumber === 1) {
        currentEvent.RelatedResource1 = data.id;
    } else if (resourceNumber === 2) {
        currentEvent.RelatedResource2 = data.id;
    }

    // add gameplay event to the floor, depending on what event it was
    switch (gameplayEvent) {

        // needs resource 1, resource 2 and player
        case GameplayEventType.ItemCollected:
        case GameplayEventType.AbsorbedItem:
        case GameplayEventType.ItemTouched:
            currentEvent.Player = currentPlayer;
            if (currentEvent.RelatedResource1 && currentEvent.RelatedResource2 && currentEvent.Player) {
                editGameplayEvent === null
                    ? episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents.push(Object.assign({}, currentEvent))
                    : episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents[editGameplayEvent] = currentEvent;
                currentEvent = resetCurrentEvent();
                reloadHistory();
            }
            break;

        // needs only resources 1 and player
        case GameplayEventType.OtherConsumable:
        case GameplayEventType.Pill:
        case GameplayEventType.Rune:
        case GameplayEventType.TarotCard:
        case GameplayEventType.Trinket:
        case GameplayEventType.CharacterReroll:
            currentEvent.Player = currentPlayer;
            if (currentEvent.RelatedResource1 && currentEvent.Player) {
                editGameplayEvent === null
                    ? episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents.push(Object.assign({}, currentEvent))
                    : episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents[editGameplayEvent] = currentEvent;
                currentEvent = resetCurrentEvent();
                reloadHistory();
            }
            break;

        // needs only resource 1
        case GameplayEventType.Bossfight:
        case GameplayEventType.CharacterDied:
            if (currentEvent.RelatedResource1) {
                editGameplayEvent === null
                    ? episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents.push(Object.assign({}, currentEvent))
                    : episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents[editGameplayEvent] = currentEvent;
                currentEvent = resetCurrentEvent();
                reloadHistory();
            }
            break;
        case GameplayEventType.Curse:
            if (currentEvent.RelatedResource1) {
                editGameplayEvent === null
                    ? episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents.unshift(Object.assign({}, currentEvent))
                    : episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents[editGameplayEvent] = currentEvent;
                currentEvent = resetCurrentEvent();
                reloadHistory();
            }
            break;
        default:
            break;
    }

    console.log('showing ', show);
    hideAllExcept(show);
    console.log('adding history element', data.image);

    let event = '';
    switch (gameplayEvent) {
        case GameplayEventType.Curse: event = 'curse'; break;
        case GameplayEventType.CharacterDied: event = 'death'; break;
        default: event = 'event'; break;
    }
    console.log(event);
    console.log(episode);
}

const createRegistration = (id: string, eventType: GameplayEventType, resourceNumber: 1 | 2 | 3, hideAllExcept: string): callbackFunctionRegistration => {
    return {
        dropdownId: id,
        eventType: eventType,
        resourceNumber: resourceNumber,
        hideAllExcept: hideAllExcept
    };
}

const initializeResourceSelectors = (wrapper: HTMLDivElement) => {
    loadDivElementById('sucked-up-item-box', wrapper).addEventListener('click', () => hideAllExcept('select-absorber'));
    loadDivElementById('collected-item-box', wrapper).addEventListener('click', () => hideAllExcept('select-item-source'));
    loadDivElementById('bossfight-box', wrapper).addEventListener('click', () => hideAllExcept('select-boss'));
    loadDivElementById('character-reroll-box', wrapper).addEventListener('click', () => hideAllExcept('select-reroll'));
    loadDivElementById('select-enemy-box', wrapper).addEventListener('click', () => hideAllExcept('select-enemy'));
    loadDivElementById('select-pill-box', wrapper).addEventListener('click', () => hideAllExcept('select-pill'));
    loadDivElementById('select-tarot-box', wrapper).addEventListener('click', () => hideAllExcept('select-tarot'));
    loadDivElementById('select-rune-box', wrapper).addEventListener('click', () => hideAllExcept('select-rune'));
    loadDivElementById('select-trinket-box', wrapper).addEventListener('click', () => hideAllExcept('select-trinket'));
    loadDivElementById('select-other-consumable-box', wrapper).addEventListener('click', () => hideAllExcept('select-other-consumable'));
    (<HTMLButtonElement>document.getElementById('another-run-btn')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); hideAllExcept('select-character') });
    (<HTMLButtonElement>document.getElementById('victory-lap-btn')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); hideAllExcept('select-floor') });
}

(() => {
    const wrapper = loadDivElementById('menu-wrapper', null);
    uiElements.set('select-character', loadDivElementById('select-character', wrapper));
    uiElements.set('select-mode', loadDivElementById('select-mode', wrapper));
    uiElements.set('select-floor', loadDivElementById('select-floor', wrapper));
    uiElements.set('select-curse', loadDivElementById('select-curse', wrapper));
    uiElements.set('select-gameplay-events', loadDivElementById('select-gameplay-events', wrapper));
    uiElements.set('select-absorber', loadDivElementById('select-absorber', wrapper));
    uiElements.set('select-absorbed-item', loadDivElementById('select-absorbed-item', wrapper));
    uiElements.set('select-item-source', loadDivElementById('select-item-source', wrapper));
    uiElements.set('select-item', loadDivElementById('select-item', wrapper));
    uiElements.set('select-touched-item-source', loadDivElementById('select-item-source', wrapper));
    uiElements.set('select-touched-item', loadDivElementById('select-item', wrapper));
    uiElements.set('select-boss', loadDivElementById('select-boss', wrapper));
    uiElements.set('select-reroll', loadDivElementById('select-reroll', wrapper));
    uiElements.set('select-enemy', loadDivElementById('select-enemy', wrapper));
    uiElements.set('next-run', loadDivElementById('next-run', wrapper));
    uiElements.set('select-pill-box', loadDivElementById('select-pill', wrapper));
    uiElements.set('select-tarot-box', loadDivElementById('select-tarot', wrapper));
    uiElements.set('select-rune-box', loadDivElementById('select-rune', wrapper));
    uiElements.set('select-trinket-box', loadDivElementById('select-trinket', wrapper));
    uiElements.set('select-other-consumable-box', loadDivElementById('select-other-consumable', wrapper));

    initializeResourceSelectors(wrapper);

    registerBoxCallbackFunction(createRegistration('select-character-boxes', GameplayEventType.Unspecified, 1, ''), selectCharacter);
    registerBoxCallbackFunction(createRegistration('select-mode-boxes', GameplayEventType.Unspecified, 1, ''), selectMode);
    registerDropdownMenuCallbackFunction(createRegistration('select-floor-dd', GameplayEventType.Unspecified, 1, ''), selectFloor);
    registerBoxCallbackFunction(createRegistration('select-floor-boxes', GameplayEventType.Unspecified, 1, ''), selectFloor);
    registerDropdownMenuCallbackFunction(createRegistration('select-curse-dd', GameplayEventType.Curse, 1, 'select-gameplay-events'), addGameplayEvent);
    registerBoxCallbackFunction(createRegistration('select-absorber-boxes', GameplayEventType.AbsorbedItem, 2, 'select-absorbed-item'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-absorbed-item-dd', GameplayEventType.AbsorbedItem, 1, 'select-gameplay-events'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-item-source-dd', GameplayEventType.ItemCollected, 2, 'select-item'), addGameplayEvent);
    registerBoxCallbackFunction(createRegistration('select-item-source-boxes', GameplayEventType.ItemCollected, 2, 'select-item'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-item-dd', GameplayEventType.ItemCollected, 1, 'select-gameplay-events'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-touched-item-source-dd', GameplayEventType.ItemTouched, 2, 'select-touched-item'), addGameplayEvent);
    registerBoxCallbackFunction(createRegistration('select-touched-item-source-boxes', GameplayEventType.ItemTouched, 2, 'select-touched-item'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-touched-item-dd', GameplayEventType.ItemTouched, 1, 'select-gameplay-events'), addGameplayEvent);
    registerBoxCallbackFunction(createRegistration('select-boss-boxes', GameplayEventType.Bossfight, 1, 'select-gameplay-events'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-boss-dd', GameplayEventType.Bossfight, 1, 'select-gameplay-events'), addGameplayEvent);
    registerBoxCallbackFunction(createRegistration('select-reroll-boxes', GameplayEventType.CharacterReroll, 1, 'select-gameplay-events'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-enemies-dd', GameplayEventType.CharacterDied, 1, 'next-run'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-pill-dd', GameplayEventType.Pill, 1, 'select-gameplay-events'), addGameplayEvent);
    registerBoxCallbackFunction(createRegistration('select-rune-boxes', GameplayEventType.Rune, 1, 'select-gameplay-events'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-trinket-dd', GameplayEventType.Trinket, 1, 'select-gameplay-events'), addGameplayEvent);
    registerBoxCallbackFunction(createRegistration('select-other-consumable-boxes', GameplayEventType.OtherConsumable, 1, 'select-gameplay-events'), addGameplayEvent);

    initializeDropdownContainers();
    initializeBoxes();
})();


