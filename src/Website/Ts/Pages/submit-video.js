import { HistoryTable, removeHistoryElement } from "../Components/SubmitVideo/history-table";
import { WhatCharacterWasChosen } from "../Components/SubmitVideo/m-what-character-was-chosen";
import { WhatGameModeWasChosen } from "../Components/SubmitVideo/m-what-game-mode-was-played";
import { SubmitQuote } from "../Components/SubmitVideo/submit-quote";
import { SubmitTopic } from "../Components/SubmitVideo/submit-topic";
import { YoutubePlayer } from "../Components/SubmitVideo/youtube-player";
import { GameMode } from "../Enums/game-mode";
import { ResourceType } from "../Enums/resource-type";
import { addClassIfNotExists, removeClassIfExists } from "../Framework/browser";
import { getConfig } from "../Framework/Customizable/config.development";
import { get } from "../Framework/http";
import { A, Component, EventType, FrameworkElement, render, Render, Div, id, div, a, iframe, attr, span, t, P, event, h2, H2, cl, hr, Hr, style } from "../Framework/renderer";
import { PageData, registerPage, setTitle } from "../Framework/router";
import { SubmittedPlayedCharacter } from "../Models/submitted-played-character";
import { SubmittedPlayedFloor } from "../Models/submitted-played-floor";
import { Tag } from "../Enums/tags";
import { WhatFloorAreWeOn } from "../Components/SubmitVideo/m-what-floor-are-we-on";
import { SubmittedGameplayEvent } from "../Models/submitted-gameplay-event";
import { WasTheFloorCursed } from "../Components/SubmitVideo/m-was-the-floor-cursed";
import { GameplayEventType } from "../Enums/gameplay-event-type";
import { DidNlShowTheSeed } from "../Components/SubmitVideo/m-did-nl-show-the-seed";
import { MainSelectScreen } from "../Components/SubmitVideo/m-main-select-screen";
import { WhereDidTheItemComeFrom } from "../Components/SubmitVideo/m-where-did-the-item-come-from";
import { WhatItemWasCollected } from "../Components/SubmitVideo/m-what-item-was-collected";
import { HowWasTheItemAbsorbed } from "../Components/SubmitVideo/m-how-was-the-item-absorbed";
import { WhatBossWasFought } from "../Components/SubmitVideo/m-what-boss-was-fought";
import { SelectWhatTrinketWasTaken } from "../Components/SubmitVideo/m-select-what-trinket-was-taken";
import { SelectHowWasTheCharacterRerolled } from "../Components/SubmitVideo/m-select-how-was-the-character-rerolled";
import { SelectWhatKilledNl } from "../Components/SubmitVideo/m-select-what-killed-nl";
import { ConfirmNlDied } from "../Components/SubmitVideo/m-confirm-nl-died";
import { DidNlDoAnotherRun } from "../Components/SubmitVideo/m-did-nl-do-another-run";
import { ConfirmNlDidAVictoryLap } from "../Components/SubmitVideo/m-confirm-nl-did-a-victory-lap";
import { ConfirmTheRunEnded } from "../Components/SubmitVideo/m-confirm-the-run-ended";
import { ConfirmSubmitEpisode } from "../Components/SubmitVideo/m-confirm-submit-episode";
import { SubmissionSucceeded } from "../Components/SubmitVideo/SubmissionSucceeded";
import { ConfirmNlWon } from "../Components/SubmitVideo/m-confirm-nl-won";
import { ConfirmDidNlDoAnotherRun } from "../Components/SubmitVideo/m-confirm-did-nl-do-another-run";
import { WasThereAStartingItem } from "../Components/SubmitVideo/m-was-there-a-starting-item";
import { WasThereAnotherStartingItem } from "../Components/SubmitVideo/m-was-there-another-starting-item";
import { WasThereAStartingTrinket } from "../Components/SubmitVideo/m-was-there-a-starting-trinket";
import { WasThereAnotherStartingTrinket } from "../Components/SubmitVideo/m-was-there-another-starting-trinket";
import { WhatPillWasTaken } from "../Components/SubmitVideo/m-what-pill-was-taken";
import { WhatTarotCardWasUsed } from "../Components/SubmitVideo/m-what-tarot-card-was-used";
import { WhatRuneWasUsed } from "../Components/SubmitVideo/m-what-rune-was-used";
import { DidBlackRuneAbsorbAnItem } from "../Components/SubmitVideo/m-did-black-rune-absorb-an-item";
import { WhatOtherConsumableWasUsed } from "../Components/SubmitVideo/m-what-other-consumable-was-used";
import * as Driver from 'driver.js';
import { WhatOtherEventHappened } from "../Components/SubmitVideo/m-what-other-event-happened";
import { HowDidNlRerollHisCharacter } from "../Components/SubmitVideo/m-how-did-nl-reroll-his-character";
import { WhatTransformationDidNlRerollInto } from "../Components/SubmitVideo/m-what-transformation-did-nl-reroll-into";
import { WhatCharacterDidNlChangeInto } from "../Components/SubmitVideo/m-what-character-did-nl-change-into";
import { PlayerControls } from "../Components/SubmitVideo/player-controls";
import { CurrentPlayer } from "../Components/SubmitVideo/current-player";
import { ChangeSeed } from "../Components/SubmitVideo/change-seed";
import '../Framework/Customizable/typedefs';
import { Boxes } from "../Components/General/renderBoxes";

const MAJOR_GAMEPLAY_EVENTS = 1;
const USED_CONSUMABLES = 2;
const GAME_MODES = 3;
const NO_STARTING_ITEMS = 4;
const NO_STARTING_TRINKETS = 5;
const MORE_STARTING_ITEMS = 6;
const MORE_STARTING_TRINKETS = 7;
const CONFIRM_NL_DIED = 8;
const CONFIRM_NL_WON = 9;
const COMMON_BOSSES = 10;
const NEXT_FLOORSET = 11;
const WAS_THERE_ANOTHER_RUN = 12;
const SUBMIT_FAILED = 13;
const RUN_SUBMITTED_SUCCESSFULLY = 14;
const DID_BLACK_RUN_ABSORB_AN_ITEM = 15;
const NO_CURSE = 16;
const CONFIRM_VICTORY_LAP = 17;
const CONFIRM_RUN_ENDED = 18;
const CONFIRM_ANOTHER_RUN = 19;
const DID_BLACK_RUN_ABSORB_ANOTHER_ITEM = 20;


//const beforeUnloadEvent = e => {
//    e.preventDefault();
//    e.returnValue = '';
//}


/**
 * the 'Submit Video' page
 * 
 * @constructor
 * @param {string[]} parameters - route parameters. parameters[0] is the youtube video ID
 */
