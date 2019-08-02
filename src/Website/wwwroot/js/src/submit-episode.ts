import { loadDivElementById, addClassIfNotExists, removeClassIfExists, getSpecificElementById } from './lib/dom-operations';
import { GameplayEventType } from './enums/gameplay-event-type';
import { Boxes } from './components/boxes';
import { SearchBox } from './components/searchbox';
import { EpisodeHistoryManager } from './lib/episode-history-manager';
import { YoutubePlayer } from './components/youtube-player';


class SubmitEpisodePageHandler {

    // ui element container, main wrapper
    public wrapper: HTMLDivElement;
    private historyManager: EpisodeHistoryManager;
    private uiElements: Map<string, HTMLDivElement>;

    // quote button variables
    private buttonTimeoutInterval: number | undefined;
    private buttonTimeoutNumber: number;

    // 'submit quote' html elements
    private submitQuotesTextarea: HTMLTextAreaElement;
    private submitQuotesTextareaCounter: HTMLSpanElement;
    private submitQuotesExactTimeRadio: HTMLInputElement;
    private submitQuotesCurrentVideoTimeRadio: HTMLInputElement;
    private submitQuotesSelectMinute: HTMLSelectElement;
    private submitQuotesSelectSecond: HTMLSelectElement;
    private submitQuoteHeader: HTMLParagraphElement;
    private submitQuoteButton: HTMLButtonElement;

    constructor(historyManager: EpisodeHistoryManager) {
        this.historyManager = historyManager;
        this.uiElements = new Map<string, HTMLDivElement>();
        this.wrapper = loadDivElementById('menu-wrapper', null);

        this.buttonTimeoutNumber = 15;
        this.buttonTimeoutInterval = undefined;

        // get all elements that are relevant to the quotes section
        this.submitQuotesTextarea = getSpecificElementById('quotes-textarea', HTMLTextAreaElement);
        this.submitQuotesTextareaCounter = getSpecificElementById('quotes-textarea-counter', HTMLSpanElement);
        this.submitQuotesExactTimeRadio = getSpecificElementById('exact-time', HTMLInputElement);
        this.submitQuotesCurrentVideoTimeRadio = getSpecificElementById('current-video-time', HTMLInputElement);
        this.submitQuotesSelectMinute = getSpecificElementById('select-minute', HTMLSelectElement);
        this.submitQuotesSelectSecond = getSpecificElementById('select-second', HTMLSelectElement);
        this.submitQuoteHeader = getSpecificElementById('submit-quote-header', HTMLParagraphElement);
        this.submitQuoteButton = getSpecificElementById('submit-quote-button', HTMLButtonElement);

        this.initializeQuotesSectionLogic();

        // get all prerendered UI components and store them for quick access later
        this.storeUiElements([
            'select-character', 'select-mode', 'select-floor', 'select-curse', 'select-gameplay-events', 'select-absorber', 'select-absorbed-item',
            'select-item-source', 'select-item', 'select-touched-item-source', 'select-touched-item', 'select-boss', 'select-reroll', 'select-enemy',
            'next-run', 'select-pill', 'select-tarot', 'select-rune', 'select-trinket', 'select-other-consumable',
            'end-of-video-confirmation', 'episode-submission-failed', 'episode-submitted', 'select-starting-item', 'more-starting-items', 'select-starting-trinket',
            'select-more-starting-trinkets'
        ]);

        // ...then initialize all component logic
        this.initializeEventGotSelectedLogic();

        // finally initialize episode submission
        this.initializeSubmitEpisodeEvents();
    }

    private initializeEventGotSelectedLogic() {
        // after a character was selected, ask what game mode is played
        const characterBoxes = new Boxes('select-character-boxes');
        characterBoxes.elementWasSelected.subscribe(c => {
            this.historyManager.AddCharacter(c);
            this.showUiElement('select-mode');
        });

        // after a curse was selected, show gameplay events overview,
        // except for the first floor -> ask if there were any starting items
        const curseSearchBox = new SearchBox('select-curse-dd');
        curseSearchBox.elementWasSelected.subscribe(c => {
            this.historyManager.AddGameplayEvent(c, GameplayEventType.Curse, 1);
            if (this.historyManager.CharacterIsOnFirstFloor()) {
                this.showUiElement('select-starting-item');
            } else {
                this.showUiElement('select-gameplay-events');
            }
            curseSearchBox.Reset();
        });

        // after a starting item was selected, ask if more starting items exist
        const startingItemsSearchBox = new SearchBox('select-starting-item-dd');
        startingItemsSearchBox.elementWasSelected.subscribe(i => {
            this.historyManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 1);
            this.historyManager.AddGameplayEvent('StartingItem', GameplayEventType.ItemCollected, 2);
            this.showUiElement('more-starting-items');
            startingItemsSearchBox.Reset();
        });

