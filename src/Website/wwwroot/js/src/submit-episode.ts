import { loadDivElementById, addClassIfNotExists, removeClassIfExists } from './lib/dom-operations';
import { initializeDropdownContainers, registerDropdownMenuCallbackFunction } from './lib/dropdown-menu';
import { initializeBoxes, registerBoxCallbackFunction } from './lib/resource-boxes';
import { SubmittedCompleteEpisode } from './interfaces/submitted-complete-episode';
import { SubmittedPlayedCharacter } from './interfaces/submitted-played-character';
import { SubmittedPlayedFloor } from './interfaces/submitted-played-floor';
import { SubmittedGameplayEvent } from './interfaces/submitted-gameplay-event';
import { GameplayEventType } from './lib/gameplay-event-type';
import { callbackFunctionRegistration } from './lib/selection-callback-function';

const uiElements: Map<string, HTMLDivElement> = new Map<string, HTMLDivElement>();

let editCharacter: number | null = null;
let editFloor: number | null = null;
let editGameplayEvent: number | null = null;

let currentCharacter: number = 0;
let currentFloor: number = 0;

const resetCurrentEvent = (): SubmittedGameplayEvent => {
    return {
        EventType: GameplayEventType.Unspecified,
        Player: null,
        RelatedResource1: '',
        RelatedResource2: null,
        RelatedResource3: null
    };
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

const selectCharacter = (characterId: string) => {
    console.log('selected character: ', characterId);
    if (editCharacter !== null) {
        episode.PlayedCharacters[editCharacter].CharacterId = characterId;
        editCharacter = null;
        // todo: hideAllExcept(...some overview...)
    } else {
        episode.PlayedCharacters.push({
            CharacterId: characterId,
            GameMode: 7,
            PlayedFloors: new Array<SubmittedPlayedFloor>()
        });
        currentCharacter = episode.PlayedCharacters.length - 1;
        hideAllExcept('select-mode');
    }
}

const selectMode = (mode: string): void => {
    console.log('selected mode: ', mode)
    episode.PlayedCharacters[editCharacter !== null ? editCharacter : currentCharacter].GameMode = parseInt(mode, 10);
    editCharacter = null;
    hideAllExcept('select-floor');
}

const selectFloor = (id: string): void => {
    console.log('selected floor: ', id);

    if (editFloor !== null) {
        episode.PlayedCharacters[currentCharacter].PlayedFloors[editFloor].FloorId = id;
        editFloor = null;
        editCharacter = null;
        // todo: hide except
    } else {
        episode.PlayedCharacters[currentCharacter].PlayedFloors.push({
            FloorId: id,
            Duration: null,
            GameplayEvents: new Array<SubmittedGameplayEvent>()
        });
        currentFloor = episode.PlayedCharacters[currentCharacter].PlayedFloors.length - 1;
        hideAllExcept('select-curse');
        console.log(currentFloor);
    }
}

const addGameplayEvent = (id: string, gameplayEvent: GameplayEventType, resourceNumber: 1 | 2 | 3, show: string) => {
    console.log('selected ', id);
    if (currentEvent.EventType !== gameplayEvent) {
        currentEvent = resetCurrentEvent();
        currentEvent.EventType = gameplayEvent;
    }

    if (resourceNumber === 1) {
        currentEvent.RelatedResource1 = id;
    } else if (resourceNumber === 2) {
        currentEvent.RelatedResource2 = id;
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
        case GameplayEventType.Curse:
            if (currentEvent.RelatedResource1) {
                editGameplayEvent === null
                    ? episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents.push(Object.assign({}, currentEvent))
                    : episode.PlayedCharacters[currentCharacter].PlayedFloors[currentFloor].GameplayEvents[editGameplayEvent] = currentEvent;
                currentEvent = resetCurrentEvent();
            }
            break;
        default:
            break;
    }

    console.log('showing ', show);
    hideAllExcept(show);
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
    console.log(uiElements.get('select-absorbed-item'));

    initializeDropdownContainers();
    initializeBoxes();
    initializeResourceSelectors(wrapper);

    registerBoxCallbackFunction(createRegistration('select-character-boxes', GameplayEventType.Unspecified, 1, ''), selectCharacter);
    registerBoxCallbackFunction(createRegistration('select-mode-boxes', GameplayEventType.Unspecified, 1, ''), selectMode);
    registerDropdownMenuCallbackFunction(createRegistration('select-floor-dd', GameplayEventType.Unspecified, 1, ''), selectFloor);
    registerBoxCallbackFunction(createRegistration('select-floor-boxes', GameplayEventType.Unspecified, 1, ''), selectFloor);
    registerDropdownMenuCallbackFunction(createRegistration('select-curse-dd', GameplayEventType.Curse, 1, 'select-gameplay-events'), addGameplayEvent);
    registerBoxCallbackFunction(createRegistration('select-absorber-boxes', GameplayEventType.AbsorbedItem, 1, 'select-absorbed-item'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-absorbed-item-dd', GameplayEventType.AbsorbedItem, 2, 'select-gameplay-events'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-item-source-dd', GameplayEventType.ItemCollected, 2, 'select-item'), addGameplayEvent);
    registerBoxCallbackFunction(createRegistration('select-item-source-boxes', GameplayEventType.ItemCollected, 2, 'select-item'), addGameplayEvent);
    registerDropdownMenuCallbackFunction(createRegistration('select-item-dd', GameplayEventType.ItemCollected, 1, 'select-gameplay-events'), addGameplayEvent);
})();