export function SubmitVideoPage(parameters) {

    /** @type {string} */
    this.loading = 'loading resources...';

    /** @type {boolean} */
    this.highlightTutorial = true;

    /** @type {string} */
    this.videoId = parameters[0];

    /** @type {number} */
    this.playerOneOrTwo = 1;

    /** @type {boolean} */
    this.wasRerolled = false;

    /** @type {Map<string,IsaacResource[]>} */
    this.storedServerResources = new Map();

    /** @type {Map<number,IsaacResource[]>} */
    this.staticResources = new Map();

    /** @type {YoutubePlayer} */
    this.youtubePlayer = new YoutubePlayer(this.videoId);

    /** @type {string} */
    this.historyTableContainerId = 'history-table-container-xx';

    /** @type {string} */
    this.quotesAndTopicsContainerId = 'quotes-and-topic-wrapper';

    /** @type {string} */
    this.playerAndSeedContainerId = 'player-and-seed-container';

    /** @type {string} */
    this.menuContainerId = 'menu-container';

    /** @type {string|null} */
    this.tempValue = null;
    
    // renders initial page
    const origin = getConfig().baseUrlWithoutTrailingSlash;
    new Render([
        Div(
            id('menu-wrapper'),

            div(
                id('left-column'),

                div(
                    id('youtube-player-container'),

                    iframe(
                        attr({
                            id: 'ytplayer',
                            src: `https://www.youtube.com/embed/${this.videoId}?enablejsapi=1&origin=${origin}&rel=0&autoplay=0`,
                            frameborder: '0'
                        })
                    )
                ),
                div(
                    id(this.quotesAndTopicsContainerId),
                )
            ),
            div(
                id('right-column'),

                div(
                    id(this.playerAndSeedContainerId)
                ),
                div(
                    id(this.menuContainerId)
                )
            )
        )
    ]);

    /** @type {YoutubePlayer} */
    this.youtubePlayer = new YoutubePlayer(this.videoId);

    /** @type {HistoryTable} */
    this.history = new HistoryTable(this, this.videoId, this.historyTableContainerId, this.youtubePlayer, this.itemWasRemovedFromHistory);

    /** @type {PlayerControls} */
    this.playerControls = new PlayerControls(this.playerAndSeedContainerId, this.youtubePlayer);

    /** @type {CurrentPlayer} */
    this.currentPlayerHandler = new CurrentPlayer(this, this.playerAndSeedContainerId, this.changePlayer);

    /** @type {ChangeSeed} */
    this.seedHandler = new ChangeSeed(this, this.playerAndSeedContainerId, this.youtubePlayer, this.seedHasChanged, this.history);


    // hard-coded resources for menus
    this.staticResources.set(MAJOR_GAMEPLAY_EVENTS, [
        { id: GameplayEventType.ItemCollected.toString(10), name: 'Item Collected', x: 70, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.ItemTouched.toString(10), name: 'Item Touched', x: 595, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.Bossfight.toString(10), name: 'Bossfight', x: 140, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.Trinket.toString(10), name: 'Trinket Taken', x: 280, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.CharacterReroll.toString(10), name: 'Character Reroll', x: 385, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.AbsorbedItem.toString(10), name: 'Sucked Up Item', x: 350, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.CharacterDied.toString(10), name: 'Northernlion DIED', x: 35, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.WonTheRun.toString(10), name: 'Northernlion WON', x: 1155, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.DownToTheNextFloor.toString(10), name: 'Down to the next floor!', x: 105, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.Clicker.toString(10), name: 'Other Events', x: 1190, y: 0, w: 35, h: 35 }
    ]);

    this.staticResources.set(USED_CONSUMABLES, [
        { id: GameplayEventType.Pill.toString(10), name: 'Pill', x: 175, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.TarotCard.toString(10), name: 'Tarot Card', x: 210, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.Rune.toString(10), name: 'Rune', x: 245, y: 0, w: 35, h: 35 },
        { id: GameplayEventType.OtherConsumable.toString(10), name: 'Other Consumable', x: 315, y: 0, w: 35, h: 35 }
    ]);

    this.staticResources.set(GAME_MODES, [
        { id: GameMode.HardAndNormal.toString(10), name: 'Normal Game', x: 840, y: 0, w: 35, h: 35 },
        { id: GameMode.GreedAndGreedier.toString(10), name: 'Greed Mode!', x: 875, y: 0, w: 35, h: 35 },
        { id: GameMode.SpecialChallenge.toString(10), name: 'A Special Challenge', x: 910, y: 0, w: 35, h: 35 },
        { id: GameMode.CommunityChallenge.toString(10), name: 'Community-Requested Challenge', x: 980, y: 0, w: 35, h: 35 },
        { id: GameMode.SpecialSeed.toString(10), name: 'A Special Seed', x: 945, y: 0, w: 35, h: 35 },
        { id: GameMode.Unspecified.toString(10), name: 'Something else / from a mod', x: 1015, y: 0, w: 35, h: 35 }
    ]);

    this.staticResources.set(NO_STARTING_ITEMS, [
        { id: 'none', name: 'No, continue!', x: 700, y: 0, w: 35, h: 35 },
    ]);

    this.staticResources.set(NO_STARTING_TRINKETS, [
        { id: 'none', name: 'No, continue!', x: 665, y: 0, w: 35, h: 35 },
    ]);
    this.staticResources.set(MORE_STARTING_ITEMS, [
        { id: 'yes', name: 'Yes, there were more!', x: 595, y: 0, w: 30, h: 30 },
        { id: 'no', name: 'No, that was it!', x: 700, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(MORE_STARTING_TRINKETS, [
        { id: 'yes', name: 'Yes, there was another trinket!', x: 280, y: 0, w: 30, h: 30 },
        { id: 'no', name: 'No, that was it!', x: 665, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(COMMON_BOSSES, []);
    this.staticResources.set(NEXT_FLOORSET, []);
    this.staticResources.set(CONFIRM_NL_DIED, [
        { id: 'confirm', name: 'Yes, NL died!', x: 1050, y: 0, w: 35, h: 30 },
        { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 }
    ]);
    this.staticResources.set(CONFIRM_VICTORY_LAP, [
        { id: 'confirm', name: 'Yes, NL did a victory lap!', x: 1050, y: 0, w: 35, h: 30 },
        { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 }
    ]);
    this.staticResources.set(CONFIRM_ANOTHER_RUN, [
        { id: 'confirm', name: 'Yes, NL did another run!', x: 1050, y: 0, w: 35, h: 30 },
        { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 }
    ]);
    this.staticResources.set(CONFIRM_RUN_ENDED, [
        { id: 'confirm', name: 'Yes, The video ended here!', x: 1050, y: 0, w: 35, h: 30 },
        { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 }
    ]);
    this.staticResources.set(CONFIRM_NL_WON, [
        { id: 'confirm', name: 'Yes, NL won the run!', x: 1050, y: 0, w: 35, h: 30 },
        { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 }
    ]);
    this.staticResources.set(WAS_THERE_ANOTHER_RUN, [
        { id: 'run', name: 'Yes, another run!', x: 1120, y: 0, w: 35, h: 35 },
        { id: 'victory-lap', name: 'Yes, a victory lap!', x: 1120, y: 0, w: 35, h: 35 },
        { id: 'end', name: 'No, the episode ended here!', x: 1050, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(SUBMIT_FAILED, [
        { id: 'submit-episode', name: 'Submit Episode!', x: 1120, y: 0, w: 30, h: 30 }
    ]);
    this.staticResources.set(RUN_SUBMITTED_SUCCESSFULLY, [
        { id: 'run-submitted', name: 'View Results!', x: 735, y: 0, w: 30, h: 30 }
    ]);
    this.staticResources.set(DID_BLACK_RUN_ABSORB_AN_ITEM, [
        { id: 'no', name: 'No, move on!', x: 665, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(DID_BLACK_RUN_ABSORB_ANOTHER_ITEM, [
        { id: 'no', name: 'No, that was it!', x: 700, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(NO_CURSE, [
        { id: 'NoCurse', name: 'No Curse!', x: 735, y: 0, w: 35, h: 35 }
    ]);


    // render initial menu
    this.menu_WhatCharacterWasChosen();


    // replaces the 'loading...' page title with the correct one
    get(`/Api/Videos/Title/${this.videoId}`).then(title => {
        if (title) {
            setTitle(`Submitting: ${title}`);
        }
    });
}







SubmitVideoPage.prototype = {

    /**
     * changes the player to player 1 or player 2
     * @param {number} player
     */
    changePlayer: function (player) {
        this.playerOneOrTwo = player;
    },


    /**
     * decides what happens when an element was removed from history
     * @param {RemoveHistoryElement} removedElement
     */
    itemWasRemovedFromHistory: function(removedElement) {
        if (removedElement.characterIndex !== null && removedElement.floorIndex === null && removedElement.eventIndex === null) {
            // character was removed
            this.menu_WhatCharacterWasChosen();
        } else if (removedElement.characterIndex !== null && removedElement.floorIndex !== null && removedElement.eventIndex === null) {
            // floor was removed
            if (this.history.characterHasNoFloorsSelected()) {
                this.menu_ChooseFirstFloor();
            } else {
                this.menu_main();
            }
        } else if ((removedElement.characterIndex !== null && removedElement.floorIndex !== null && removedElement.eventIndex !== null && removedElement.eventType !== null) {
            // generic gameplay event was removed
            // generic events are safe to remove, except for the curse. here the 'select curse' menu must be displayed again
            if (removedElement.eventType === ResourceType.Curse) {
                this.menu_WasTheFloorCursed();
                return;
            }
        }
    },


    /** 
     *  When the seed was changed by the user: 
     *  - displays the 'Was there a starting item?' menu if necessary
     *  - displays the 'Main Menu' if it's not necessary
     */
    seedHasChanged: function () {
        if (this.history.weAreOnFirstFloor() && !this.history.characterHasStartingItems()) {
            this.menu_WasThereAStartingItem();
        } else {
            this.menu_MainSelectScreen();
        }
    },


    cleanup: function () {
        this.tempValue = null;
        this.wasRerolled = false;
        const player = document.getElementById('current-player-container');
        removeClassIfExists(player, 'display-none');
        this.seedHandler.showSeedInputElement();
    },


    backToMainMenu: function() {
        return div(
            hr(),
            span(
                t('← ')
            ),
            span(
                t('Back to selection'),
                cl('u', 'hand'),
                event('click', () => this.menu_main())
            )
        );
    }


    /**
     * returns resources that were hard-coded into the page and don't exist on the server
     * @param {number} type - the type of resource that should be returned
     * @returns {Promise<IsaacResource[]>}
     */
    getStaticResource: function(type) {
        const staticResources = this.staticResources.get(type);
        if (!staticResources) {
            throw `static resource is missing: ${type.toString(10)}`
        }
        return Promise.resolve(staticResources);
    },


    /**
     * returns resources that were loaded from the server (or returns them from cache)
     * @param {string} url - the url to load the resources from
     * @returns {Promise<IsaacResource[]>}
     */
    getServerResource: function(url) {
        const cachedResources = this.storedServerResources.get(url);
        if (cachedResources) {
            return Promise.resolve(cachedResources);
        }

        return get(url).then(resources => {
            this.storedServerResources.set(url, resources);
            return resources;
        });
    },


    /**
     * helper function to easily render HTML content into the main menu container
     * @param {...any} contents
     */
    display: function (...contents) {
        new Render([
            ...contents
        ], this.menuContainerId, true, true)
    },


    /** displays the 'What Character was Chosen?' menu */
    menu_WhatCharacterWasChosen: function () {
        this.display(
            H2(t('What character was chosen?')),
            Div(id('cb'))
        );
        new Boxes(this, 'cb', this.process_CharacterWasChosen, this.getServerResource(`/Api/Resources/?ResourceType=2`))
    },


    /**
     * processes a chosen character and decides what to display next
     * @param {string} characterId
     */
    process_CharacterWasChosen: function (characterId) {
        this.tempValue = characterId;
        this.menu_WhatGameModeWasChosen();
    },


    /** displays the 'What Game Mode was Chosen?' menu */
    menu_WhatGameModeWasChosen: function () {
        this.display(
            H2(t('What game mode was chosen?')),
            Div(id('gm'))
        );
        new Boxes(this, 'gm', this.process_GameModeWasChosen, this.getStaticResource(GAME_MODES), 1, false, '/img/gameplay_events.png');
    },


    /**
     * processes the chosen game mode and decides what to display next
     * @param {string} gameMode
     */
    process_GameModeWasChosen: function (gameMode) {
        if (!this.tempValue || !gameMode) {
            this.menu_WhatCharacterWasChosen();
        } else {
            const mode = parseInt(gameMode, 10);
            const chosenCharacter = {
                CharacterId: this.tempValue,
                GameMode: mode,
                Seed: undefined,
                PlayedFloors: []
            }
            this.history.addCharacter(chosenCharacter);
            this.menu_ChooseFirstFloor();
        }
    },


    /** displays the 'Choose what Other Event happened' menu */
    menu_WhatOtherEventHappened: function () {
        this.display(
            H2(t('What other event happened?')),
            P(
                span(
                    t('NL used the CLICKER'),
                    cl('u', 'hand'),
                    event('click', () => this.menu_WhatOtherEventHappened('clicker'))
                )
            ),
            P(
                span(
                    t('NL REROLLED his character, and a TRANSFORMATION happened'),
                    cl('u', 'hand'),
                    event('click', () => this.menu_WhatOtherEventHappened('reroll-transform'))
                )
            ),
            this.backToMainMenu()
        );
    },


    /**
     * processes the 'Other Event' selection and chooses what will be displayed next
     * @param {string} otherEvent
     */
    process_OtherGameplayEventWasChosen: function(otherEvent) {
        if (otherEvent === 'reroll-transform') {
            this.menu_HowDidNlRerollHisCharacterBeforeTransforming();
        } else if (otherEvent === 'clicker') {
            this.ShowWhatCharacterDidNlChangeInto();
        } else {
            this.menu_main();
        }
    },


    /** displays the 'What character did NL change into after using the clicker?' menu */
    menu_WhatCharacterDidNlChangeInto: function () {
        this.display(
            H2(t('What character did NL change into after using the clicker?')),
            Div(id('clicker'), t(this.loading)),
            this.backToMainMenu()
        );
        new Boxes(this, 'clicker', this.process_ClickerCharacterChosen, this.getServerResource(`/Api/Resources/?ResourceType=2`), 1, false);
    },


    /**
     * processes the character that NL turned into after using the clicker, then goes back to the main menu
     * @param {string} characterId
     */
    process_ClickerCharacterChosen: function (characterId) {
        this.history.AddEvent({
            EventType: 20,
            RelatedResource1: 'Clicker',
            RelatedResource2: characterId,
            Player: this.playerOneOrTwo
        });
        this.menu_main();
    },


    /** displays the 'How did NL reroll his character before he got a transformation?' menu */
    menu_HowDidNlRerollHisCharacterBeforeTransforming: function () {
        this.display(
            H2(t('How did NL reroll his character?')),
            Div(id('rr'), t(this.loading)),
            this.backToMainMenu()
        );
        new Boxes(this, 'rr', this.process_RerollBeforeTransformingChosen, get(`/Api/Resources/?ResourceType=0&RequiredTags=124`), 1, false);
    },


    /**
     * processes the that triggered a transformation and decides what to display next
     * @param {string} rerollId
     */
    process_RerollBeforeTransformingChosen: function (rerollId) {
        this.tempValue = rerollId;
        this.menu_WhatTransformationDidNlRerollInto();
    },


    /** displays the 'What Transformation did NL reroll into?' */
    menu_WhatTransformationDidNlRerollInto: function () {
        this.display(
            H2(t('What transformation did NL reroll into?')),
            Div(id('tra'), t(this.loading)),
            this.backToMainMenu()
        );
        new Boxes(this, 'tra', fn, this.getServerResource(`/Api/Resources/?ResourceType=12`), 1, false);
    },


    /**
     * processes the reroll that triggered a transformation and decides what to display next
     * @param {string} transformationId
     */
    process_RerolledTransformationSelected: function (transformationId) {
        if (this.tempValue) {
            this.history.addEvent({
                EventType: 21,
                RelatedResource1: this.copyString(this.tempValue),
                RelatedResource2: transformationId,
                Player: this.playerOneOrTwo
            });
        }
        this.menu_main();
    }


    menu_ChooseFirstFloor: function () {

    },


    /**
     * @param {string} s
     * @returns {string}
     */
    copyString: function (s) {
        return (' ' + s).slice(1);
    },

    /** Displays the main select screen that will be displayed after every gameplay event choice */
    menu_main: function () {
        this.cleanup();
        const gameplayEvents = this.getStaticResource(MAJOR_GAMEPLAY_EVENTS);
        const consumableEvents = this.getStaticResource(USED_CONSUMABLES);

        this.display(
            H2(t('What happened?')),
            Div(id('ge')),
            H2(t('What was used?')),
            Div(id('ce')),
            Hr(),
            P(
                span(
                    t('Launch Tutorial!'),
                    style(this.highlightTutorial ? 'color: orange' : 'color: darkgray'),
                    id('launch-tutorial'),
                    event('click', () => {
                        this.highlightTutorial = false;
                        this.launchTutorial();
                    })
                )
            )
        );

        new Boxes(this, 'ge', this.processMainMenuSelection, gameplayEvents, 1, false, '/img/gameplay_events.png');
        new Boxes(this, 'ce', this.processMainMenuSelection, consumableEvents, 2, false, '/img/gameplay_events.png');
    },


    /**
     * Processes the selection made in the main menu and displays the correct menu depending on the choice
     * @param {string} selectedEvent - the box that was clicked in the main menu
     */
    processMainMenuSelection: function (selectedEvent) {
        this.seedHandler.hideSeedInputElement();

        if (!selectedEvent) {
            this.menu_main();
            return;
        }

        const selection = parseInt(selectedEvent, 10);

        switch (selection) {
            case 2: this.ShowWhereDidTheItemComeFrom(); break;
            case 18: this.ShowWhereDidTheTouchedItemComeFrom(); break;
            case 14: this.ShowHowWasTheItemAbsorbed(); break;
            case 4: this.ShowSelectBoss(); break;
            case 8: this.SelectTrinket(); break;
            case 15: this.ShowHowWasTheCharacterRerolled(); break;
            case 1: this.ShowConfirmNlDied(); break;
            case 16: this.ShowConfirmNlWon(); break;
            case 3: this.ShowChooseFloor(); break;
            case 5: this.ShowChoosePill(); break;
            case 6: this.ShowChooseTarotCard(); break;
            case 7: this.ShowChooseRune(); break;
            case 10: this.ShowChooseOtherConsumable(); break;
            case 20: this.ShowWhatOtherEventHappened(); break;
            case 21: this.ShowWhatOtherEventHappened(); break;
            default: this.ShowMainSelectScreen(); break;
        }
    },


    /** the main menu tutorial, powered by Driver.js */
    launchTutorial: function () {
        this.youtubePlayer.pauseVideo();

        const driver = new Driver({ allowClose: false });
        driver.defineSteps([
            {
                element: '#b60',
                popover: {
                    title: 'Collected Item',
                    description: 'If NL collects an item, click here!',
                    position: 'left'
                }
            },
            {
                element: '#b61',
                popover: {
                    title: 'Touched Item',
                    description: 'If NL only touches a spacebar item and puts it down again (to get transformation bonuses or to take it out of the item pool), click here!',
                    position: 'left'
                }
            },
            {
                element: '#b62',
                popover: {
                    title: 'Bossfight',
                    description: 'If NL encounters a boss, click here (even if he doesn\'t win or doesn\'t finish the fight!).',
                    position: 'left'
                }
            },
            {
                element: '#b63',
                popover: {
                    title: 'Trinkets',
                    description: 'If NL switches out his trinket, click here! Only trinkets that NL used for a while count!',
                    position: 'left'
                }
            },
            {
                element: '#b64',
                popover: {
                    title: 'Character Reroll',
                    description: 'Did NL use the D4 / D100 / the 6-Room or did "Missing No." trigger at the beginning of the floor? That\'s what this is for!',
                    position: 'left'
                }
            },
            {
                element: '#b65',
                popover: {
                    title: 'Absorbed Items',
                    description: 'This box is for items that got absorbed by Void or Black Rune!',
                    position: 'left'
                }
            },
            {
                element: '#b66',
                popover: {
                    title: 'DIED!',
                    description: 'If NL got killed and the run ended, click this box to choose how he got killed!',
                    position: 'left'
                }
            },
            {
                element: '#b67',
                popover: {
                    title: 'WON!',
                    description: 'Northernlion killed a final boss and won the run? click here!',
                    position: 'left'
                }
            },
            {
                element: '#b68',
                popover: {
                    title: 'Down to the next floor!',
                    description: 'This will take you to the "next floor" select screen. '
                        + 'HINT: Try to choose the next floor when NL really enters the trap door - '
                        + 'the current time of the youtube player will be saved as a timestamp to calculate floor timings! :) '
                        + 'If a floor gets repeated (5-Room or Forget Me Now) also use this.',
                    position: 'left'
                }
            },
            {
                element: '#b69',
                popover: {
                    title: 'Other Events',
                    description: 'Everything that doesn\'t fit anywhere else. Currently used for: Transformations '
                        + 'that happened when rerolling the character (for example becoming \'Lord of the Flies\' after using the D100) and changing the '
                        + 'character with the "Clicker".',
                    position: 'left'
                }
            },
            {
                element: '#box7',
                popover: {
                    description: 'If Northernlion uses a consumable, use one of these buttons.',
                    title: 'Consumables',
                    position: 'left'
                }
            },
            {
                element: '#current-player-container',
                popover: {
                    title: '2-Player Mode',
                    description: 'If Northernlion plays as Jacob & Esau, use this button to switch between the two characters.'
                        + 'It\'s a little tricky but you can do it! :) Also, Isaac might get a real 2-player mode one day...',
                    position: 'left',
                }
            },
            {
                element: '#seed-container',
                popover: {
                    title: 'Seed',
                    description: 'Did Northernlion show the seed later in the video? click here to add / change the seed at any time.',
                    position: 'left'
                }
            },
            {
                element: '#player-controls',
                popover: {
                    title: 'Player Controls',
                    description: 'Sometimes it\'s convenient to go back a couple seconds or pause the video without messing with the youtube player directly. ⏪ takes you '
                        + 'back 5 seconds, ▶️ and ⏸️ play and pause the video.',
                    position: 'bottom'
                }
            },
            {
                element: '#quotes',
                popover: {
                    title: 'Quotes',
                    description: 'Northernlion is a funny dude. If he says something really funny, type it into the textbox and submit it!',
                    position: 'top'
                }
            },
            {
                element: '#quote-started-at-container',
                popover: {
                    title: 'Quote Video Timestamp',
                    description: 'Select when the quote happened in the video so that people can jump right to the quote on youtube! '
                        + '"Current video time" will save the current time the youtube player is at right now. The second option lets you specify an exact time.',
                    position: 'top'
                }
            },
            {
                element: '#submit-topic-container',
                popover: {
                    title: 'Topics / Tangents',
                    description: 'This is for broad discussion topics and tangents NL went on. Maybe we can search NL videos by "tangents" in the future...?',
                    position: 'top'
                }
            },
            {
                element: '#history-container',
                popover: {
                    title: 'History',
                    description: 'All events you select will appear here in chronological order. If you added anything by accident, you can click individual events to remove them from the log! NOTE: '
                        + 'Removing a floor or a character will also remove all events that happend on that floor, or everything that happened to that character! (a confirmation dialog will appear in those cases.)',
                    position: 'top'
                }
            },
            {
                element: '#launch-tutorial',
                popover: {
                    title: 'Additional Help',
                    description: 'On some pages there is more help available. Watch out for this link -  it might help you out if you get stuck or run into an edge case! And that\'s it! Thanks for taking the time to contribute and good luck!',
                    position: 'left'
                }
            }
        ]);

        setTimeout(() => {
            driver.start();
        }, 100);
    }
}

class SubmitVideo implements Component {
    


    private ShowChooseOtherConsumable() {
        const consumables = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.OtherConsumable.toString(10)}`);
        const menu = new WhatOtherConsumableWasUsed(this, this.OtherConsumableChosen, consumables);
        this.Display(menu);
    }

    private OtherConsumableChosen(consumableId: string) {
        if (consumableId) {
            this.history.AddEvent({
                EventType: GameplayEventType.OtherConsumable,
                Player: this.currentPlayer,
                RelatedResource1: consumableId
            });
        }
        this.ShowMainSelectScreen();
    }

    private ShowChooseRune() {
        const runes = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Rune.toString(10)}`);
        const menu = new WhatRuneWasUsed(this, this.RuneChosen, runes);
        this.Display(menu);
    }

    private RuneChosen(runeId: string) {
        if (runeId) {
            this.history.AddEvent({
                EventType: GameplayEventType.Rune,
                Player: this.currentPlayer,
                RelatedResource1: runeId
            });

            if (runeId === 'BlackRune') {
                this.tempChosenItemSource = runeId;
                this.ShowDidBlackRuneAbsorbAnItem();
                return;
            }
        }
        this.ShowMainSelectScreen();
    }

    private ShowDidBlackRuneAbsorbAnItem() {
        const icon = this.GetStaticResource(StaticResourcesForMenu.DidBlackRuneAbsorbAnItem);
        const menu = new DidBlackRuneAbsorbAnItem(this, this.BlackRuneAbsorbedAnItemChoiceMade, icon, true);
        this.Display(menu);
    }

    private BlackRuneAbsorbedAnItemChoiceMade(choice: string) {
        if (choice === 'no') {
            this.history.AddEventIfLastEventWasNotOfType({
                EventType: GameplayEventType.Rune,
                RelatedResource1: 'BlackRune',
                Player: this.currentPlayer
            }, GameplayEventType.AbsorbedItem, 'Black Rune');
            this.ShowMainSelectScreen();
        } else {
            const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item.toString(10)}`);
            const menu = new WhatItemWasCollected(this, items, this.BlackRuneAbsorbedAnItemChosen, this.ItemWasRerolled, this.youtubePlayer, false, true);
            this.Display(menu);
        }
    }

    private BlackRuneAbsorbedAnItemChosen(itemId: string) {
        if (!itemId) {
            this.ShowMainSelectScreen();
        } else {
            this.history.AddEvent({
                EventType: GameplayEventType.AbsorbedItem,
                RelatedResource1: itemId,
                RelatedResource2: 'BlackRune',
                Player: this.currentPlayer,
                Rerolled: this.wasRerolled
            });
            this.ShowDidBlackRuneAbsorbAnotherItem();
        }
    }

    private ShowDidBlackRuneAbsorbAnotherItem() {
        const icon = this.GetStaticResource(StaticResourcesForMenu.DidBlackRuneAbsorbAnotherItem);
        const menu = new DidBlackRuneAbsorbAnItem(this, this.BlackRuneAbsorbedAnItemChoiceMade, icon, false);
        this.Display(menu);
    }

    private ShowChooseTarotCard() {
        const tarotCards = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.TarotCard.toString(10)}`);
        const menu = new WhatTarotCardWasUsed(this, this.TarotCardChosen, tarotCards);
        this.Display(menu);
    }

    private TarotCardChosen(tarotCardId: string) {
        if (tarotCardId) {
            this.history.AddEvent({
                EventType: GameplayEventType.TarotCard,
                Player: this.currentPlayer,
                RelatedResource1: tarotCardId
            });
        }
        this.ShowMainSelectScreen();
    }

    private ShowChoosePill() {
        const pills = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Pill.toString(10)}`);
        const menu = new WhatPillWasTaken(this, this.PillChosen, pills);
        this.Display(menu);
    }

    private PillChosen(pillId: string) {
        if (pillId) {
            this.history.AddEvent({
                EventType: GameplayEventType.Pill,
                Player: this.currentPlayer,
                RelatedResource1: pillId
            });
        }
        this.ShowMainSelectScreen();
    }

    private ShowWasThereAStartingItem() {
        const icon = this.GetStaticResource(StaticResourcesForMenu.NoStartingItems);
        const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item.toString(10)}`);
        const menu = new WasThereAStartingItem(this, this.StartingItemChosen, icon, items, true);
        this.Display(menu);
    }

    private StartingItemChosen(itemId: string) {
        if (itemId === 'none') {
            this.ShowWasThereAStartingTrinket();
        } else {
            this.history.AddEvent({
                EventType: GameplayEventType.ItemCollected,
                RelatedResource1: itemId,
                RelatedResource2: 'StartingItem',
                Player: this.currentPlayer,
                Rerolled: false
            });
            this.ShowWasThereAnotherStartingItem();
        }
    }

    private ShowWasThereAnotherStartingItem() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.MoreStartingItems);
        const menu = new WasThereAnotherStartingItem(this, this.ShowChooseAnotherStartingItem, icons);
        this.Display(menu);
    }

    private ShowChooseAnotherStartingItem(choice: string) {
        if (choice === 'yes') {
            const icon = this.GetStaticResource(StaticResourcesForMenu.NoStartingItems);
            const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item.toString(10)}`);
            const menu = new WasThereAStartingItem(this, this.StartingItemChosen, icon, items, true);
            this.Display(menu);
        } else {
            this.ShowWasThereAStartingTrinket();
        }
    }

    private ShowWasThereAStartingTrinket() {
        const icon = this.GetStaticResource(StaticResourcesForMenu.NoStartingTrinkets);
        const trinkets = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Trinket.toString(10)}`);
        const menu = new WasThereAStartingTrinket(this, this.StartingTrinketChosen, icon, trinkets, true);
        this.Display(menu);
    }

    private StartingTrinketChosen(trinketId: string) {
        if (trinketId === 'none') {
            this.ShowMainSelectScreen();
        } else {
            this.history.AddEvent({
                EventType: GameplayEventType.StartingTrinket,
                RelatedResource1: trinketId,
                Player: this.currentPlayer
            });
            this.ShowWasThereAnotherStartingTrinket();
        }
    }

    private ShowWasThereAnotherStartingTrinket() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.MoreStartingTrinkets);
        const menu = new WasThereAnotherStartingTrinket(this, this.ShowChooseAnotherStartingTrinket, icons);
        this.Display(menu);
    }

    private ShowChooseAnotherStartingTrinket(choice: string) {
        if (choice === 'yes') {
            const icon = this.GetStaticResource(StaticResourcesForMenu.NoStartingTrinkets);
            const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Trinket.toString(10)}`);
            const menu = new WasThereAStartingTrinket(this, this.StartingTrinketChosen, icon, items, true);
            this.Display(menu);
        } else {
            this.ShowMainSelectScreen();
        }
    }

    private ShowConfirmNlWon() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.ConfirmNlWon);
        const menu = new ConfirmNlWon(this, this.NlWonConfirmed, icons);
        this.Display(menu);
    }

    private NlWonConfirmed(choice: string) {
        if (choice === 'confirm') {
            this.ShowDidNlDoAnotherRun();
        } else {
            this.ShowMainSelectScreen();
        }
    }

    private ShowConfirmNlDied() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.ConfirmNlDied);
        const menu = new ConfirmNlDied(this, this.ShowWhatKilledNl, icons);
        this.Display(menu);
    }

    private ShowWhatKilledNl(choice: string) {
        if (choice === 'confirm') {
            const enemies = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Enemy.toString(10)}`);
            const menu = new SelectWhatKilledNl(this, this.EnemyWasSelected, enemies);
            this.Display(menu);
        } else {
            this.ShowMainSelectScreen();
        }
    }

    private EnemyWasSelected(enemyId: string) {
        if (!enemyId) {
            this.ShowMainSelectScreen();
            return;
        }

        this.history.AddEvent({
            EventType: GameplayEventType.CharacterDied,
            RelatedResource1: enemyId
        });

        this.ShowDidNlDoAnotherRun();
    }

    private ShowDidNlDoAnotherRun() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.WasThereAnotherRun);
        const menu = new DidNlDoAnotherRun(this, this.DidNlDoAnotherRunChoiceSelected, icons);
        this.Display(menu);
    }

    private DidNlDoAnotherRunChoiceSelected(choice: string) {
        if (choice === 'victory-lap') {
            this.ShowConfirmNlDidAVictoryLap();
        } else if (choice === 'run') {
            this.ShowConfirmNlDidAnotherRun();
        } else {
            this.ShowConfirmRunEnded();
        }
    }

    private ShowConfirmNlDidAnotherRun() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.ConfirmAnotherRun);
        const menu = new ConfirmDidNlDoAnotherRun(this, this.ConfirmDidNlDoAnotherRun, icons);
        this.Display(menu);
    }

    private ConfirmDidNlDoAnotherRun(choice: string) {
        if (choice === 'confirm') {
            this.ShowWhatCharacterWasChosenNext();
        } else {
            this.ShowDidNlDoAnotherRun();
        }
    }

    private ShowConfirmNlDidAVictoryLap() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.ConfirmVictoryLap);
        const menu = new ConfirmNlDidAVictoryLap(this, this.VictoryLapConfirmation, icons);
        this.Display(menu);
    }

    private VictoryLapConfirmation(choice: string) {
        if (choice === 'confirm') {
            this.ShowChooseFloor();
        } else {
            this.ShowDidNlDoAnotherRun();
        }
    }

    private ShowWhatCharacterWasChosenNext() {
        const characters = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Character.toString(10)}`);
        const menu = new WhatCharacterWasChosen(this, characters, this.CharacterWasChosen);
        this.Display(menu);
    }

    private ShowConfirmRunEnded() {
        const icons = this.GetStaticResource(StaticResourcesForMenu.ConfirmRunEnded)
        const menu = new ConfirmTheRunEnded(this, this.ConfirmRunEndedChosen, icons);
        this.Display(menu);
    }

    private ConfirmRunEndedChosen(choice: string) {
        if (choice === 'confirm') {
            this.ShowSubmitEpisode();
        } else {
            this.ShowDidNlDoAnotherRun();
        }
    }

    private ShowSubmitEpisode() {
        const menu = new ConfirmSubmitEpisode(this, this.RunSubmissionDone, this.history, false);
        this.Display(menu);
    }

    private RunSubmissionDone(runSubmitted: boolean) {
        if (runSubmitted) {
            this.ShowSubmissionSucceeded();
        } else {
            this.ShowSubmissionFailed();
        }
    }

    private ShowSubmissionFailed() {
        const menu = new ConfirmSubmitEpisode(this, this.RunSubmissionDone, this.history, true);
        this.Display(menu);
    }

    private ShowSubmissionSucceeded() {
        const menu = new SubmissionSucceeded(this.videoId);
        this.Display(menu);
    }

    private ShowHowWasTheCharacterRerolled() {
        const characterRerollOptions = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.CharacterReroll.toString(10)}`);
        const menu = new SelectHowWasTheCharacterRerolled(this, this.CharacterRerollWasSelected, characterRerollOptions);
        this.Display(menu);
    }

    private CharacterRerollWasSelected(rerollId: string) {
        if (!rerollId) {
            this.ShowMainSelectScreen();
            return;
        }

        this.history.AddEvent({
            EventType: GameplayEventType.CharacterReroll,
            RelatedResource1: rerollId,
            Player: this.currentPlayer
        });

        this.ShowMainSelectScreen();
    }

    private SelectTrinket() {
        const trinkets = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Trinket.toString(10)}`);
        const menu = new SelectWhatTrinketWasTaken(this, this.TrinketWasSelected, trinkets);
        this.Display(menu);
    }

    private TrinketWasSelected(trinketId: string) {
        if (!trinketId) {
            this.ShowMainSelectScreen();
            return;
        }

        this.history.AddEvent({
            EventType: GameplayEventType.Trinket,
            RelatedResource1: trinketId,
            Player: this.currentPlayer
        });
        this.ShowMainSelectScreen();
    }

    private ShowSelectBoss() {
        const commonBosses = this.GetStaticResource(StaticResourcesForMenu.CommonBosses);
        const bosses = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Boss.toString(10)}`);
        const menu = new WhatBossWasFought(this, this.BossfightWasSelected, commonBosses, bosses, this.youtubePlayer);
        this.Display(menu);
    }

    private BossfightWasSelected(bossId: string) {
        if (!bossId) {
            this.ShowMainSelectScreen();
            return;
        }

        this.history.AddEvent({
            EventType: GameplayEventType.Bossfight,
            RelatedResource1: bossId
        });
        this.ShowMainSelectScreen();
    }

    private ShowHowWasTheItemAbsorbed() {
        const absorbers = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Unspecified.toString(10)}&RequiredTags=${Tag.AbsorbsOtherItems.toString(10)}`);
        const menu = new HowWasTheItemAbsorbed<SubmitVideo>(this, this.ShowWhatItemWasAbsorbed, absorbers);
        this.Display(menu);
    }

    private ShowWhatItemWasAbsorbed(absorberId: string) {
        if (!absorberId) {
            this.ShowMainSelectScreen();
            return;
        }

        this.tempChosenItemSource = absorberId;
        const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item.toString(10)}`);
        const menu = new WhatItemWasCollected<SubmitVideo>(this, items, this.AbsorberAndAbsorbedItemWereSelected, this.ItemWasRerolled, this.youtubePlayer, false, true);
        this.Display(menu);
    }

    private AbsorberAndAbsorbedItemWereSelected(absorbedItemId: string) {
        if (!absorbedItemId || !this.tempChosenItemSource) {
            this.ShowMainSelectScreen();
            return;
        }

        if (this.tempChosenItemSource === 'BlackRune') {
            this.history.AddEvent({
                RelatedResource1: this.copyString(this.tempChosenItemSource),
                EventType: GameplayEventType.Rune,
                Player: this.currentPlayer
            });
        }

        this.history.AddEvent({
            RelatedResource1: absorbedItemId,
            RelatedResource2: this.copyString(this.tempChosenItemSource),
            EventType: GameplayEventType.AbsorbedItem,
            Player: this.currentPlayer,
            Rerolled: this.wasRerolled
        });
        this.ShowMainSelectScreen();
    }

    

    


    private ShowChooseFloor() {
        const commonFloorsThatComeNext = this.GetStaticResource(StaticResourcesForMenu.NextFloorset);
        const allFloors = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Floor.toString(10)}`);
        this.Display(new WhatFloorAreWeOn<SubmitVideo>(this, Promise.resolve(commonFloorsThatComeNext), allFloors, this.FloorWasChosen, false));
    }

    private ShowChooseFirstFloor() {
        const firstFloors = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Floor.toString(10)}&RequiredTags=${Tag.IsFirstFloor.toString(10)}`);
        const allFloors = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Floor.toString(10)}`);
        this.Display(new WhatFloorAreWeOn<SubmitVideo>(this, firstFloors, allFloors, this.FloorWasChosen, true));
    }

    private FloorWasChosen(floorId: string) {
        this.history.AddFloor({
            Duration: null,
            FloorId: floorId,
            GameplayEvents: new Array<SubmittedGameplayEvent>()
        });

        if (floorId.toLowerCase().endsWith('xl')) {
            this.CurseWasSelected('CurseOfTheLabyrinth');
        } else {
            this.ShowWasTheFloorCursed();
        }

        // now that we know the floor, preload common bosses for this floor
        get<Array<IsaacResource>>(`/Api/Resources/common-bosses-for-floor/${floorId}`, false, false).then(bossesForThisFloor => {
            if (bossesForThisFloor) {
                this.staticResources.set(StaticResourcesForMenu.CommonBosses, bossesForThisFloor.filter(boss => boss.tags && !boss.tags.some(tag => tag === Tag.DoubleTroubleBossfight)));
            } else {
                this.staticResources.set(StaticResourcesForMenu.CommonBosses, []);
            }
        });

        // ...and the next floorset
        get<Array<IsaacResource>>(`/Api/Resources/next-floorset/${floorId}`, false, false).then(floors => {
            if (floors) {
                this.staticResources.set(StaticResourcesForMenu.NextFloorset, floors);
            } else {
                this.staticResources.set(StaticResourcesForMenu.NextFloorset, []);
            }
        });
    }

    private ShowWasTheFloorCursed() {
        const noCurse = this.GetStaticResource(StaticResourcesForMenu.NoCurse);
        const allCurses = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Curse}`);
        this.Display(new WasTheFloorCursed<SubmitVideo>(this, noCurse, allCurses, this.CurseWasSelected));
    }


    private CurseWasSelected(id: string) {
        if (id !== 'NoCurse') {
            this.history.AddCurse({
                EventType: GameplayEventType.Curse,
                Player: this.currentPlayer,
                RelatedResource1: id
            });
        }

        if (this.history.WeAreOnFirstFloor() && !this.history.CurrentCharacterHasSeed()) {
            this.ShowSelectSeed();
        } else {
            this.ShowMainSelectScreen();
        }
    }

    private ShowSelectSeed() {
        this.Display(new DidNlShowTheSeed<SubmitVideo>(this, this.SeedWasSelected, this.UpdateSeedText))
    }

    

    

    

    private ShowWhereDidTheTouchedItemComeFrom() {
        const itemSources = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.ItemSource}`);
        this.Display(new WhereDidTheItemComeFrom<SubmitVideo>(this, itemSources, this.ShowWhatItemWasTouched, this.youtubePlayer, true));
    }

    private ShowWhatItemWasTouched(itemsourceId: string) {
        if (!itemsourceId) {
            this.ShowMainSelectScreen();
            return;
        }
        this.tempChosenItemSource = itemsourceId;

        const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item}&RequiredTags=${Tag.IsSpacebarItem}`);
        this.Display(new WhatItemWasCollected<SubmitVideo>(this, items, this.TouchedItemAndSourceWereSelected, this.ItemWasRerolled, this.youtubePlayer, true, false));
    }

    private TouchedItemAndSourceWereSelected(itemId: string) {
        if (itemId && this.tempChosenItemSource) {
            this.history.AddEvent({
                EventType: GameplayEventType.ItemTouched,
                Player: this.currentPlayer,
                RelatedResource1: itemId,
                RelatedResource2: this.copyString(this.tempChosenItemSource),
                Rerolled: this.wasRerolled
            });
        }
        
        this.ShowMainSelectScreen();
    }

    private ShowWhereDidTheItemComeFrom() {
        const itemSources = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.ItemSource}`);
        this.Display(new WhereDidTheItemComeFrom<SubmitVideo>(this, itemSources, this.ShowWhatItemWasCollected, this.youtubePlayer, false));
    }

    

    private ShowWhatItemWasCollected(itemsourceId: string) {
        // itemsourceId = empty string if user clicked back button
        if (!itemsourceId) {
            this.ShowMainSelectScreen();
            return;
        }
        this.tempChosenItemSource = itemsourceId;

        const items = this.GetServerResource(`/Api/Resources/?ResourceType=${ResourceType.Item}`);
        this.Display(new WhatItemWasCollected<SubmitVideo>(this, items, this.ItemAndSourceWereSelected, this.ItemWasRerolled, this.youtubePlayer, false, false))
    }

    private ItemWasRerolled(wasRerolled: boolean) {
        this.wasRerolled = wasRerolled;
    }



    private ItemAndSourceWereSelected(itemId: string) {
        if (itemId && this.tempChosenItemSource) {
            const event: SubmittedGameplayEvent = {
                EventType: GameplayEventType.ItemCollected,
                Player: this.currentPlayer,
                RelatedResource1: itemId,
                RelatedResource2: this.copyString(this.tempChosenItemSource),
                Rerolled: this.wasRerolled
            };
            this.history.AddEvent(event);
        }

        this.ShowMainSelectScreen();
    }

    

    LaunchMainMenuTutorial() {
        this.youtubePlayer.PauseVideo();

        const driver = new Driver({ allowClose: false });
        driver.defineSteps([
            {
                element: '#b60',
                popover: {
                    title: 'Collected Item',
                    description: 'If NL collects an item, click here!',
                    position: 'left'
                }
            },
            {
                element: '#b61',
                popover: {
                    title: 'Touched Item',
                    description: 'If NL only touches a spacebar item and puts it down again (to get transformation bonuses or to take it out of the item pool), click here!',
                    position: 'left'
                }
            },
            {
                element: '#b62',
                popover: {
                    title: 'Bossfight',
                    description: 'If NL encounters a boss, click here (even if he doesn\'t win or doesn\'t finish the fight!).',
                    position: 'left'
                }
            },
            {
                element: '#b63',
                popover: {
                    title: 'Trinkets',
                    description: 'If NL switches out his trinket, click here! Only trinkets that NL used for a while count!',
                    position: 'left'
                }
            },
            {
                element: '#b64',
                popover: {
                    title: 'Character Reroll',
                    description: 'Did NL use the D4 / D100 / the 6-Room or did "Missing No." trigger at the beginning of the floor? That\'s what this is for!',
                    position: 'left'
                }
            },
            {
                element: '#b65',
                popover: {
                    title: 'Absorbed Items',
                    description: 'This box is for items that got absorbed by Void or Black Rune!',
                    position: 'left'
                }
            },
            {
                element: '#b66',
                popover: {
                    title: 'DIED!',
                    description: 'If NL got killed and the run ended, click this box to choose how he got killed!',
                    position: 'left'
                }
            },
            {
                element: '#b67',
                popover: {
                    title: 'WON!',
                    description: 'Northernlion killed a final boss and won the run? click here!',
                    position: 'left'
                }
            },
            {
                element: '#b68',
                popover: {
                    title: 'Down to the next floor!',
                    description: 'This will take you to the "next floor" select screen. '
                        + 'HINT: Try to choose the next floor when NL really enters the trap door - '
                        + 'the current time of the youtube player will be saved as a timestamp to calculate floor timings! :) '
                        + 'If a floor gets repeated (5-Room or Forget Me Now) also use this.',
                    position: 'left'
                }
            },
            {
                element: '#b69',
                popover: {
                    title: 'Other Events',
                    description: 'Everything that doesn\'t fit anywhere else. Currently used for: Transformations '
                        + 'that happened when rerolling the character (for example becoming \'Lord of the Flies\' after using the D100) and changing the '
                        + 'character with the "Clicker".',
                    position: 'left'
                }
            },
            {
                element: '#box7',
                popover: {
                    description: 'If Northernlion uses a consumable, use one of these buttons.',
                    title: 'Consumables',
                    position: 'left'
                }
            },
            {
                element: '#current-player-container',
                popover: {
                    title: '2-Player Mode',
                    description: 'If Northernlion plays as Jacob & Esau, use this button to switch between the two characters.' 
                        + 'It\'s a little tricky but you can do it! :) Also, Isaac might get a real 2-player mode one day...',
                    position: 'left',
                }
            },
            {
                element: '#seed-container',
                popover: {
                    title: 'Seed',
                    description: 'Did Northernlion show the seed later in the video? click here to add / change the seed at any time.',
                    position: 'left'
                }
            },
            {
                element: '#player-controls',
                popover: {
                    title: 'Player Controls',
                    description: 'Sometimes it\'s convenient to go back a couple seconds or pause the video without messing with the youtube player directly. ⏪ takes you '
                        + 'back 5 seconds, ▶️ and ⏸️ play and pause the video.',
                    position: 'bottom'
                }
            },
            {
                element: '#quotes',
                popover: {
                    title: 'Quotes',
                    description: 'Northernlion is a funny dude. If he says something really funny, type it into the textbox and submit it!',
                    position: 'top'
                }
            },
            {
                element: '#quote-started-at-container',
                popover: {
                    title: 'Quote Video Timestamp',
                    description: 'Select when the quote happened in the video so that people can jump right to the quote on youtube! '
                        + '"Current video time" will save the current time the youtube player is at right now. The second option lets you specify an exact time.',
                    position: 'top'
                }
            },
            {
                element: '#submit-topic-container',
                popover: {
                    title: 'Topics / Tangents',
                    description: 'This is for broad discussion topics and tangents NL went on. Maybe we can search NL videos by "tangents" in the future...?',
                    position: 'top'
                }
            },
            {
                element: '#history-container',
                popover: {
                    title: 'History',
                    description: 'All events you select will appear here in chronological order. If you added anything by accident, you can click individual events to remove them from the log! NOTE: '
                        + 'Removing a floor or a character will also remove all events that happend on that floor, or everything that happened to that character! (a confirmation dialog will appear in those cases.)',
                    position: 'top'
                }
            },
            {
                element: '#launch-tutorial',
                popover: {
                    title: 'Additional Help',
                    description: 'On some pages there is more help available. Watch out for this link -  it might help you out if you get stuck or run into an edge case! And that\'s it! Thanks for taking the time to contribute and good luck!',
                    position: 'left'
                }
            }
        ]);

        setTimeout(() => {
            driver.start();
        }, 100);
    }

    static RegisterPage() {
        const page: PageData = {
            Component: SubmitVideo,
            Title: 'loading video...',
            Url: ['SubmitVideo', '{id}'],
            afterRender: () => {
                // make nav bar invisible
                const nav = document.getElementById('nav');
                if (nav) {
                    removeClassIfExists(nav, 'w20');
                    addClassIfNotExists(nav, 'display-none');
                }

                const main = document.getElementById('main-container');
                if (main) {
                    removeClassIfExists(main, 'w80');
                    addClassIfNotExists(main, 'w100');
                }

                // add beforeUnload event
                window.addEventListener('beforeunload', beforeUnloadEvent);
            },
            beforeLeaving: () => {
                // show nav bar again
                const nav = document.getElementById('nav');
                if (nav) {
                    addClassIfNotExists(nav, 'w20');
                    removeClassIfExists(nav, 'display-none');
                }

                const main = document.getElementById('main-container');
                if (main) {
                    removeClassIfExists(main, 'w100');
                    addClassIfNotExists(main, 'w80');
                }

                // remove beforeUnload event
                window.removeEventListener('beforeunload', beforeUnloadEvent);

                if (page.Component instanceof SubmitVideo && typeof (page.Component.playPauseInterval)) {
                    // clear interval
                    clearInterval(page.Component.playPauseInterval);
                    console.warn('failed to clear interval');

                    // destroy youtube player
                    page.Component.youtubePlayer.DestroyIframe();
                }
            },
            canLeave: () => confirm('warning! your progress will not be saved!')
        };
        registerPage(page);
    }
}

