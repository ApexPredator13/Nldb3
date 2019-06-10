import { loadDivElementById, addClassIfNotExists, removeClassIfExists } from './lib/dom-operations';
import { GameplayEventType } from './enums/gameplay-event-type';
import { Boxes } from './components/boxes';
import { SearchBox } from './components/searchbox';
import { EpisodeManager } from './lib/episode-manager';

const uiElements: Map<string, HTMLDivElement> = new Map<string, HTMLDivElement>();
const wrapper = loadDivElementById('menu-wrapper', null);

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

const storeUiElements = (...elementIds: Array<string>) => {
    for (const elementId of elementIds) {
        uiElements.set(elementId, loadDivElementById(elementId, wrapper));
    }
}

// loads all button logic that is not part of a specific prerendered component from the server
const initializeButtons = (wrapper: HTMLDivElement) => {
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
    (<HTMLButtonElement>document.getElementById('yes-its-over')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); console.warn('todo: end of video!'); });
    (<HTMLButtonElement>document.getElementById('no-cancel')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); hideAllExcept('select-gameplay-events'); });
    (<HTMLButtonElement>document.getElementById('next-floor')).addEventListener('click', e => { console.log('next floor!'); e.preventDefault(); e.stopPropagation(); hideAllExcept('select-floor'); });
    (<HTMLButtonElement>document.getElementById('end-of-video')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); hideAllExcept('end-of-video-confirmation'); });
    (<HTMLButtonElement>document.getElementById('end-of-video-btn')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); hideAllExcept('end-of-video-confirmation'); });
}

(() => {
    // load all UI elements that will be swapped out each time something got selected
    storeUiElements(
        'select-character', 'select-mode', 'select-floor', 'select-curse', 'select-gameplay-events', 'select-absorber', 'select-absorbed-item',
        'select-item-source', 'select-item', 'select-touched-item-source', 'select-touched-item', 'select-boss', 'select-reroll', 'select-enemy',
        'next-run', 'select-pill', 'select-tarot', 'select-rune', 'select-trinket', 'select-other-consumable',
        'end-of-video-confirmation'
    );

    initializeButtons(wrapper);

    const episodeManager = new EpisodeManager();

    // register all prerendered ui components and what happens after something is selected
    const characterBoxes = new Boxes('select-character-boxes');
    characterBoxes.elementWasSelected.subscribe(c => {
        episodeManager.AddCharacter(c);
        hideAllExcept('select-mode');
    });

    const gameplayModeBoxes = new Boxes('select-mode-boxes');
    gameplayModeBoxes.elementWasSelected.subscribe(m => {
        episodeManager.AddGameModeToCharacter(m);
        hideAllExcept('select-floor');
    });

    const bossBoxes = new Boxes('select-boss-boxes');
    bossBoxes.elementWasSelected.subscribe(b => {
        episodeManager.AddGameplayEvent(b, GameplayEventType.Bossfight, 1);
        hideAllExcept('select-gameplay-events');
    });

    const bossSearchBox = new SearchBox('select-boss-dd');
    bossSearchBox.elementWasSelected.subscribe(b => {
        episodeManager.AddGameplayEvent(b, GameplayEventType.Bossfight, 1);
        hideAllExcept('select-gameplay-events');
    });

    const floorSearchBox = new SearchBox('select-floor-dd');
    floorSearchBox.elementWasSelected.subscribe(f => {
        episodeManager.AddFloorToCharacter(f, bossBoxes);
        episodeManager.LoadNextFloorset(f, floorBoxes);
        hideAllExcept('select-curse');
    });

    const floorBoxes = new Boxes('select-floor-boxes');
    floorBoxes.elementWasSelected.subscribe(f => {
        episodeManager.AddFloorToCharacter(f, bossBoxes);
        episodeManager.LoadNextFloorset(f, floorBoxes);
        hideAllExcept('select-curse');
    });

    const curseSearchBox = new SearchBox('select-curse-dd');
    curseSearchBox.elementWasSelected.subscribe(c => {
        episodeManager.AddGameplayEvent(c, GameplayEventType.Curse, 1);
        hideAllExcept('select-gameplay-events');
    });

    const absorberBoxes = new Boxes('select-absorber-boxes');
    absorberBoxes.elementWasSelected.subscribe(a => {
        episodeManager.AddGameplayEvent(a, GameplayEventType.AbsorbedItem, 2);
        hideAllExcept('select-absorbed-item');
    });

    const absorbedItemSearchBox = new SearchBox('select-absorbed-item-dd');
    absorbedItemSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.AbsorbedItem, 1);
        hideAllExcept('select-gameplay-events');
    });

    const itemSourceSearchBox = new SearchBox('select-item-source-dd');
    itemSourceSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
        hideAllExcept('select-item');
    });

    const itemSourceBoxes = new Boxes('select-item-source-boxes');
    itemSourceBoxes.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
        hideAllExcept('select-item');
    });

    const itemSearchBox = new SearchBox('select-item-dd');
    itemSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 1);
        hideAllExcept('select-gameplay-events');
    });

    const touchedItemSourceSearchBox = new SearchBox('select-touched-item-source-dd');
    touchedItemSourceSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
        hideAllExcept('select-touched-item');
    });

    const touchedItemSourceBoxes = new Boxes('select-touched-item-source-boxes');
    touchedItemSourceBoxes.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
        hideAllExcept('select-touched-item');
    });

    const touchedItemSearchBox = new SearchBox('select-touched-item-dd');
    touchedItemSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 1);
        hideAllExcept('select-gameplay-events');
    });

    const rerollBoxes = new Boxes('select-reroll-boxes');
    rerollBoxes.elementWasSelected.subscribe(r => {
        episodeManager.AddGameplayEvent(r, GameplayEventType.CharacterReroll, 1);
        hideAllExcept('select-gameplay-events');
    });

    const enemiesSearchBox = new SearchBox('select-enemies-dd');
    enemiesSearchBox.elementWasSelected.subscribe(e => {
        episodeManager.AddGameplayEvent(e, GameplayEventType.CharacterDied, 1);
        hideAllExcept('next-run');
    });

    const pillSearchBox = new SearchBox('select-pill-dd');
    pillSearchBox.elementWasSelected.subscribe(p => {
        episodeManager.AddGameplayEvent(p, GameplayEventType.Pill, 1);
        hideAllExcept('select-gameplay-events');
    });

    const runeBoxes = new Boxes('select-rune-boxes');
    runeBoxes.elementWasSelected.subscribe(r => {
        episodeManager.AddGameplayEvent(r, GameplayEventType.Rune, 1);
        hideAllExcept('select-gameplay-events');
    });

    const trinketSearchBox = new SearchBox('select-trinket-dd');
    trinketSearchBox.elementWasSelected.subscribe(r => {
        episodeManager.AddGameplayEvent(r, GameplayEventType.Trinket, 1);
        hideAllExcept('select-gameplay-events');
    });

    const otherConsumableBoxes = new Boxes('select-other-consumable-boxes');
    otherConsumableBoxes.elementWasSelected.subscribe(o => {
        episodeManager.AddGameplayEvent(o, GameplayEventType.OtherConsumable, 1);
        hideAllExcept('select-gameplay-events');
    });

    const tarotSearchBox = new SearchBox('select-tarot-dd');
    tarotSearchBox.elementWasSelected.subscribe(t => {
        episodeManager.AddGameplayEvent(t, GameplayEventType.TarotCard, 1);
        hideAllExcept('select-gameplay-events');
    });
})();


