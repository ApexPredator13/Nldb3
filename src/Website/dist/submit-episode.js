"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dom_operations_1 = require("./lib/dom-operations");
const containers = new Map();
let editCharacter = null;
let currentCharacter = 0;
const episode = {
    VideoId: window.location.href.substr(window.location.href.length - 11, 11),
    PlayedCharacters: new Array()
};
const hideAllExcept = (except) => {
    for (const container of containers) {
        if (container[1].id === except) {
            dom_operations_1.addClassIfNotExists(container[1], 'display-normal');
            dom_operations_1.removeClassIfExists(container[1], 'display-none');
        }
        else {
            dom_operations_1.removeClassIfExists(container[1], 'display-normal');
            dom_operations_1.addClassIfNotExists(container[1], 'display-none');
        }
    }
};
const applyCharacterBoxClickEvents = (boxes) => {
    for (const characterBox of boxes) {
        characterBox.addEventListener('click', e => {
            e.stopPropagation();
            const characterId = characterBox.getAttribute('data-id');
            if (editCharacter !== null) {
                episode.PlayedCharacters[editCharacter].CharacterId = characterId;
                editCharacter = null;
                // todo: hideAllExcept(...some overview...)
            }
            else {
                episode.PlayedCharacters.push({
                    CharacterId: characterId,
                    GameMode: 7,
                    PlayedFloors: new Array()
                });
                currentCharacter = episode.PlayedCharacters.length - 1;
                hideAllExcept('select-mode');
                console.log(episode, currentCharacter);
            }
        });
    }
};
const applyChooseModeClickEvents = (buttons) => {
    for (const button of buttons) {
        button.addEventListener('click', e => {
            e.stopPropagation();
            e.preventDefault();
            const id = button.getAttribute('data-id');
            if (!id) {
                throw 'game mode id not found on button!';
            }
            episode.PlayedCharacters[currentCharacter].GameMode = parseInt(id, 10);
            hideAllExcept('select-floor');
        });
    }
};
(() => {
    const wrapper = dom_operations_1.loadDivElementById('menu-wrapper', null);
    containers.set('select-character', dom_operations_1.loadDivElementById('select-character', wrapper));
    containers.set('select-mode', dom_operations_1.loadDivElementById('select-mode', wrapper));
    containers.set('select-floor', dom_operations_1.loadDivElementById('select-floor', wrapper));
    containers.set('select-curse', dom_operations_1.loadDivElementById('select-curse', wrapper));
    const characterBoxes = dom_operations_1.loadDivElementsByClass('character-box', containers.get('select-character'));
    applyCharacterBoxClickEvents(characterBoxes);
    const chooseModeButtons = dom_operations_1.loadElementsByTagName('button', containers.get('select-mode'));
    applyChooseModeClickEvents(chooseModeButtons);
})();