        // after a floor was selected, ask if the floor was cursed
        const floorSearchBox = new SearchBox('select-floor-dd');
        floorSearchBox.elementWasSelected.subscribe(f => {
            this.historyManager.AddFloorToCharacter(f, bossBoxes);
            this.historyManager.LoadNextFloorset(f, floorBoxes);
            this.showUiElement('select-curse');
            curseSearchBox.Focus();
            floorSearchBox.Reset();
        });

        const floorBoxes = new Boxes('select-floor-boxes');
        floorBoxes.elementWasSelected.subscribe(f => {
            this.historyManager.AddFloorToCharacter(f, bossBoxes);
            this.historyManager.LoadNextFloorset(f, floorBoxes);
            this.showUiElement('select-curse');
        });

        // after a gameplay mode was selected, ask what floor we start on
        const gameplayModeBoxes = new Boxes('select-mode-boxes');
        gameplayModeBoxes.elementWasSelected.subscribe(m => {
            this.historyManager.AddGameModeToCharacter(m);
            this.showUiElement('select-floor');
            floorSearchBox.Focus();
        });

        // after a boss was selected, go back to gameplay events overview
        const bossBoxes = new Boxes('select-boss-boxes');
        bossBoxes.elementWasSelected.subscribe(b => {
            this.historyManager.AddGameplayEvent(b, GameplayEventType.Bossfight, 1);
            this.showUiElement('select-gameplay-events');
        });

        const bossSearchBox = new SearchBox('select-boss-dd');
        bossSearchBox.elementWasSelected.subscribe(b => {
            this.historyManager.AddGameplayEvent(b, GameplayEventType.Bossfight, 1);
            this.showUiElement('select-gameplay-events');
            bossSearchBox.Reset();
        });

        // after an absorbed item was selected, go back to gameplay events overview
        const absorbedItemSearchBox = new SearchBox('select-absorbed-item-dd');
        absorbedItemSearchBox.elementWasSelected.subscribe(i => {
            this.historyManager.AddGameplayEvent(i, GameplayEventType.AbsorbedItem, 1);
            this.showUiElement('select-gameplay-events');
            absorbedItemSearchBox.Reset();
        });

        // after an absorber was selected, ask which item was absorbed
        const absorberBoxes = new Boxes('select-absorber-boxes');
        absorberBoxes.elementWasSelected.subscribe(a => {
            this.historyManager.AddGameplayEvent(a, GameplayEventType.AbsorbedItem, 2);
            this.showUiElement('select-absorbed-item');
            absorbedItemSearchBox.Focus();
        });

