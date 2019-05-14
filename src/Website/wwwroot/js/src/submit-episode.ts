import { loadDivElementById, loadDivElementsByClass, addClassIfNotExists, removeClassIfExists, loadElementsByTagName } from './lib/dom-operations';
import { SubmittedCompleteEpisode } from './interfaces/submitted-complete-episode';
import { SubmittedPlayedCharacter } from './interfaces/submitted-played-character';
import { SubmittedPlayedFloor } from './interfaces/submitted-played-floor';
import { SubmittedGameplayEvent } from './interfaces/submitted-gameplay-event';

const containers: Map<string, HTMLDivElement> = new Map<string, HTMLDivElement>();

let editCharacter: number | null = null;
let editFloor: number | null = null;
let currentCharacter: number = 0;
let currentFloor: number = 0;

const episode: SubmittedCompleteEpisode = {
    VideoId: window.location.href.substr(window.location.href.length - 11, 11),
    PlayedCharacters: new Array<SubmittedPlayedCharacter>()
};

const hideAllExcept = (except: string): void => {
    for (const container of containers) {
        if (container[1].id === except) {
            addClassIfNotExists(container[1], 'display-normal');
            removeClassIfExists(container[1], 'display-none');
        } else {
            removeClassIfExists(container[1], 'display-normal');
            addClassIfNotExists(container[1], 'display-none');
        }
    }
}

const applyChooseCharacterClickEvents = (boxes: HTMLCollectionOf<HTMLDivElement>) => {
    for (const characterBox of boxes) {
        characterBox.addEventListener('click', e => {
            e.stopPropagation();
            const characterId = characterBox.getAttribute('data-id') as string;
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
                console.log(episode, currentCharacter);
            }
        });
    }
}

const applyChooseModeClickEvents = (buttons: HTMLCollectionOf<Element>): void => {
    for (const button of buttons) {
        button.addEventListener('click', e => {
            e.stopPropagation();
            e.preventDefault();
            const id = button.getAttribute('data-id');
            if (!id) {
                throw 'game mode id not found on button!';
            }
            episode.PlayedCharacters[editCharacter !== null ? editCharacter : currentCharacter].GameMode = parseInt(id, 10);
            editCharacter = null;
            hideAllExcept('select-floor');
        });
    }
}

const applyShowAllFloorsClickEvents = (elements: HTMLCollectionOf<Element>): void => {
    if (elements.length === 0) {
        throw 'no "show all floors" link was found!';
    }
    const element = elements[0] as HTMLAnchorElement;
    element.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();

        const text = element.innerText.toLowerCase();
        if (text.startsWith('show')) {
            element.innerText = 'Hide all Floors';
        } else {
            element.innerText = 'Show all Floors';
        }

        if (element.nextElementSibling) {
            element.nextElementSibling.classList.toggle('display-none');
        }
    });
}

const applySelectFloorClickEvents = (elements: HTMLCollectionOf<HTMLDivElement>): void => {
    for (const element of elements) {
        element.addEventListener('click', e => {
            e.stopPropagation();
            const id = element.getAttribute('data-id');

            if (!id) {
                throw 'no id found on floor object!';
            }

            if (editFloor !== null) {
                episode.PlayedCharacters[currentCharacter].PlayedFloors[editFloor].FloorId = id;
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
        });
    }
}

(() => {
    const wrapper = loadDivElementById('menu-wrapper', null);
    containers.set('select-character', loadDivElementById('select-character', wrapper));
    containers.set('select-mode', loadDivElementById('select-mode', wrapper));
    containers.set('select-floor', loadDivElementById('select-floor', wrapper));
    containers.set('select-curse', loadDivElementById('select-curse', wrapper));

    const characterBoxes = loadDivElementsByClass('character-box', containers.get('select-character'));
    applyChooseCharacterClickEvents(characterBoxes);

    const chooseModeButtons = loadElementsByTagName('button', containers.get('select-mode'));
    applyChooseModeClickEvents(chooseModeButtons);

    const showAllFloors = loadElementsByTagName('a', containers.get('select-floor'));
    applyShowAllFloorsClickEvents(showAllFloors);

    const allFloors = loadDivElementsByClass('character-box', containers.get('select-floor'));   // todo: switch character box to something appropriate
    applySelectFloorClickEvents(allFloors);
})();


