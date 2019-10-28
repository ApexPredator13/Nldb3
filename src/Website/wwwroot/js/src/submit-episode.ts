import { addClassIfNotExists, removeClassIfExists, getSpecificElementById } from './lib/dom-operations';
import { GameplayEventType } from './enums/gameplay-event-type';
import { Boxes } from './components/boxes';
import { SearchBox } from './components/searchbox';
import { EpisodeHistoryManager } from './lib/episode-history-manager';
import { YoutubePlayer } from './components/youtube-player';
import { IsaacResource } from './interfaces/isaac-resource';
import { Subscription, merge } from 'rxjs';
import { ResourceType } from './enums/resource-type';

let episodeWasSubmitted = false;

class SubmitEpisodePageHandler {
    private loadedIsaacResources: Map<string, Array<IsaacResource>> = new Map<string, Array<IsaacResource>>();
    private uiContainer: HTMLDivElement;
    private uiHeader: HTMLHeadingElement;

    private selectedEnemy: string | undefined;
    private submitEpisodeErrormessage: string | undefined;

    // ui element container, main wrapper
    private historyManager: EpisodeHistoryManager;

    // quote button timeout variables
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

    // 'submit topic' html elements
    private submitTopicTextarea: HTMLTextAreaElement;
    private submitTopicButton: HTMLButtonElement;

    // 'change player' elements
    private changePlayerContainer: HTMLDivElement;
    private changePlayerButton: HTMLButtonElement;