        // after a collected item was selected, go back to gameplay events overview
        const itemSearchBox = new SearchBox('select-item-dd');
        itemSearchBox.elementWasSelected.subscribe(i => {
            this.historyManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 1);
            this.showUiElement('select-gameplay-events');
            itemSearchBox.Reset();
        });

        // after choosing what dropped an item the player collected, ask which item it was
        const itemSourceSearchBox = new SearchBox('select-item-source-dd');
        itemSourceSearchBox.elementWasSelected.subscribe(i => {
            this.historyManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
            this.showUiElement('select-item');
            itemSearchBox.Focus();
            itemSourceSearchBox.Reset();
        });

        const itemSourceBoxes = new Boxes('select-item-source-boxes');
        itemSourceBoxes.elementWasSelected.subscribe(i => {
            this.historyManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
            this.showUiElement('select-item');
            itemSearchBox.Focus();
        });

        // after a touched item was selected, go back to gameplay events overview
        const touchedItemSearchBox = new SearchBox('select-touched-item-dd');
        touchedItemSearchBox.elementWasSelected.subscribe(i => {
            this.historyManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 1);
            this.showUiElement('select-gameplay-events');
            touchedItemSearchBox.Reset();
        });

        // after choosing what dropped the item the player touched, ask which item it was
        const touchedItemSourceSearchBox = new SearchBox('select-touched-item-source-dd');
        touchedItemSourceSearchBox.elementWasSelected.subscribe(i => {
            this.historyManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
            this.showUiElement('select-touched-item');
            touchedItemSearchBox.Focus();
            touchedItemSourceSearchBox.Reset();
        });

        const touchedItemSourceBoxes = new Boxes('select-touched-item-source-boxes');
        touchedItemSourceBoxes.elementWasSelected.subscribe(i => {
            this.historyManager.AddGameplayEvent(i, GameplayEventType.ItemCollected, 2);
            this.showUiElement('select-touched-item');
            touchedItemSearchBox.Focus();
        });

        // after selecting how the player rerolled his character, go back to gameplay events overview
        const rerollBoxes = new Boxes('select-reroll-boxes');
        rerollBoxes.elementWasSelected.subscribe(r => {
            this.historyManager.AddGameplayEvent(r, GameplayEventType.CharacterReroll, 1);
            this.showUiElement('select-gameplay-events');
        });

        // after selecting an enemy, ask if there was another run
        const enemiesSearchBox = new SearchBox('select-enemies-dd');
        enemiesSearchBox.elementWasSelected.subscribe(e => {
            this.historyManager.AddGameplayEvent(e, GameplayEventType.CharacterDied, 1);
            this.showUiElement('next-run');
            enemiesSearchBox.Reset();
        });

        // after selecting a pill, go back to gameplay events overview
        const pillSearchBox = new SearchBox('select-pill-dd');
        pillSearchBox.elementWasSelected.subscribe(p => {
            this.historyManager.AddGameplayEvent(p, GameplayEventType.Pill, 1);
            this.showUiElement('select-gameplay-events');
            pillSearchBox.Reset();
        });

        // after selecting a rune, go back to gameplay events overview
        const runeBoxes = new Boxes('select-rune-boxes');
        runeBoxes.elementWasSelected.subscribe(r => {
            this.historyManager.AddGameplayEvent(r, GameplayEventType.Rune, 1);
            this.showUiElement('select-gameplay-events');
        });

        // after selecting a trinket, go back to gameplay events overview
        const trinketSearchBox = new SearchBox('select-trinket-dd');
        trinketSearchBox.elementWasSelected.subscribe(r => {
            this.historyManager.AddGameplayEvent(r, GameplayEventType.Trinket, 1);
            this.showUiElement('select-gameplay-events');
            trinketSearchBox.Reset();
        });

        // after selecting a misc. consumable, go back to gameplay events overview
        const otherConsumableBoxes = new Boxes('select-other-consumable-boxes');
        otherConsumableBoxes.elementWasSelected.subscribe(o => {
            this.historyManager.AddGameplayEvent(o, GameplayEventType.OtherConsumable, 1);
            this.showUiElement('select-gameplay-events');
        });

        // after selecting a tarot card, go back to gameplay events overview
        const tarotSearchBox = new SearchBox('select-tarot-dd');
        tarotSearchBox.elementWasSelected.subscribe(t => {
            this.historyManager.AddGameplayEvent(t, GameplayEventType.TarotCard, 1);
            this.showUiElement('select-gameplay-events');
            tarotSearchBox.Reset();
        });

        // after selecting a starting trinket, ask if the player started with any other trinkets
        const selectStartingTrinketSearchBox = new SearchBox('select-starting-trinket-dd');
        selectStartingTrinketSearchBox.elementWasSelected.subscribe(t => {
            this.historyManager.AddGameplayEvent(t, GameplayEventType.StartingTrinket, 1);
            this.showUiElement('select-more-starting-trinkets');
            selectStartingTrinketSearchBox.Reset();
        });



        // navigation logic that doesn't touch the history manager
        getSpecificElementById('sucked-up-item-box', HTMLDivElement).addEventListener('click', () => this.showUiElement('select-absorber'));
        getSpecificElementById('collected-item-box', HTMLDivElement).addEventListener('click', () => { this.showUiElement('select-item-source'); itemSourceSearchBox.Focus(); });
        getSpecificElementById('bossfight-box', HTMLDivElement).addEventListener('click', () => { this.showUiElement('select-boss'); bossSearchBox.Focus(); });
        getSpecificElementById('character-reroll-box', HTMLDivElement).addEventListener('click', () => this.showUiElement('select-reroll'));
        getSpecificElementById('select-enemy-box', HTMLDivElement).addEventListener('click', () => { this.showUiElement('select-enemy'); enemiesSearchBox.Focus(); });
        getSpecificElementById('select-pill-box', HTMLDivElement).addEventListener('click', () => { this.showUiElement('select-pill'); pillSearchBox.Focus(); });
        getSpecificElementById('select-tarot-box', HTMLDivElement).addEventListener('click', () => { this.showUiElement('select-tarot'); tarotSearchBox.Focus(); });
        getSpecificElementById('select-rune-box', HTMLDivElement).addEventListener('click', () => this.showUiElement('select-rune'));
        getSpecificElementById('select-trinket-box', HTMLDivElement).addEventListener('click', () => { this.showUiElement('select-trinket'); trinketSearchBox.Focus(); });
        getSpecificElementById('select-other-consumable-box', HTMLDivElement).addEventListener('click', () => this.showUiElement('select-other-consumable'));
        getSpecificElementById('touched-item-box', HTMLDivElement).addEventListener('click', () => this.showUiElement('select-touched-item-source'));
        getSpecificElementById('another-run-btn', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('select-character') });
        getSpecificElementById('victory-lap-btn', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('select-floor'); floorSearchBox.Focus; });
        getSpecificElementById('no-cancel', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('select-gameplay-events'); });
        getSpecificElementById('next-floor', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('select-floor'); });
        getSpecificElementById('end-of-video', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('end-of-video-confirmation'); });
        getSpecificElementById('end-of-video-btn', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('end-of-video-confirmation'); });
        getSpecificElementById('more-starting-items-button', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('select-starting-item'); });
        getSpecificElementById('no-more-starting-items', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('select-starting-trinket'); });
        getSpecificElementById('cancel-starting-item-input', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('select-starting-trinket'); });
        getSpecificElementById('skip-trinket-selection', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('select-gameplay-events'); });
        getSpecificElementById('no-more-starting-trinkets', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('select-gameplay-events'); });
        getSpecificElementById('more-starting-trinkets', HTMLButtonElement).addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.showUiElement('select-starting-trinket'); });
    }

    private initializeQuotesSectionLogic() {
        // textarea typing
        this.submitQuotesTextarea.addEventListener('input', () => {
            this.submitQuotesTextareaCounter.innerText = `(${this.submitQuotesTextarea.value.length}/300 characters)`
        });

        // reset quote header on click (if it was replaced by an error message)
        this.submitQuoteHeader.addEventListener('click', () => {
            if (this.submitQuoteHeader.classList.contains('submit-quote-error')) {
                this.resetQuoteHeader();
            }
        });

        // uncheck 'current video timer' if the other option was selected
        this.submitQuotesExactTimeRadio.addEventListener('click', () => {
            this.submitQuotesCurrentVideoTimeRadio.checked = false;
        });

        // uncheck 'specific time' if the other option is selected
        this.submitQuotesCurrentVideoTimeRadio.addEventListener('click', () => {
            this.submitQuotesExactTimeRadio.checked = false;
        });

        // auto-check 'specific time' if an option is selected
        this.submitQuotesSelectMinute.addEventListener('change', () => {
            this.submitQuotesExactTimeRadio.checked = true;
        });
        this.submitQuotesSelectSecond.addEventListener('change', () => {
            this.submitQuotesExactTimeRadio.checked = true;
        });

        // 'submit quote' event
        this.submitQuoteButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            const minuteValue = parseInt(this.submitQuotesSelectMinute.value, 10);
            const secondValue = parseInt(this.submitQuotesSelectSecond.value, 10);
            const quoteText = this.submitQuotesTextarea.value;

            // make sure a 'when did the quote happen' is selected
            if (!this.submitQuotesExactTimeRadio.checked && !this.submitQuotesCurrentVideoTimeRadio.checked) {
                this.replaceQuoteHeaderWithError('please specify when the quote started by selecting an option to the right of the textbox! (click to dismiss)');
                return;
            }

            // make sure the quote text is longer than the minimum length
            if (!quoteText || quoteText.length < 10) {
                this.replaceQuoteHeaderWithError('cannot submit quotes with less than 10 characters (click to dismiss)');
                return;
            }

            // make sure exact time is selected if corresponding radio is checked
            if (this.submitQuotesExactTimeRadio.checked) {
                const minuteIsInteger = Number.isInteger(minuteValue);
                const secondIsInteger = Number.isInteger(secondValue);

                if (!minuteIsInteger || !secondIsInteger) {
                    this.replaceQuoteHeaderWithError('please select the correct time from the minute/second dropdown menus (click to dismiss)');
                    return;
                }
            }

            // create request body
            const quoteHappenedAt = this.submitQuotesExactTimeRadio.checked ? (minuteValue * 60) + secondValue : Math.floor((window as any).youtubePlayer.getCurrentTime());

            const requestBody = {
                VideoId: window.location.href.substring(window.location.href.length - 11),
                Content: quoteText,
                At: quoteHappenedAt
            };

            // send it to the server
            this.submitQuoteButton.disabled = true;
            fetch(`/api/quotes`, { body: JSON.stringify(requestBody), method: 'POST', headers: { 'content-type': 'application/json' } })
                .then(response => {
                    if (response.ok) {
                        this.resetQuoteHeader();
                        this.submitQuotesTextarea.value = '';

                        if (this.submitQuotesExactTimeRadio.checked) {
                            this.submitQuotesSelectMinute.value = '-';
                            this.submitQuotesSelectSecond.value = '-';
                        }

                        this.buttonTimeoutInterval = setInterval(() => {
                            this.submitQuoteButton.innerText = `Quote Submitted! (Waiting ${this.buttonTimeoutNumber} seconds...)`;
                            this.buttonTimeoutNumber--;
                            if (this.buttonTimeoutNumber <= 0) {
                                this.submitQuoteButton.innerText = 'Submit Quote';
                                this.submitQuoteButton.disabled = false;
                                clearInterval(this.buttonTimeoutInterval);
                                this.buttonTimeoutInterval = undefined;
                            }
                        }, 1000);
                    }
                })
                .catch(e => {
                    console.warn(e);
                    this.replaceQuoteHeaderWithError('Could not submit the quote! Please try again! (click to dismiss)');
                    this.submitQuoteButton.innerText = 'Submit Quote';
                    this.submitQuoteButton.disabled = false;
                });
        });
    }

    private initializeSubmitEpisodeEvents(): void {
        // 'submit episode' events
        const yesItsOverButton = getSpecificElementById('yes-its-over-button', HTMLButtonElement);
        const trySubmitAgainButton = getSpecificElementById('try-again-button', HTMLButtonElement);

        const submitEpisode = (e: MouseEvent) => {
            if (e.target && e.target instanceof HTMLButtonElement) {
                e.preventDefault();
                e.target.disabled = true;
                e.stopPropagation();
                this.historyManager.Submit().then(response => {
                    if (response.ok) {
                        this.showUiElement('episode-submitted');
                    } else {
                        this.showSubmitEpisodeErrorMessage(response);
                        this.showUiElement('episode-submission-failed');
                    }
                    (e.target as HTMLButtonElement).disabled = false;
                });
            }
        };

        yesItsOverButton.addEventListener('click', submitEpisode);
        trySubmitAgainButton.addEventListener('click', submitEpisode);
    }

    private replaceQuoteHeaderWithError(message: string) {
        this.submitQuoteHeader.innerHTML = '';
        this.submitQuoteHeader.innerText = message;
        addClassIfNotExists(this.submitQuoteHeader, 'submit-quote-error');
    }

    private showUiElement(uiElementId: string): void {
        for (const container of this.uiElements) {
            if (container[1].id === uiElementId) {
                addClassIfNotExists(container[1], 'display-normal');
                removeClassIfExists(container[1], 'display-none');
            } else {
                removeClassIfExists(container[1], 'display-normal');
                addClassIfNotExists(container[1], 'display-none');
            }
        }
    }

    private storeUiElements(elementIds: Array<string>): void {
        for (const elementId of elementIds) {
            this.uiElements.set(elementId, loadDivElementById(elementId, this.wrapper));
        }
    }

    public showSubmitEpisodeErrorMessage(failureResponse: Response): void {
        if (failureResponse.ok) {
            return;
        } else {
            failureResponse.text().then(errorMessage => {
                const errorMessageSpan = <HTMLSpanElement>document.getElementById('submission-failed-error-message');
                errorMessageSpan.innerText = errorMessage;
            });
        }
    }

    private resetQuoteHeader(): void {
        this.submitQuoteHeader.innerHTML = '';
        removeClassIfExists(this.submitQuoteHeader, 'submit-quote-error');

        const quoteHeaderTextNode = document.createTextNode('Did NL say something interesting/funny? Submit a quote here: ');

        const counter = document.createElement('span');
        counter.id = 'quotes-textarea-counter';
        const textareaContentLength = this.submitQuotesTextarea.value.length;
        counter.innerText = `(${textareaContentLength.toString(10)}/300 characters)`;
        this.submitQuotesTextareaCounter = counter;

        this.submitQuoteHeader.appendChild(quoteHeaderTextNode);
        this.submitQuoteHeader.appendChild(counter);
    }
}


(() => {
    // initialize youtube player
    const youtubePlayer = new YoutubePlayer();
    console.log('youtube player created: ', youtubePlayer);

    // create object that handles all events that got selected by the user and saves them in a data structure
    const episodeHistoryManager = new EpisodeHistoryManager();

    // create a page handler that loads and stores all server-prerendered UI elements, handles navigation of the entire page
    // and sends information to the history manager as events get selected by the user
    new SubmitEpisodePageHandler(episodeHistoryManager);
})();


