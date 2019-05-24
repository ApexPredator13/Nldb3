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

const uiElements: Map<string, HTMLDivElement> = new Map<string, HTMLDivElement>();

let editCharacter: number | null = null;
let editFloor: number | null = null;
let editGameplayEvent: number | null = null;

let currentCharacter: number = 0;
let currentFloor: number = 0;
const history = document.getElementById("history") as HTMLTableElement;

const resetCurrentEvent = (): SubmittedGameplayEvent => {
    return {
        EventType: GameplayEventType.Unspecified,
        Player: null,
        RelatedResource1: '',
        RelatedResource2: null,
        RelatedResource3: null
    };
}

let addHistoryElement = (img: HTMLDivElement | null, type: string) => {
    if (img) {
        if (type === 'character') {
            const newRow = document.createElement('tr');
            const characterCell = document.createElement('td');
            const floorCell = document.createElement('td');
            const eventsCell = document.createElement('td');
            characterCell.appendChild(img);
            characterCell.appendChild(document.createTextNode('⤇'));
            newRow.appendChild(characterCell);
            newRow.appendChild(floorCell);
            newRow.appendChild(eventsCell);
            img.setAttribute('character', currentCharacter.toString(10))
            history.appendChild(newRow);
        } else if (type === 'floor') {
            const rows = history.getElementsByTagName('tr');
            const lastRow = rows[rows.length - 1];
            const lastRowCells = lastRow.getElementsByTagName('td');
            img.setAttribute('character', currentCharacter.toString(10));
            img.setAttribute('floor', currentFloor.toString(10));
            if (lastRowCells[1].innerHTML) {
                const newRow = document.createElement('tr');
                const characterCell = document.createElement('td');
                const floorCell = document.createElement('td');
                const eventsCell = document.createElement('td');
                newRow.appendChild(characterCell);
                newRow.appendChild(floorCell);
                newRow.appendChild(eventsCell);
                floorCell.appendChild(img);
                const cells = lastRow.getElementsByTagName('td');
                if (cells && cells.length > 0) {
                    const floorCell = cells[1];
                    floorCell.appendChild(img);
                }
            } else {
                lastRowCells[1].appendChild(img);
            }
        } else if (type === 'event' || type === 'death') {
            const rows = history.getElementsByTagName('tr');
            if (rows) {
                const lastRow = rows[rows.length - 1];
                const cells = lastRow.getElementsByTagName('td');
                if (cells) {
                    const eventCell = cells[2];
                    if (!eventCell.hasAttribute('character')) {
                        eventCell.setAttribute('character', currentCharacter.toString(10));
                    }
                    if (!eventCell.hasAttribute('floor')) {
                        eventCell.setAttribute('floor', currentFloor.toString(10));
                    }
                    img.setAttribute('character', currentCharacter.toString(10));
                    img.setAttribute('floor', currentFloor.toString(10));
                    try {
                        img.setAttribute('event', (episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents.length - 1).toString(10));
                    } catch {
                        img.setAttribute('event', '0');
                    }
                    eventCell.appendChild(img);
                }
            }
        } else if (type === 'curse') {
            const rows = history.getElementsByTagName('tr');
            if (rows) {
                const lastRow = rows[rows.length - 1];
                const cells = lastRow.getElementsByTagName('td');
                if (cells) {
                    const floorCell = cells[1];
                    floorCell.appendChild(img);
                    floorCell.appendChild(document.createTextNode('→'));
                }
            }
        }

        if (type !== 'curse') {
            img.addEventListener('click', e => {
                removeHistoryElement(e.target, type);
            });
        }
    }
}

