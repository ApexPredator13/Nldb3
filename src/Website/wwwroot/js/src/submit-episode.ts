import { loadDivElementById, addClassIfNotExists, removeClassIfExists } from './lib/dom-operations';
import { GameplayEventType } from './enums/gameplay-event-type';
import { Boxes } from './components/boxes';
import { SearchBox } from './components/searchbox';
import { EpisodeManager } from './lib/episode-manager';

const uiElements: Map<string, HTMLDivElement> = new Map<string, HTMLDivElement>();
const wrapper = loadDivElementById('menu-wrapper', null);

const show = (uiElementId: string): void => {
    for (const container of uiElements) {
        if (container[1].id === uiElementId) {
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

const showSubmitEpisodeErrorMessage = (failureResponse: Response) => {
    if (failureResponse.ok) {
        return;
    } else {
        failureResponse.text().then(errorMessage => {
            const errorMessageSpan = <HTMLSpanElement>document.getElementById('submission-failed-error-message');
            errorMessageSpan.innerText = errorMessage;
        });
    }
}

(() => {
    // create youtube player callback function
    (window as any).onYouTubeIframeAPIReady = () => {
        console.log('onYouTubeIframeAPIReady called');
        (window as any).youtubePlayer = new (window as any).YT.Player('ytplayer', {});

        console.log('player created', (window as any).youtubePlayer);

        // stretch the iframe
        const iframe = document.getElementById('ytplayer') as HTMLIFrameElement;
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.width = '100%';
        iframe.height = '100%';
    }

    // create youtube player
    const youtubeScriptTag = document.createElement('script');
    youtubeScriptTag.src = 'https://www.youtube.com/iframe_api';
    const scriptTags = document.getElementsByTagName('script');
    if (scriptTags && scriptTags.length > 0 && scriptTags[0].parentNode) {
        scriptTags[0].parentNode.insertBefore(youtubeScriptTag, scriptTags[0]);
    }

    // load and store all server-prerendered UI elements that will be swapped out each time something got selected
    storeUiElements(
        'select-character', 'select-mode', 'select-floor', 'select-curse', 'select-gameplay-events', 'select-absorber', 'select-absorbed-item',
        'select-item-source', 'select-item', 'select-touched-item-source', 'select-touched-item', 'select-boss', 'select-reroll', 'select-enemy',
        'next-run', 'select-pill', 'select-tarot', 'select-rune', 'select-trinket', 'select-other-consumable',
        'end-of-video-confirmation', 'episode-submission-failed', 'episode-submitted', 'select-starting-item', 'more-starting-items'
    );

    const episodeManager = new EpisodeManager();

    // register all prerendered ui components and what happens after something is selected
    const characterBoxes = new Boxes('select-character-boxes');
    characterBoxes.elementWasSelected.subscribe(c => {
        episodeManager.AddCharacter(c);
        show('select-mode');
    });

    const curseSearchBox = new SearchBox('select-curse-dd');
    curseSearchBox.elementWasSelected.subscribe(c => {
        episodeManager.AddGameplayEvent(c, GameplayEventType.Curse, 1);
        if (episodeManager.CharacterIsOnFirstFloor()) {
            show('select-starting-item');
        } else {
            show('select-gameplay-events');
        }
        curseSearchBox.Reset();
    });

    const startingItemsSearchBox = new SearchBox('select-starting-item-dd');
    startingItemsSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 1);
        episodeManager.AddGameplayEvent('StartingItem', GameplayEventType.ItemCollected, 2);
        show('more-starting-items');
        startingItemsSearchBox.Reset();
    });

    const floorSearchBox = new SearchBox('select-floor-dd');
    floorSearchBox.elementWasSelected.subscribe(f => {
        episodeManager.AddFloorToCharacter(f, bossBoxes);
        episodeManager.LoadNextFloorset(f, floorBoxes);
        show('select-curse');
        curseSearchBox.Focus();
        floorSearchBox.Reset();
    });

    const floorBoxes = new Boxes('select-floor-boxes');
    floorBoxes.elementWasSelected.subscribe(f => {
        episodeManager.AddFloorToCharacter(f, bossBoxes);
        episodeManager.LoadNextFloorset(f, floorBoxes);
        show('select-curse');
    });

    const gameplayModeBoxes = new Boxes('select-mode-boxes');
    gameplayModeBoxes.elementWasSelected.subscribe(m => {
        episodeManager.AddGameModeToCharacter(m);
        show('select-floor');
        floorSearchBox.Focus();
    });

    const bossBoxes = new Boxes('select-boss-boxes');
    bossBoxes.elementWasSelected.subscribe(b => {
        episodeManager.AddGameplayEvent(b, GameplayEventType.Bossfight, 1);
        show('select-gameplay-events');
    });

    const bossSearchBox = new SearchBox('select-boss-dd');
    bossSearchBox.elementWasSelected.subscribe(b => {
        episodeManager.AddGameplayEvent(b, GameplayEventType.Bossfight, 1);
        show('select-gameplay-events');
        bossSearchBox.Reset();
    });

    const absorbedItemSearchBox = new SearchBox('select-absorbed-item-dd');
    absorbedItemSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.AbsorbedItem, 1);
        show('select-gameplay-events');
        absorbedItemSearchBox.Reset();
    });

    const absorberBoxes = new Boxes('select-absorber-boxes');
    absorberBoxes.elementWasSelected.subscribe(a => {
        episodeManager.AddGameplayEvent(a, GameplayEventType.AbsorbedItem, 2);
        show('select-absorbed-item');
        absorbedItemSearchBox.Focus();
    });

    const itemSearchBox = new SearchBox('select-item-dd');
    itemSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 1);
        show('select-gameplay-events');
        itemSearchBox.Reset();
    });

    const itemSourceSearchBox = new SearchBox('select-item-source-dd');
    itemSourceSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
        show('select-item');
        itemSearchBox.Focus();
        itemSourceSearchBox.Reset();
    });

    const itemSourceBoxes = new Boxes('select-item-source-boxes');
    itemSourceBoxes.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
        show('select-item');
        itemSearchBox.Focus();
    });

    const touchedItemSearchBox = new SearchBox('select-touched-item-dd');
    touchedItemSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 1);
        show('select-gameplay-events');
        touchedItemSearchBox.Reset();
    });

    const touchedItemSourceSearchBox = new SearchBox('select-touched-item-source-dd');
    touchedItemSourceSearchBox.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
        show('select-touched-item');
        touchedItemSearchBox.Focus();
        touchedItemSourceSearchBox.Reset();
    });

    const touchedItemSourceBoxes = new Boxes('select-touched-item-source-boxes');
    touchedItemSourceBoxes.elementWasSelected.subscribe(i => {
        episodeManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
        show('select-touched-item');
        touchedItemSearchBox.Focus();
    });

    const rerollBoxes = new Boxes('select-reroll-boxes');
    rerollBoxes.elementWasSelected.subscribe(r => {
        episodeManager.AddGameplayEvent(r, GameplayEventType.CharacterReroll, 1);
        show('select-gameplay-events');
    });

    const enemiesSearchBox = new SearchBox('select-enemies-dd');
    enemiesSearchBox.elementWasSelected.subscribe(e => {
        episodeManager.AddGameplayEvent(e, GameplayEventType.CharacterDied, 1);
        show('next-run');
        enemiesSearchBox.Reset();
    });

    const pillSearchBox = new SearchBox('select-pill-dd');
    pillSearchBox.elementWasSelected.subscribe(p => {
        episodeManager.AddGameplayEvent(p, GameplayEventType.Pill, 1);
        show('select-gameplay-events');
        pillSearchBox.Reset();
    });

    const runeBoxes = new Boxes('select-rune-boxes');
    runeBoxes.elementWasSelected.subscribe(r => {
        episodeManager.AddGameplayEvent(r, GameplayEventType.Rune, 1);
        show('select-gameplay-events');
    });

    const trinketSearchBox = new SearchBox('select-trinket-dd');
    trinketSearchBox.elementWasSelected.subscribe(r => {
        episodeManager.AddGameplayEvent(r, GameplayEventType.Trinket, 1);
        show('select-gameplay-events');
        trinketSearchBox.Reset();
    });

    const otherConsumableBoxes = new Boxes('select-other-consumable-boxes');
    otherConsumableBoxes.elementWasSelected.subscribe(o => {
        episodeManager.AddGameplayEvent(o, GameplayEventType.OtherConsumable, 1);
        show('select-gameplay-events');
    });

    const tarotSearchBox = new SearchBox('select-tarot-dd');
    tarotSearchBox.elementWasSelected.subscribe(t => {
        episodeManager.AddGameplayEvent(t, GameplayEventType.TarotCard, 1);
        show('select-gameplay-events');
        tarotSearchBox.Reset();
    });



    // loads all button logic that is not part of a specific prerendered component from the server
    loadDivElementById('sucked-up-item-box', wrapper).addEventListener('click', () => show('select-absorber'));
    loadDivElementById('collected-item-box', wrapper).addEventListener('click', () => { show('select-item-source'); itemSourceSearchBox.Focus(); });
    loadDivElementById('bossfight-box', wrapper).addEventListener('click', () => { show('select-boss'); bossSearchBox.Focus(); });
    loadDivElementById('character-reroll-box', wrapper).addEventListener('click', () => show('select-reroll'));
    loadDivElementById('select-enemy-box', wrapper).addEventListener('click', () => { show('select-enemy'); enemiesSearchBox.Focus(); });
    loadDivElementById('select-pill-box', wrapper).addEventListener('click', () => { show('select-pill'); pillSearchBox.Focus(); });
    loadDivElementById('select-tarot-box', wrapper).addEventListener('click', () => { show('select-tarot'); tarotSearchBox.Focus(); });
    loadDivElementById('select-rune-box', wrapper).addEventListener('click', () => show('select-rune'));
    loadDivElementById('select-trinket-box', wrapper).addEventListener('click', () => { show('select-trinket'); trinketSearchBox.Focus(); });
    loadDivElementById('select-other-consumable-box', wrapper).addEventListener('click', () => show('select-other-consumable'));
    (<HTMLButtonElement>document.getElementById('another-run-btn')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show('select-character') });
    (<HTMLButtonElement>document.getElementById('victory-lap-btn')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show('select-floor'); floorSearchBox.Focus; });
    (<HTMLButtonElement>document.getElementById('no-cancel')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show('select-gameplay-events'); });
    (<HTMLButtonElement>document.getElementById('next-floor')).addEventListener('click', e => { console.log('next floor!'); e.preventDefault(); e.stopPropagation(); show('select-floor'); });
    (<HTMLButtonElement>document.getElementById('end-of-video')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show('end-of-video-confirmation'); });
    (<HTMLButtonElement>document.getElementById('end-of-video-btn')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show('end-of-video-confirmation'); });
    (<HTMLButtonElement>document.getElementById('more-starting-items')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show('select-starting-item'); });
    (<HTMLButtonElement>document.getElementById('no-more-starting-items')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show('select-gameplay-events'); });
    (<HTMLButtonElement>document.getElementById('cancel-starting-item-input')).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show('select-gameplay-events'); });

    // 'submit episode' events
    const yesItsOverButton = <HTMLButtonElement>document.getElementById('yes-its-over-button');
    const trySubmitAgainButton = <HTMLButtonElement>document.getElementById('try-again-button');

    const submitEpisodeFunction = (e: MouseEvent) => {
        if (e.target && e.target instanceof HTMLButtonElement) {
            e.preventDefault();
            e.target.disabled = true;
            e.stopPropagation();
            episodeManager.Submit().then(response => {
                if (response.ok) {
                    show('episode-submitted');
                } else {
                    showSubmitEpisodeErrorMessage(response);
                    show('episode-submission-failed');
                }
                (e.target as HTMLButtonElement).disabled = false;
            });
        }
    };

    yesItsOverButton.addEventListener('click', submitEpisodeFunction);
    trySubmitAgainButton.addEventListener('click', submitEpisodeFunction);
})();


