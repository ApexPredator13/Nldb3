import { loadDivElementById, addClassIfNotExists, removeClassIfExists } from './lib/dom-operations';
import { initializeDropdownContainers, registerDropdownMenuCallbackFunction } from './lib/dropdown-menu';
import { initializeBoxes, registerBoxCallbackFunction } from './lib/resource-boxes';
import { SubmittedCompleteEpisode } from './interfaces/submitted-complete-episode';
import { SubmittedPlayedCharacter } from './interfaces/submitted-played-character';
import { SubmittedPlayedFloor } from './interfaces/submitted-played-floor';
import { SubmittedGameplayEvent } from './interfaces/submitted-gameplay-event';

const uiElements: Map<string, HTMLDivElement> = new Map<string, HTMLDivElement>();

let editCharacter: number | null = null;
let editFloor: number | null = null;
let currentCharacter: number = 0;
let currentFloor: number = 0;

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

const selectCharacterCallbackFunction = (characterId: string) => {
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

const selectModeCallbackFunction = (mode: string): void => {
    console.log('selected mode: ', mode)
    episode.PlayedCharacters[editCharacter !== null ? editCharacter : currentCharacter].GameMode = parseInt(mode, 10);
    editCharacter = null;
    hideAllExcept('select-floor');
}

const selectFloorCallbackFunction = (id: string): void => {
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

(() => {
    const wrapper = loadDivElementById('menu-wrapper', null);
    uiElements.set('select-character', loadDivElementById('select-character', wrapper));
    uiElements.set('select-mode', loadDivElementById('select-mode', wrapper));
    uiElements.set('select-floor', loadDivElementById('select-floor', wrapper));
    uiElements.set('select-curse', loadDivElementById('select-curse', wrapper));

    initializeDropdownContainers();
    initializeBoxes();

    registerDropdownMenuCallbackFunction('select-floor-dd', selectFloorCallbackFunction);
    registerBoxCallbackFunction('select-character-boxes', selectCharacterCallbackFunction);
    registerBoxCallbackFunction('select-mode-boxes', selectModeCallbackFunction);
    registerBoxCallbackFunction('select-floor-boxes', selectFloorCallbackFunction);
})();