let removeHistoryElement = (e: EventTarget | null, type: string) => {
    if (!e) {
        return;
    }
    console.log('deleting type: ', type);
    const target = e as HTMLDivElement;
    const characterIndex = target.hasAttribute('character') ? parseInt(target.getAttribute('character') as string, 10) : null;
    const floorIndex = target.hasAttribute('floor') ? parseInt(target.getAttribute('floor') as string, 10) : null;
    const eventIndex = target.hasAttribute('event') ? parseInt(target.getAttribute('event') as string, 10) : null;

    console.log('indexes: ', characterIndex, floorIndex, eventIndex);

    switch (type) {
        case 'character':
            if (characterIndex !== null) {
                const ok1 = confirm('Deleting the character will also delete all floors and gameplay events for this character! Continue?');
                if (ok1) {
                    episode.PlayedCharacters.splice(characterIndex, 1);
                    const characterIcon = history.querySelector(`[character="${characterIndex.toString(10)}"]`);
                    if (characterIcon) {
                        const characterCell = characterIcon.parentElement;
                        if (characterCell) {
                            const characterRow = characterCell.parentElement;
                            if (characterRow && characterRow.parentElement) {
                                characterRow.parentElement.removeChild(characterRow);
                            }
                        }
                    }
                    hideAllExcept('select-character');
                    currentCharacter = episode.PlayedCharacters.length - 1;
                }
            }
            break;
        case 'floor':
            const ok2 = confirm('Deleting the floor will also delete all gameplay events for this floor! Continue?');
            if (ok2 && floorIndex !== null && characterIndex !== null) {
                episode.PlayedCharacters[characterIndex].PlayedFloors.splice(floorIndex, 1);
                const floorImg = history.querySelector(`[floor="${characterIndex.toString(10)}"]`);
                if (floorImg) {
                    const floorCell = floorImg.parentElement;
                    if (floorCell) {
                        const floorRow = floorCell.parentElement;
                        if (floorRow) {
                            const characterCell = floorRow.children[0];
                            console.log('character cell is ', characterCell);
                            if (characterCell.innerHTML) {
                                floorCell.innerHTML = '';
                                if (floorCell.nextElementSibling) {
                                    floorCell.nextElementSibling.innerHTML = '';
                                }
                            } else {
                                const table = floorRow.parentElement;
                                if (table) {
                                    table.removeChild(floorRow);
                                }
                            }
                        }
                    }
                }
                hideAllExcept('select-floor');
                currentFloor = episode.PlayedCharacters[currentCharacter].PlayedFloors.length - 1;
            }
            break;
        case 'event':
        case 'death':
            if (characterIndex !== null && floorIndex !== null && eventIndex !== null) {
                episode.PlayedCharacters[characterIndex].PlayedFloors[floorIndex].GameplayEvents.splice(eventIndex, 1);
                if (target.parentElement) {
                    target.parentElement.removeChild(target);
                }
            }
            break;
    }
    console.log('after deleting element: ', episode);
}

let currentEvent: SubmittedGameplayEvent = resetCurrentEvent();
let currentImage: HTMLDivElement | null = null;
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
        addHistoryElement(data.image, 'character');
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
        addHistoryElement(data.image, 'floor');
    }

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
        currentImage = null;
    }

    if (resourceNumber === 1) {
        currentEvent.RelatedResource1 = data.id;
        currentImage = data.image;
    } else if (resourceNumber === 2) {
        currentEvent.RelatedResource2 = data.id;
    }

    // add gameplay event to the floor, depending on what event it was
    switch (gameplayEvent) {

        // needs resource 1, resource 2 and player
        case GameplayEventType.ItemCollected:
        case GameplayEventType.AbsorbedItem:
            currentEvent.Player = currentPlayer;
            if (currentEvent.RelatedResource1 && currentEvent.RelatedResource2 && currentEvent.Player) {
                editGameplayEvent === null
                    ? episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents.push(Object.assign({}, currentEvent))
                    : episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents[editGameplayEvent] = currentEvent;
                currentEvent = resetCurrentEvent();
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
            }
            break;
        case GameplayEventType.Curse:
            if (currentEvent.RelatedResource1) {
                editGameplayEvent === null
                    ? episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents.unshift(Object.assign({}, currentEvent))
                    : episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents[editGameplayEvent] = currentEvent;
                currentEvent = resetCurrentEvent();
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
    addHistoryElement(currentImage, event);
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
    uiElements.set('select-boss', loadDivElementById('select-boss', wrapper));
    uiElements.set('select-reroll', loadDivElementById('select-reroll', wrapper));
    uiElements.set('select-enemy', loadDivElementById('select-enemy', wrapper));
    uiElements.set('next-run', loadDivElementById('next-run', wrapper));

    initializeDropdownContainers();
    initializeBoxes();
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
    registerBoxCallbackFunction(createRegistration('select-boss-boxes', GameplayEventType.Bossfight, 1, 'select-gameplay-events'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-boss-dd', GameplayEventType.Bossfight, 1, 'select-gameplay-events'), addGameplayEvent);
    registerBoxCallbackFunction(createRegistration('select-reroll-boxes', GameplayEventType.CharacterReroll, 1, 'select-gameplay-events'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-enemies-dd', GameplayEventType.CharacterDied, 1, 'next-run'), addGameplayEvent);
})();