    constructor(historyManager: EpisodeHistoryManager) {

        // make sure the correct UI gets rendered if things are deleted.
        historyManager.history.itemWasRemoved.subscribe(removedItem => {
            if (removedItem.Type !== undefined) {
                switch (removedItem.Type) {
                    case ResourceType.Curse:
                        this.renderWasTheFloorCursed();
                        break;
                    case ResourceType.Floor:
                        console.log('removed floor', removedItem);
                        console.log('removed floor is last floor?', historyManager.IsLastFloor(removedItem.FloorIndex));
                        if (historyManager.IsLastFloor(removedItem.FloorIndex)) {
                            this.renderWhatFloorAreWeOn();
                        }
                        break;
                    case ResourceType.Character:
                        if (historyManager.IsLastCharacter(removedItem.CharacterIndex)) {
                            this.renderWhatCharacterGotPlayed();
                        }
                        break;
                }
            }
            historyManager.RefreshCurrentValues();
        });

        // set default values
        this.buttonTimeoutNumber = 15;
        this.buttonTimeoutInterval = undefined;
        this.historyManager = historyManager;

        // get ui elements that are always gonna be used
        this.uiContainer = getSpecificElementById('ui-menus', HTMLDivElement);
        this.uiHeader = getSpecificElementById('ui-header', HTMLHeadingElement);

        // hardcoding main menu and game type objects so that the 'boxes component' can be reused for this one edge case
        this.loadedIsaacResources.set('events', [
            { id: 'collected-item', name: 'Item Collected', x: 70, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'touched-item', name: 'Item Touched', x: 595, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'bossfight', name: 'Bossfight', x: 140, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'trinket', name: 'Trinket Taken', x: 280, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'reroll', name: 'Character Reroll', x: 385, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'absorbed_item', name: 'Sucked Up Item', x: 350, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'enemy', name: 'Northernlion DIED', x: 35, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'won', name: 'Northernlion WON', x: 1155, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'down_to_the_next_floor', name: 'Down to the next floor!', x: 105, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('used', [
            { id: 'pill', name: 'Pill', x: 175, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'tarot', name: 'Tarot Card', x: 210, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'rune', name: 'Rune', x: 245, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'other', name: 'Other Consumable', x: 315, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('game-modes', [
            { id: '1', name: 'Normal Game', x: 840, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: '3', name: 'Greed Mode!', x: 875, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: '5', name: 'A Special Challenge', x: 910, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: '9', name: 'Community-Requested Challenge', x: 980, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: '6', name: 'A Special Seed', x: 945, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: '7', name: 'Something else', x: 1015, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('no-starting-items', [
            { id: 'none', name: 'No, continue!', x: 700, y: 0, w: 35, h: 35 } as IsaacResource,
        ]);
        this.loadedIsaacResources.set('no-starting-trinkets', [
            { id: 'none', name: 'No, continue!', x: 665, y: 0, w: 35, h: 35 } as IsaacResource,
        ]);
        this.loadedIsaacResources.set('more-starting-items', [
            { id: 'yes', name: 'Yes, there were more!', x: 595, y: 0, w: 30, h: 30 } as IsaacResource,
            { id: 'no', name: 'No, that was it!', x: 700, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('more-starting-trinkets', [
            { id: 'yes', name: 'Yes, there was another trinket!', x: 280, y: 0, w: 30, h: 30 } as IsaacResource,
            { id: 'no', name: 'No, that was it!', x: 665, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('common-bosses', []);
        this.loadedIsaacResources.set('common-floors', []);
        this.loadedIsaacResources.set('confirm-dead', [
            { id: 'yes', name: 'Yes, NL died!', x: 1050, y: 0, w: 35, h: 30 } as IsaacResource,
            { id: 'no', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('confirm-won', [
            { id: 'yes', name: 'Yes, NL won the run!', x: 1050, y: 0, w: 35, h: 30 } as IsaacResource,
            { id: 'no', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('another-run', [
            { id: 'run', name: 'Yes, another run!', x: 1120, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'victory-lap', name: 'Yes, a victory lap!', x: 1120, y: 0, w: 35, h: 35 } as IsaacResource,
            { id: 'end', name: 'No, the episode ended here!', x: 1050, y: 0, w: 35, h: 35 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('submit-run', [
            { id: 'submit-episode', name: 'Submit Episode!', x: 1050, y: 0, w: 30, h: 30 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('submit-failed', [
            { id: 'submit-episode', name: 'Submit Episode!', x: 1120, y: 0, w: 30, h: 30 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('run-submitted', [
            { id: 'run-submitted', name: 'View Results!', x: 735, y: 0, w: 30, h: 30 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('did-black-rune-absorb', [
            { id: 'no', name: 'It didn\'t absorb abything, move on!', x: 0, y: 0, w: 30, h: 30 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('did-black-rune-absorb-another', [
            { id: 'yes', name: 'Yes, more items were absorbed!', x: 0, y: 0, w: 30, h: 30 } as IsaacResource,
            { id: 'no', name: 'No, that was it!', x: 0, y: 0, w: 30, h: 30 } as IsaacResource
        ]);
        this.loadedIsaacResources.set('no-curse', [
            { id: 'NoCurse', name: 'No Curse!', x: 735, y: 0, w: 35, h: 35 } as IsaacResource
        ]);

        // get all elements that are relevant to the quotes section, then initialize all events
        this.submitQuotesTextarea = getSpecificElementById('quotes-textarea', HTMLTextAreaElement);
        this.submitQuotesTextareaCounter = getSpecificElementById('quotes-textarea-counter', HTMLSpanElement);
        this.submitQuotesExactTimeRadio = getSpecificElementById('exact-time', HTMLInputElement);
        this.submitQuotesCurrentVideoTimeRadio = getSpecificElementById('current-video-time', HTMLInputElement);
        this.submitQuotesSelectMinute = getSpecificElementById('select-minute', HTMLSelectElement);
        this.submitQuotesSelectSecond = getSpecificElementById('select-second', HTMLSelectElement);
        this.submitQuoteHeader = getSpecificElementById('submit-quote-header', HTMLParagraphElement);
        this.submitQuoteButton = getSpecificElementById('submit-quote-button', HTMLButtonElement);

        this.submitTopicButton = getSpecificElementById('submit-topic-button', HTMLButtonElement);
        this.submitTopicTextarea = getSpecificElementById('submit-topic-textarea', HTMLTextAreaElement);

        this.changePlayerButton = getSpecificElementById('current-player-button', HTMLButtonElement);
        this.changePlayerContainer = getSpecificElementById('current-player-container', HTMLDivElement);

        this.initializeQuotesSectionLogic();
        this.initializeTopicSectionLogic();
        this.initializeChangePlayerLogic();

        // ...then start displaying UI
        this.renderWhatCharacterGotPlayed();
    }

    private renderMainMenu(): void {
        this.setHeader('What happened?');
        let events = this.loadedIsaacResources.get('events');
        let usedConsumables = this.loadedIsaacResources.get('used');

        if (!events || !usedConsumables) {
            return;
        }

        const eventBoxes = new Boxes(this.uiContainer, events, true, '/img/gameplay_events.png');

        const middleParagraph = document.createElement('p');
        middleParagraph.innerText = 'what got used?';
        this.uiContainer.appendChild(middleParagraph);

        const usedBoxes = new Boxes(this.uiContainer, usedConsumables, false, '/img/gameplay_events.png');

        let sub = merge(
            eventBoxes.elementWasSelected,
            usedBoxes.elementWasSelected
        ).subscribe(selection => {
            this.unsubscribe(sub);
            this.removeEventListeners(eventBoxes, usedBoxes);

            switch (selection) {
                case 'collected-item':
                    this.renderWhereDidCollectedItemComeFrom();
                    break;
                case 'bossfight':
                    this.renderWhatBossfight();
                    break;
                case 'absorbed_item':
                    this.renderWhatAbsorber();
                    break;
                case 'touched-item':
                    this.renderWhereDidTouchedItemComeFrom();
                    break;
                case 'reroll':
                    this.renderHowWasCharacterRerolled();
                    break;
                case 'enemy':
                    this.renderHowDidNlDie();
                    break;
                case 'pill':
                    this.renderSelectPill();
                    break;
                case 'trinket':
                    this.renderSelectTrinket();
                    break;
                case 'tarot':
                    this.renderSelectTarotCard();
                    break;
                case 'rune':
                    this.renderSelectRune();
                    break;
                case 'other':
                    this.renderOtherConsumable();
                    break;
                case 'down_to_the_next_floor':
                    this.renderWhatFloorAreWeOn();
                    break;
                case 'won':
                    this.renderConfirmWon();
                    break;
            }
        });
    }

    private renderWhatCharacterGotPlayed(): void {
        this.setHeader('What character was chosen?');
        const data = this.getIsaacResources('characters', '/api/resources/?ResourceType=2');

        const characterBoxes = new Boxes(this.uiContainer, data, true);

        const sub = characterBoxes.elementWasSelected.subscribe(selectedCharacter => {
            this.unsubscribe(sub);
            this.removeEventListeners(characterBoxes);

            this.historyManager.AddCharacter(selectedCharacter);
            this.renderWhatGameModeWasChosen();
        });
    }

    private renderWhatGameModeWasChosen(): void {
        this.setHeader('How did Northernlion play the game?');
        const data = this.getIsaacResources('game-modes', '');

        const gameModeBoxes = new Boxes(this.uiContainer, data, true, '/img/gameplay_events.png');

        const sub = gameModeBoxes.elementWasSelected.subscribe(selectedGameMode => {
            this.unsubscribe(sub);
            this.removeEventListeners(gameModeBoxes);

            this.historyManager.AddGameModeToCharacter(selectedGameMode);
            this.renderWhatFloorDidWeStartOn();
        });
    }

    private renderWhatFloorDidWeStartOn(): void {
        this.setHeader('What floor did the run start on?');
        const data = this.getIsaacResources('floors', '/api/resources/?ResourceType=5');

        const floorBoxes = new Boxes(this.uiContainer, data, true, undefined, undefined, ['BasementOne', 'CellarOne', 'BurningBasementOne', 'GreedModeBasement']);
        const floorSelection = new SearchBox(this.uiContainer, data, false);

        const sub = merge(
            floorBoxes.elementWasSelected,
            floorSelection.elementWasSelected
        ).subscribe(selectedFloor => {
            this.unsubscribe(sub);
            this.removeEventListeners(floorBoxes, floorSelection);
            this.loadCommonBossesForFloor(selectedFloor);
            this.loadNextFloorset(selectedFloor);
            this.historyManager.AddFloorToCharacter(selectedFloor);
            this.renderWasTheFloorCursed();
        });
    }

    private renderWasTheFloorCursed(): void {
        this.setHeader('Was the floor cursed?');
        const data = this.getIsaacResources('curses', '/api/resources/?ResourceType=3');
        const noCurseData = this.getIsaacResources('no-curse', '');

        const curseBoxes = new Boxes(this.uiContainer, noCurseData, true, '/img/gameplay_events.png', undefined, ['NoCurse']);
        const curseSearchbox = new SearchBox(this.uiContainer, data, false);

        const sub = merge(
            curseBoxes.elementWasSelected,
            curseSearchbox.elementWasSelected
        ).subscribe(selectedCurse => {
            this.unsubscribe(sub);
            this.removeEventListeners(curseBoxes, curseSearchbox);

            if (selectedCurse !== 'NoCurse') {
                this.historyManager.AddGameplayEvent(selectedCurse, GameplayEventType.Curse, 1);
            }

            if (!this.historyManager.CharacterHasSeed()) {
                this.renderSeed();
            } else {
                this.renderMainMenu();
            }
        });
    }

    private renderDidCharacterStartWithItems() {
        this.setHeader('Did the character start with any items?');
        const noItemsData = this.getIsaacResources('no-starting-items', '');
        const data = this.getIsaacResources('items', '/api/resources/?ResourceType=6');

        const noItemsSkip = new Boxes(this.uiContainer, noItemsData, true, '/img/gameplay_events.png');
        const itemSearchBox = new SearchBox(this.uiContainer, data, false);

        const sub = merge(
            itemSearchBox.elementWasSelected,
            noItemsSkip.elementWasSelected
        ).subscribe(selectedStartingItem => {
            this.unsubscribe(sub);
            this.removeEventListeners(itemSearchBox);

            if (selectedStartingItem === 'none') {
                this.renderDidCharacterStartWithTrinkets();
            } else {
                this.historyManager.AddGameplayEvent(selectedStartingItem, GameplayEventType.ItemCollected, 1);
                this.historyManager.AddGameplayEvent('StartingItem', GameplayEventType.ItemCollected, 2);
                this.renderWereThereMoreStartingItems();
            }
        });
    }

    private renderWereThereMoreStartingItems() {
        this.setHeader('Did the character have another starting item?');
        const data = this.getIsaacResources('more-starting-items', '');

        const moreStartingItemBoxes = new Boxes(this.uiContainer, data, true, '/img/gameplay_events.png');

        const sub = moreStartingItemBoxes.elementWasSelected.subscribe(selection => {
            this.unsubscribe(sub);
            this.removeEventListeners(moreStartingItemBoxes);
            if (selection === 'yes') {
                this.renderDidCharacterStartWithItems();
            } else {
                this.renderDidCharacterStartWithTrinkets();
            }
        });
    }

    private renderDidCharacterStartWithTrinkets() {
        this.setHeader('Did the character start with a trinket?');
        const dataNoTrinket = this.getIsaacResources('no-starting-trinkets', '');
        const data = this.getIsaacResources('trinkets', '/api/resources/?ResourceType=13');

        const noTrinketsSkip = new Boxes(this.uiContainer, dataNoTrinket, true, '/img/gameplay_events.png');
        const trinketSearchBox = new SearchBox(this.uiContainer, data, false);

        const sub = merge(
            noTrinketsSkip.elementWasSelected,
            trinketSearchBox.elementWasSelected
        ).subscribe(selectedStartingTrinket => {
            this.unsubscribe(sub);
            this.removeEventListeners(noTrinketsSkip, trinketSearchBox);

            if (selectedStartingTrinket === 'none') {
                this.renderMainMenu();
            } else {
                this.renderDidCharacterStartWithMoreTrinkets();
            }
        });
    }

    private renderDidCharacterStartWithMoreTrinkets() {
        this.setHeader('Did the character start with another trinket?');
        const data = this.getIsaacResources('more-starting-trinkets', '');
        // 'none'

        const boxes = new Boxes(this.uiContainer, data, true, '/img/gameplay_events.png');

        const sub = boxes.elementWasSelected.subscribe(result => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);

            if (result === 'yes') {
                this.renderDidCharacterStartWithTrinkets();
            } else {
                this.renderMainMenu();
            }
        });
    }

    private renderWhereDidCollectedItemComeFrom(): void {
        this.setHeader('Where did the item come from?');
        const data = this.getIsaacResources('item-sources', '/api/resources/?ResourceType=7');

        const itemSourceBoxes = new Boxes(this.uiContainer, data, true, undefined, 10);
        const itemSourceSearchbox = new SearchBox(this.uiContainer, data, false);

        const sub = merge(
            itemSourceBoxes.elementWasSelected,
            itemSourceSearchbox.elementWasSelected
        ).subscribe(selectedItemsource => {
            this.unsubscribe(sub);
            this.removeEventListeners(itemSourceBoxes, itemSourceSearchbox);
            this.historyManager.AddGameplayEvent(selectedItemsource, GameplayEventType.ItemCollected, 2);
            this.renderWhatItemWasCollected();
        });
    }

    private renderWhatItemWasCollected(): void {
        this.setHeader('What item was collected?');
        const data = this.getIsaacResources('items', '/api/resources/?ResourceType=6');

        const itemSearchbox = new SearchBox(this.uiContainer, data, true);
        const sub = itemSearchbox.elementWasSelected.subscribe(selectedItem => {
            this.unsubscribe(sub);
            this.removeEventListeners(itemSearchbox);
            this.historyManager.AddGameplayEvent(selectedItem, GameplayEventType.ItemCollected, 1);
            this.renderMainMenu();
        });
    }

    private loadCommonBossesForFloor(floorId: string) {
        fetch(`/api/resources/effect/?name=AppearsOn${floorId}`)
            .then(response => response.json())
            .then((commenBossesForFloor: Array<IsaacResource>) => this.loadedIsaacResources.set('common-bosses', commenBossesForFloor.filter(b => b.name.toLowerCase().indexOf('double') === -1)))
            .catch(() => this.loadedIsaacResources.set('common-bosses', []));
    }

    private loadNextFloorset(floorId: string) {
        fetch(`/api/resources/next-floorset/${floorId}`)
            .then(response => response.json())
            .then((nextFloors: Array<IsaacResource>) => this.loadedIsaacResources.set('common-floors', nextFloors.filter(f => f.id.toLowerCase().indexOf('xl') === -1)));
    }

    private renderWhatBossfight(): void {
        this.setHeader('What boss did NL fight?');
        const commonBosses = this.getIsaacResources('common-bosses', '');
        const allBosses = this.getIsaacResources('bosses', '/api/resources/?ResourceType=1');

        const boxes = new Boxes(this.uiContainer, commonBosses, true);
        const searchBox = new SearchBox(this.uiContainer, allBosses, false);

        const sub = merge(
            boxes.elementWasSelected,
            searchBox.elementWasSelected
        ).subscribe(selectedBoss => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes, searchBox);
            this.historyManager.AddGameplayEvent(selectedBoss, GameplayEventType.Bossfight, 1);
            this.renderMainMenu();
        });
    }

    private renderWhatAbsorber(): void {
        this.setHeader('What did Northernlion use to absorb the item?');
        const absorbers = this.getIsaacResources('absorbers', '/api/resources/?RequiredTags=149');

        const boxes = new Boxes(this.uiContainer, absorbers, true);

        const sub = boxes.elementWasSelected.subscribe(selectedAbsorber => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);
            if (selectedAbsorber === 'BlackRune') {
                this.historyManager.AddGameplayEvent(selectedAbsorber, GameplayEventType.Rune, 1);
            }
            this.historyManager.AddGameplayEvent(selectedAbsorber, GameplayEventType.AbsorbedItem, 2);
            this.renderWhichItemWasAbsorbed();
        });
    }

    private renderWhichItemWasAbsorbed(): void {
        this.setHeader('Which item was absorbed?');
        const items = this.getIsaacResources('items', '/api/resources/?ResourceType=6');

        const searchBox = new SearchBox(this.uiContainer, items, true);

        const sub = searchBox.elementWasSelected.subscribe(selectedItem => {
            this.unsubscribe(sub);
            this.removeEventListeners(searchBox);
            this.historyManager.AddGameplayEvent(selectedItem, GameplayEventType.AbsorbedItem, 1);
            this.renderMainMenu();
        });
    }

    private renderWhereDidTouchedItemComeFrom(): void {
        this.setHeader('Where did the item come from that Northernlion touched?');
        const itemSources = this.getIsaacResources('item-sources', '/api/resources/?ResourceType=7');

        const itemSourceBoxes = new Boxes(this.uiContainer, itemSources, true, undefined, 10);
        const itemSourceSearchbox = new SearchBox(this.uiContainer, itemSources, false);

        const sub = merge(
            itemSourceBoxes.elementWasSelected,
            itemSourceSearchbox.elementWasSelected
        ).subscribe(selectedItemsource => {
            this.unsubscribe(sub);
            this.removeEventListeners(itemSourceBoxes, itemSourceSearchbox);
            this.historyManager.AddGameplayEvent(selectedItemsource, GameplayEventType.ItemTouched, 2);
            this.renderWhichItemWasTouched();
        });
    }

    private renderWhichItemWasTouched(): void {
        this.setHeader('Which item was touched?');
        const items = this.getIsaacResources('spacebar_items', '/api/resources/?ResourceType=6&RequiredTags=140');

        const searchBox = new SearchBox(this.uiContainer, items, true);

        const sub = searchBox.elementWasSelected.subscribe(selectedItem => {
            this.unsubscribe(sub);
            this.removeEventListeners(searchBox);
            this.historyManager.AddGameplayEvent(selectedItem, GameplayEventType.ItemTouched, 1);
            this.renderMainMenu();
        });
    }

    private renderHowDidNlDie(): void {
        this.setHeader('What killed NL? :(');
        const enemies = this.getIsaacResources('emenies', '/api/resources/?ResourceType=11');

        const searchBox = new SearchBox(this.uiContainer, enemies, true);

        const sub = searchBox.elementWasSelected.subscribe(selectedEnemy => {
            this.unsubscribe(sub);
            this.removeEventListeners(searchBox);
            this.selectedEnemy = selectedEnemy;
            this.renderConfirmNlDied();
        });
    }

    private renderConfirmNlDied(): void {
        if (!this.selectedEnemy) {
            return;
        }

        this.setHeader(`Please Confirm: Northernlion was killed by: ${this.selectedEnemy}`);
        const dead = this.getIsaacResources('confirm-dead', '');
        const boxes = new Boxes(this.uiContainer, dead, true, '/img/gameplay_events.png');

        const sub = boxes.elementWasSelected.subscribe(choice => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);

            if (choice === 'yes' && this.selectedEnemy) {
                this.historyManager.AddGameplayEvent(this.selectedEnemy, GameplayEventType.CharacterDied, 1)
                this.renderDidNlDoAnotherRun();
            } else {
                this.renderMainMenu();
            }
        });
    }

    private renderConfirmWon(): void {
        this.setHeader(`Please Confirm: Northernlion won the run?`);
        const won = this.getIsaacResources('confirm-won', '');
        const boxes = new Boxes(this.uiContainer, won, true, '/img/gameplay_events.png');

        const sub = boxes.elementWasSelected.subscribe(choice => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);

            if (choice === 'yes') {
                this.renderDidNlDoAnotherRun();
            } else {
                this.renderMainMenu();
            }
        });
    }

    private renderDidNlDoAnotherRun(): void {
        this.setHeader('The run ended. Did NL do another run?');
        const choices = this.getIsaacResources('another-run', '');
        const boxes = new Boxes(this.uiContainer, choices, true, '/img/gameplay_events.png');
        const sub = boxes.elementWasSelected.subscribe(choice => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);

            switch (choice) {
                case 'run':
                    this.renderWhatCharacterGotPlayed();
                    break;
                case 'victory-lap':
                    this.renderWhatFloorAreWeOn();
                    break;
                case 'end':
                    this.renderSubmitEpisode();
                    break;
            }
        });
    }

    private renderHowWasCharacterRerolled(): void {
        this.setHeader('How was the character rerolled?');
        const rerolls = this.getIsaacResources('rerolls', '/api/resources/?ResourceType=14');

        const boxes = new Boxes(this.uiContainer, rerolls, true);

        const sub = boxes.elementWasSelected.subscribe(selectedReroll => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);
            this.historyManager.AddGameplayEvent(selectedReroll, GameplayEventType.CharacterReroll, 1);
            this.renderMainMenu();
        });
    }

    private renderWhatFloorAreWeOn(): void {
        this.setHeader('What floor was next?');
        const commonFloors = this.getIsaacResources('common-floors', '');
        const allFloors = this.getIsaacResources('floors', '/api/resources/?ResourceType=5');

        const boxes = new Boxes(this.uiContainer, commonFloors, true);
        const searchBox = new SearchBox(this.uiContainer, allFloors, false);

        const sub = merge(
            boxes.elementWasSelected,
            searchBox.elementWasSelected
        ).subscribe(selectedFloor => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes, searchBox);
            this.loadCommonBossesForFloor(selectedFloor);
            this.loadNextFloorset(selectedFloor);
            this.historyManager.AddFloorToCharacter(selectedFloor);
            this.renderWasTheFloorCursed();
        });
    }

    private renderSeed(): void {
        this.setHeader('Did Northernlion show the SEED?');

        const submitSeedButton = document.createElement('button');
        submitSeedButton.innerText = 'Yes, use this seed';
        submitSeedButton.disabled = true;

        const skipSeedButton = document.createElement('button');
        skipSeedButton.innerText = 'No, Skip!';

        const input1 = document.createElement('input');
        const input2 = document.createElement('input');
        input1.type = 'text';
        input2.type = 'text';
        input1.maxLength = 4;
        input2.maxLength = 4;
        input1.size = 4;
        input2.size = 4;

        const inputEventListener = () => {
            const input1Value = input1.value;
            const input2Value = input2.value;

            if ((input1Value.length === 4 && input2Value.length === 4) && (input1Value.indexOf(' ') === -1 && input2Value.indexOf(' ') === -1)) {
                submitSeedButton.disabled = false;
            } else {
                submitSeedButton.disabled = true;
            }
        };

        input1.addEventListener('input', inputEventListener);
        input2.addEventListener('input', inputEventListener);

        submitSeedButton.addEventListener('click', () => {
            const seed = input1.value + input2.value;
            if (seed.length != 8) {
                return;
            }

            this.historyManager.AddSeedToCharacter(seed);
            if (this.historyManager.CharacterIsOnFirstFloor()) {
                this.renderDidCharacterStartWithItems()
            } else {
                this.renderMainMenu();
            }
        });

        skipSeedButton.addEventListener('click', () => {
            this.historyManager.AddSeedToCharacter(null);
            if (this.historyManager.CharacterIsOnFirstFloor()) {
                this.renderDidCharacterStartWithItems()
            } else {
                this.renderMainMenu();
            }
        });

        const inputDiv = document.createElement('div');
        inputDiv.appendChild(input1);
        inputDiv.appendChild(input2);

        const buttonDiv = document.createElement('div');
        buttonDiv.appendChild(submitSeedButton);
        buttonDiv.appendChild(skipSeedButton);

        this.uiContainer.innerHTML = '';
        this.uiContainer.appendChild(inputDiv);
        this.uiContainer.appendChild(buttonDiv);
    }

    private renderSubmitEpisode(): void {
        this.setHeader('Thank you very much for contributing! Please Click this button to submit the episode:');
        const choice = this.getIsaacResources('submit-run', '');

        const boxes = new Boxes(this.uiContainer, choice, true, '/img/gameplay_events.png');

        const sub = boxes.elementWasSelected.subscribe(choice => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);
            if (choice === 'submit-episode') {
                this.renderCurrentlySubmitting();
            }
        });
    }

    private renderCurrentlySubmitting(): void {
        this.setHeader('Saving episode, please wait...');
        this.uiContainer.innerHTML = '';
        this.historyManager.Submit().then(response => {
            if (response.ok) {
                this.renderEpisodeSubmitted();
                episodeWasSubmitted = true;
            } else {
                response.text().then(response => {
                    this.submitEpisodeErrormessage = response;
                    this.renderEpisodeSubmissionFailed();
                });
            }
        }).catch((errorResponse: Response) => {
            errorResponse.text().then(response => {
                this.submitEpisodeErrormessage = response;
                this.renderEpisodeSubmissionFailed();
            });
        });
    }

    private renderEpisodeSubmitted(): void {
        this.setHeader('Episode Submitted! Click the button below to see the results!');
        const choice = this.getIsaacResources('run-submitted', '');

        const boxes = new Boxes(this.uiContainer, choice, true, '/img/gameplay_events.png');

        const sub = boxes.elementWasSelected.subscribe(choice => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);
            if (choice === 'run-submitted') {
                window.location.href = `/video/${window.location.href.substring(window.location.href.length - 11)}`;
            }
        });
    }

    private renderEpisodeSubmissionFailed(): void {
        this.setHeader(`The episode could not be saved correctly. :( Error message: ${this.submitEpisodeErrormessage}`);
        const choice = this.getIsaacResources('submit-episode', '');

        const boxes = new Boxes(this.uiContainer, choice, true, '/img/gameplay_events.png');

        const sub = boxes.elementWasSelected.subscribe(choice => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);
            if (choice === 'submit-episode') {
                this.renderCurrentlySubmitting();
            }
        });
    }

    private renderSelectPill(): void {
        this.setHeader('What pill was used?');
        const pills = this.getIsaacResources('pills', '/api/resources/?ResourceType=8');

        const searchBox = new SearchBox(this.uiContainer, pills, true);

        const sub = searchBox.elementWasSelected.subscribe(selectedPill => {
            this.unsubscribe(sub);
            this.removeEventListeners(searchBox);
            this.historyManager.AddGameplayEvent(selectedPill, GameplayEventType.Pill, 1);
            this.renderMainMenu();
        });
    }

    private renderSelectTrinket(): void {
        this.setHeader('What trinket did NL take?');
        const trinkets = this.getIsaacResources('trinkets', '/api/resources/?ResourceType=13');

        const searchBox = new SearchBox(this.uiContainer, trinkets, true);

        const sub = searchBox.elementWasSelected.subscribe(selectedTrinket => {
            this.unsubscribe(sub);
            this.removeEventListeners(searchBox);
            this.historyManager.AddGameplayEvent(selectedTrinket, GameplayEventType.Trinket, 1);
            this.renderMainMenu();
        });
    }

    private renderSelectTarotCard(): void {
        this.setHeader('Which tarot card was used?');
        const cards = this.getIsaacResources('tarot-cards', '/api/resources/?ResourceType=10');

        const searchBox = new SearchBox(this.uiContainer, cards, true);

        const sub = searchBox.elementWasSelected.subscribe(selectedCard => {
            this.unsubscribe(sub);
            this.removeEventListeners(searchBox);
            this.historyManager.AddGameplayEvent(selectedCard, GameplayEventType.TarotCard, 1);
            this.renderMainMenu();
        });
    }

    private renderSelectRune(): void {
        this.setHeader('Which rune was used?');
        const runes = this.getIsaacResources('runes', '/api/resources/?ResourceType=9');

        const searchBox = new SearchBox(this.uiContainer, runes, true);

        const sub = searchBox.elementWasSelected.subscribe(selectedRune => {
            this.unsubscribe(sub);
            this.removeEventListeners(searchBox);
            this.historyManager.AddGameplayEvent(selectedRune, GameplayEventType.Rune, 1);

            if (selectedRune !== 'BlackRune') {
                this.renderMainMenu();
            } else {
                this.renderDidBlackRuneAbsorbAnything()
            }
        });
    }

    private renderDidBlackRuneAbsorbAnything(): void {
        this.setHeader('Which item did the black rune absorb?');
        const choice = this.getIsaacResources('did-black-rune-absorb', '');
        const items = this.getIsaacResources('items', '/api/resources/?ResourceType=6');

        const boxes = new Boxes(this.uiContainer, choice, true);
        const searchBox = new SearchBox(this.uiContainer, items, false);

        const sub = merge(
            boxes.elementWasSelected,
            searchBox.elementWasSelected
        ).subscribe(absorbedItem => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes, searchBox);
            this.historyManager.AddGameplayEvent('BlackRune', GameplayEventType.AbsorbedItem, 2);
            this.historyManager.AddGameplayEvent(absorbedItem, GameplayEventType.AbsorbedItem, 1);
            this.renderDidBlackRuneAbsorbAnotherThing();
        });
    }

    private renderDidBlackRuneAbsorbAnotherThing(): void {
        this.setHeader('Did the black rune absorb another item?');
        const choices = this.getIsaacResources('did-black-rune-absorb-another', '');

        const boxes = new Boxes(this.uiContainer, choices, true);

        const sub = boxes.elementWasSelected.subscribe(choice => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);
            if (choice === 'yes') {
                this.renderDidBlackRuneAbsorbAnything();
            } else {
                this.renderMainMenu();
            }
        });
    }

    private renderOtherConsumable(): void {
        this.setHeader('What consumable was used?');
        const consumables = this.getIsaacResources('other-consumables', '/api/resources/?ResourceType=15');

        const boxes = new Boxes(this.uiContainer, consumables, true);

        const sub = boxes.elementWasSelected.subscribe(selectedConsumable => {
            this.unsubscribe(sub);
            this.removeEventListeners(boxes);
            this.historyManager.AddGameplayEvent(selectedConsumable, GameplayEventType.OtherConsumable, 1);
            this.renderMainMenu();
        });
    }


    private initializeChangePlayerLogic() {
        this.changePlayerButton.addEventListener('click', () => {
            const buttonText = this.changePlayerButton.innerText;
            if (buttonText === '1') {
                this.changePlayerButton.innerText = '2';
                addClassIfNotExists(this.changePlayerButton, 'btn-red');
                addClassIfNotExists(this.changePlayerContainer, 'change-player-container-modifier');
                this.historyManager.ChangeCurrentPlayer(2);
            } else {
                this.changePlayerButton.innerText = '1';
                removeClassIfExists(this.changePlayerButton, 'btn-red');
                removeClassIfExists(this.changePlayerContainer, 'change-player-container-modifier');
                this.historyManager.ChangeCurrentPlayer(1);
            }
        });
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

    private initializeTopicSectionLogic(): void {
        this.submitTopicButton.addEventListener('click', () => {
            if (this.submitTopicTextarea.value.length > 3) {
                const request: RequestInit = {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        video_id: window.location.href.substring(window.location.href.length - 11),
                        topic: this.submitTopicTextarea.value
                    })
                };

                this.submitTopicButton.disabled = true;
                fetch('/api/topics', request).then(response => {
                    this.submitTopicTextarea.value = '';
                    if (response.ok) {
                        this.submitTopicButton.innerText = 'Saved! Thanks!';
                        setTimeout(() => {
                            this.submitTopicButton.disabled = false;
                            this.submitTopicButton.innerText = 'Submit';
                        }, 5000);
                    } else {
                        this.submitTopicButton.disabled = false;
                    }
                });
            }
        });
    }

    private replaceQuoteHeaderWithError(message: string) {
        this.submitQuoteHeader.innerHTML = '';
        this.submitQuoteHeader.innerText = message;
        addClassIfNotExists(this.submitQuoteHeader, 'submit-quote-error');
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

    private unsubscribe(subscription: Subscription | undefined) {
        if (subscription && !subscription.closed) {
            subscription.unsubscribe();
        }
    }

    private saveResourcesIfNecessary(key: string, data: Array<IsaacResource> | Promise<Array<IsaacResource>>) {
        if (data instanceof Promise && !this.loadedIsaacResources.has(key)) {
            data.then(resources => this.loadedIsaacResources.set(key, resources));
        }
    }

    private removeEventListeners(...components: Array<Boxes | SearchBox>) {
        for (let i = 0; i < components.length; i++) {
            components[i].removeEventListeners();
        }
    }

    private getIsaacResources(key: string, requestUrl: string): Array<IsaacResource> | Promise<Array<IsaacResource>> {
        const resources =  this.loadedIsaacResources.has(key)
            ? this.loadedIsaacResources.get(key) as Array<IsaacResource>
            : fetch(requestUrl).then(response => response.json());

        if (resources instanceof Promise) {
            this.saveResourcesIfNecessary(key, resources);
        }

        return resources;
    }

    private setHeader(text: string) {
        this.uiHeader.innerText = text;
    }
}


(() => {
    // warn before window closes
    window.addEventListener('beforeunload', e => {
        if (!episodeWasSubmitted) {
            const ok = confirm('WARNING! Leaving this page before submitting will DELETE your progress. Are you sure you want to leave?');
            if (!ok) {
                e.preventDefault();
                e.returnValue = '';
            }
        }
    });

    // initialize youtube player
    const youtubePlayer = new YoutubePlayer();
    console.log('youtube player created: ', youtubePlayer);

    // create object that handles all events that got selected by the user and saves them in a data structure
    const episodeHistoryManager = new EpisodeHistoryManager();

    // create a page handler that handles navigation of the entire page
    // and sends information to the history manager as things get selected by the user
    new SubmitEpisodePageHandler(episodeHistoryManager);
})();


