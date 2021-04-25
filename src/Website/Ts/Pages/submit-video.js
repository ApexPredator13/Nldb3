import { SubmitVideoQuotesSection } from "../Components/SubmitVideo/submit-quote.js";
import { HistoryTable } from "../Components/SubmitVideo/history-table";
import { YoutubePlayer } from "../Components/SubmitVideo/youtube-player";
import { addClassIfNotExists, removeClassIfExists } from "../Framework/browser";
import { getConfig } from "../Framework/Customizable/config.development";
import { get, postResponse } from "../Framework/http";
import { Html, Div, id, div, a, iframe, attr, span, t, P, event, H2, cl, hr, Hr, style, H1, input, button, br, modal, h2, hideModal, p, do_nothing } from "../Framework/renderer";
import { registerPage, setTitle, navigate, PAGE_TYPE_EPISODE, dontLetUserNavigateAway, useRegularPopstateHandler, goBack } from "../Framework/router";
import { PlayerControls } from "../Components/SubmitVideo/player-controls";
import { CurrentPlayer } from "../Components/SubmitVideo/current-player";
import { ChangeSeed } from "../Components/SubmitVideo/change-seed";
import { Boxes } from "../Components/General/Boxes";
import { Searchbox } from "../Components/General/Searchbox";
import { Link } from "./_link-creator";
import { helpSelectAbsorbedItemModal } from "../Components/SubmitVideo/help-select-absorbed-item";
import { helpSelectItemsource } from "../Components/SubmitVideo/help-select-itemsource";
import { helpSelectItem } from "../Components/SubmitVideo/help-select-item";
import { helpSelectTouchedItem } from "../Components/SubmitVideo/help-select-touched-item";
import { helpSelectBoss } from "../Components/SubmitVideo/help-select-boss";
import { SubmitTopicSection } from "../Components/SubmitVideo/submit-topic.js";

import * as Driver from 'driver.js';
import '../Framework/Customizable/typedefs';

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
const DID_REROLL_TRIGGER_TRANSFORMATION = 21;
const DID_REROLL_TRIGGER_ANOTHER_TRANSFORMATION = 22;
const CONFIRM_DOWN_TO_NEXT_FLOOR = 23;
const OTHER_EVENTS = 24;
const CONFIRM_NO_BOSSFIGHT_ON_THIS_FLOOR = 25;
const TAINTED_ISAAC_EVENTS = 26;


const beforeUnloadEvent = e => {
    e.preventDefault();
    e.returnValue = '';
}

let interval = 0;


/**
 * decodes a string that has html entities inside of it, like &#818;
 * @param {string} input
 * @returns {string} the modified string
 */
function htmlDecode(input) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

/**
 * handles keypresses while on the main menu
 * @param {KeyboardEvent} e the raw keyboard event
 */
function mainMenuKeyEvent(e) {
    switch (e.key.toLowerCase()) {
        case 'i': this.processMainMenuSelection('2'); break;
        case 'o': this.processMainMenuSelection('18'); break;
        case 's': this.processMainMenuSelection('14'); break;
        case 'b': this.processMainMenuSelection('4'); break;
        case 't': this.processMainMenuSelection('8'); break;
        case 'c': this.processMainMenuSelection('15'); break;
        case 'e': this.processMainMenuSelection('1'); break;
        case 'w': this.processMainMenuSelection('16'); break;
        case 'v': this.processMainMenuSelection('20'); break;
        case 'p': this.processMainMenuSelection('5'); break;
        case 'a': this.processMainMenuSelection('6'); break;
        case 'r': this.processMainMenuSelection('7'); break;
        case 'h': this.processMainMenuSelection('10'); break;
        case 'd': this.processMainMenuSelection('3'); break;
    }
}


/**
 * the 'Submit Video' page
 * @constructor
 * @param {string[]} parameters - route parameters. parameters[0] is the youtube video ID
 */
function SubmitVideoPage(parameters) {

    window.boundEventListener = null;

    // mark video as 'is currently being added'
    interval = window.setInterval(() => {
        fetch(`/SubmitEpisode/currently_adding/${parameters[0]}`, { method: 'GET' })
    }, 12000);

    // prevent user from navigating away
    dontLetUserNavigateAway(this, this.askUserIfHeReallyWantsToLeave);

    // hide navigation, stretch main view
    const nav = document.getElementById('nav');
    if (nav) {
        removeClassIfExists(nav, 'w20');
        addClassIfNotExists(nav, 'display-none');
    }

    const main = document.getElementById('main');
    if (main) {
        removeClassIfExists(main, 'w80');
        addClassIfNotExists(main, 'w100');
    }

    // add beforeUnload event
    window.addEventListener('beforeunload', beforeUnloadEvent);

    // set all local variables
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
    new Html([
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
                    attr({
                        id: this.menuContainerId,
                        tabindex: 0,
                        style: 'outline: none;'
                    })
                )
            )
        )
    ]);


    /** @type {YoutubePlayer} */
    this.youtubePlayer = new YoutubePlayer(this.videoId);

    /** @type {SubmitVideoQuotesSection} */
    this.submitQuote = new SubmitVideoQuotesSection(this.quotesAndTopicsContainerId, this.videoId, this.youtubePlayer);

    /** @type {SubmitTopicSection} */
    this.submitTopic = new SubmitTopicSection(this.quotesAndTopicsContainerId, this.videoId);

    /** @type {HistoryTable} */
    this.history = new HistoryTable(this, this.videoId, this.quotesAndTopicsContainerId, this.youtubePlayer, this.itemWasRemovedFromHistory);

    /** @type {PlayerControls} */
    this.playerControls = new PlayerControls(this.playerAndSeedContainerId, this.youtubePlayer);

    /** @type {CurrentPlayer} */
    this.currentPlayerHandler = new CurrentPlayer(this, this.playerAndSeedContainerId, this.changePlayer);

    /** @type {ChangeSeed} */
    this.seedHandler = new ChangeSeed(this, this.playerAndSeedContainerId, this.youtubePlayer, this.seedHasChanged, this.history);


    // hard-coded resources for menus. the '&#818;' character underscores the character that comes before it
    this.staticResources.set(MAJOR_GAMEPLAY_EVENTS, [
        { id: '2', name: htmlDecode('I&#818;tem Collected'), x: 70, y: 0, w: 35, h: 35 },
        { id: '18', name: htmlDecode('Item To&#818;uched'), x: 595, y: 0, w: 35, h: 35 },
        { id: '4', name: htmlDecode('B&#818;ossfight'), x: 140, y: 0, w: 35, h: 35 },
        { id: '8', name: htmlDecode('T&#818;rinket Taken'), x: 280, y: 0, w: 35, h: 35 },
        { id: '15', name: htmlDecode('C&#818;haracter Reroll'), x: 385, y: 0, w: 35, h: 35 },
        { id: '14', name: htmlDecode('S&#818;ucked Up Item'), x: 350, y: 0, w: 35, h: 35 },
        { id: '1', name: htmlDecode('Northernlion DIE&#818;D'), x: 35, y: 0, w: 35, h: 35 },
        { id: '16', name: htmlDecode('Northernlion W&#818;ON'), x: 1155, y: 0, w: 35, h: 35 },
        { id: '3', name: htmlDecode('D&#818;own to the next floor!'), x: 105, y: 0, w: 35, h: 35 },
        { id: '20', name: htmlDecode('Other Ev&#818;ents'), x: 1190, y: 0, w: 35, h: 35 }
    ]);

    this.staticResources.set(USED_CONSUMABLES, [
        { id: '5', name: htmlDecode('P&#818;ill'), x: 175, y: 0, w: 35, h: 35 },
        { id: '6', name: htmlDecode('Ta&#818;rot Card'), x: 210, y: 0, w: 35, h: 35 },
        { id: '7', name: htmlDecode('R&#818;une'), x: 245, y: 0, w: 35, h: 35 },
        { id: '10', name: htmlDecode('Oth&#818;er Consumable'), x: 315, y: 0, w: 35, h: 35 }
    ]);

    this.staticResources.set(GAME_MODES, [
        { id: '8', name: 'Normal Game', x: 840, y: 0, w: 35, h: 35 },
        { id: '10', name: 'Greed Mode!', x: 875, y: 0, w: 35, h: 35 },
        { id: '5', name: 'A Special Challenge', x: 910, y: 0, w: 35, h: 35 },
        { id: '9', name: 'Community-Requested Challenge', x: 980, y: 0, w: 35, h: 35 },
        { id: '6', name: 'A Special Seed', x: 945, y: 0, w: 35, h: 35 },
        { id: '7', name: 'Something else / modded content', x: 1015, y: 0, w: 35, h: 35 },
        { id: '11', name: 'Daily Run', x: 1295, y: 0, w: 35, h: 35 }
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
        { id: 'yes', name: 'Yes, at least one!', x: 350, y: 0, w: 35, h: 35 },
        { id: 'no', name: 'No, move on!', x: 665, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(DID_BLACK_RUN_ABSORB_ANOTHER_ITEM, [
        { id: 'yes', name: 'Yes, another item was absorbed !', x: 350, y: 0, w: 35, h: 35 },
        { id: 'no', name: 'No, that was it!', x: 700, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(NO_CURSE, [
        { id: 'NoCurse', name: 'No Curse!', x: 735, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(DID_REROLL_TRIGGER_TRANSFORMATION, [
        { id: 'yes', name: 'Yes, at least one!', x: 525, y: 0, w: 35, h: 35 },
        { id: 'no', name: 'No, move on!', x: 665, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(DID_REROLL_TRIGGER_ANOTHER_TRANSFORMATION, [
        { id: 'yes', name: 'Yes, there was!', x: 525, y: 0, w: 35, h: 35 },
        { id: 'no', name: 'No, move on!', x: 665, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(CONFIRM_DOWN_TO_NEXT_FLOOR, [
        { id: 'confirm', name: 'Yes, down to the next floor!', x: 1050, y: 0, w: 35, h: 35 },
        { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 }
    ]);
    this.staticResources.set(OTHER_EVENTS, [
        { id: 'c', name: 'NL used the Clicker', x: 1225, y: 0, w: 35, h: 35 },
        { id: 'r', name: 'NL died and respawned (Extra Lives)', x: 1260, y: 0, w: 35, h: 35 }
    ]);
    this.staticResources.set(CONFIRM_NO_BOSSFIGHT_ON_THIS_FLOOR, [
        { id: 'confirm', name: 'Yes, there really was no bossfight', x: 1050, y: 0, w: 35, h: 35 },
        { id: 'cancel', name: 'No, CANCEL!', x: 1085, y: 0, w: 35, h: 30 }
    ]);
    this.staticResources.set(TAINTED_ISAAC_EVENTS, [
        { id: 'cancel', name: 'Nothing was replaced', x: 665, y: 0, w: 35, h: 35 }
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

    /** empty, all work is done in the constructor function because things need to be initialized in proper order. */
    renderPage: function () { },


    /** prompt the user to confirm leaving the page */
    askUserIfHeReallyWantsToLeave: function () {
        modal(false,
            Div(
                h2(
                    t('Warning! Progress will not be saved!')
                ),
                hr(),
                p(
                    t('Really leave this page?')
                ),
                button(
                    cl('btn-yellow'),
                    t('No, I want to stay!'),
                    event('click', e => { e.preventDefault(); hideModal(); })
                ),
                button(
                    cl('btn-red'),
                    t('Yes, Leave!'),
                    event('click', e => {
                        e.preventDefault();
                        window.removeEventListener('beforeunload', beforeUnloadEvent);
                        useRegularPopstateHandler();
                        hideModal();
                        goBack();
                    })
                )
            )
        )
    },


    /**
     * changes the player to player 1 or player 2
     * @param {number} player
     */
    changePlayer: function (player) {
        this.playerOneOrTwo = player;
    },


    /**
     * decides what to display when an element was removed from history
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
                this.menu_Main();
            }
        } else if (removedElement.characterIndex !== null && removedElement.floorIndex !== null && removedElement.eventIndex !== null && removedElement.eventType !== null) {
            // generic gameplay event was removed
            // generic events are safe to remove, except for the curse. here the 'select curse' menu must be displayed again
            if (removedElement.eventType === 3) {
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
            this.menu_Main();
        }
    },


    cleanup: function () {
        if (this.playerControls.autopause) {
            this.youtubePlayer.playVideo();
        }
        this.tempValue = null;
        this.wasRerolled = false;
        const player = document.getElementById('current-player-container');
        removeClassIfExists(player, 'display-none');
        this.seedHandler.showSeedInputElement();
    },


    /**
     * an often reused 'back to main menu' link
     * @param {string} [text] - replaces the 'Back to selection' link text
     */
    backToMainMenu: function (text) {
        
        return div(
            hr(),
            span(
                t('← ')
            ),
            span(
                t(text ? text : 'Back to selection'),
                cl('u', 'hand'),
                event('click', () => {
                    if (this.playerControls.autopause) {
                        this.youtubePlayer.playVideo();
                    }
                    this.menu_Main();
                })
            )
        );
    },


    /** an often reused checkbox that sets the 'wasRerolled' flag based on its checkbox */
    wasItemRerolled: function () {
        return div(
            input(
                attr({ type: 'checkbox' }),
                event('input', e => {
                    if (e.target.checked) {
                        this.wasRerolled = true;
                    } else {
                        this.wasRerolled = false;
                    }
                })
            ),
            span(
                t('The item was rerolled (for example with the ')
            ),
            span(
                t('D6'),
                style('color: red')
            ),
            span(
                t(')')
            )
        )
    },


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
        new Html([
            ...contents
        ], this.menuContainerId, true, true)
    },


    /** displays the 'What Character was Chosen?' menu */
    menu_WhatCharacterWasChosen: function () {
        this.display(
            H2(t('What character was chosen?')),
            Div(id('cb'), t(this.loading))
        );
        new Boxes(this, 'cb', this.process_CharacterWasChosen, this.getServerResource(`/Api/Resources/?ResourceType=2`), 1, false)
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
            Div(id('oe')),
            Div(
                this.backToMainMenu()
            )
        );

        new Boxes(this, 'oe', this.process_OtherGameplayEventWasChosen, this.getStaticResource(OTHER_EVENTS), 1, false, '/img/gameplay_events.png');
    },


    /**
     * processes the 'Other Event' selection and chooses what will be displayed next
     * @param {'clicker'|'reroll-transform'|'respawn'} otherEvent
     */
    process_OtherGameplayEventWasChosen: function(otherEvent) {
        if (otherEvent === 'c') {
            this.menu_WhatCharacterDidNlChangeInto();
        } else if (otherEvent === 'r') {
            this.menu_WhatKilledNlBeforeRespawning();
        } else {
            this.menu_Main();
        }
    },


    /** displays the 'What killed NL before respawning?' */
    menu_WhatKilledNlBeforeRespawning: function () {
        this.display(
            H2(t('How did NL die before respawning?')),
            Div(id('how-die'), t(this.loading)),
            Div(
                this.backToMainMenu()
            )
        );

        new Searchbox(this, this.process_WhatKilledNlBeforeRespawning, 1, this.getServerResource(`/Api/Resources/?ResourceType=11`), false, 'how-die');
    },


    /**
     * processes what enemy killed NL, then goes back to the main menu
     * @param {string} enemyId
     */
    process_WhatKilledNlBeforeRespawning: function (enemyId) {
        this.history.addEvent({
            EventType: 22,
            Player: this.playerOneOrTwo,
            RelatedResource1: enemyId
        });

        this.menu_Main();
    },


    /** displays the 'What character did NL change into after using the clicker?' menu */
    menu_WhatCharacterDidNlChangeInto: function () {
        this.display(
            H2(t('What character did NL change into after using the clicker?')),
            Div(id('clicker'), t(this.loading)),
            Div(
                this.backToMainMenu()
            )
        );
        new Boxes(this, 'clicker', this.process_ClickerCharacterChosen, this.getServerResource(`/Api/Resources/?ResourceType=2`), 1, false);
    },


    /**
     * processes the character that NL turned into after using the clicker, then goes back to the main menu
     * @param {string} characterId
     */
    process_ClickerCharacterChosen: function (characterId) {
        this.history.addEvent({
            EventType: 20,
            RelatedResource1: 'Clicker',
            RelatedResource2: characterId,
            Player: this.playerOneOrTwo
        });
        this.menu_Main();
    },


    /** displays the 'What Transformation did NL reroll into?' */
    menu_WhatTransformationDidNlRerollInto: function () {
        this.display(
            H2(t('What transformation did NL reroll into?')),
            Div(id('tra'), t(this.loading)),
            Div(
                this.backToMainMenu()
            )
        );
        new Boxes(this, 'tra', this.process_RerolledTransformationSelected, this.getServerResource(`/Api/Resources/?ResourceType=12`), 1, false);
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
        this.menu_Main();
    },


    /** displays the 'What floor did we start on?' menu */
    menu_ChooseFirstFloor: function () {
        const firstFloors = this.getServerResource(`/Api/Resources/?ResourceType=5&RequiredTags=271`);
        const allFloors = this.getServerResource(`/Api/Resources/?ResourceType=5`);

        this.display(
            H2(t('What floor did we start on?')),
            Div(id('first')),
            Div(id('all')),
            Div(
                this.backToMainMenu()
            )
        );
        new Boxes(this, 'first', this.process_FloorWasChosen, firstFloors, 1, false);
        new Searchbox(this, this.process_FloorWasChosen, 2, allFloors, false, 'all');
    },


    /** displays the 'choose next floor' menu */
    menu_ChooseNextFloor: function () {
        this.display(
            H2(t('What floor are we on?')),
            Div(id('common')),
            Div(id('all'))
        );

        new Boxes(this, 'common', this.process_FloorWasChosen, this.getStaticResource(NEXT_FLOORSET), 1, false);
        new Searchbox(this, this.process_FloorWasChosen, 2, this.getServerResource(`/Api/Resources/?ResourceType=5`), false, 'all');
    },


    /**
     * processes the chosen floor and decides what menu to display next
     * @param {string} floorId
     */
    process_FloorWasChosen: function (floorId) {
        this.history.addFloor({
            Duration: null,
            FloorId: floorId,
            GameplayEvents: []
        });

        // if it was an XL floor, add curse of the labyrinth. otherwise prompt the user to select a curse
        if (floorId.toLowerCase().endsWith('xl')) {
            this.process_CurseSelected('CurseOfTheLabyrinth');
        } else {
            this.menu_WasTheFloorCursed();
        }

        // now that we know the floor, preload common bosses for this floor
        get(`/Api/Resources/common-bosses-for-floor/${floorId}`, false, false).then(bossesForThisFloor => {
            if (bossesForThisFloor) {
                this.staticResources.set(COMMON_BOSSES, bossesForThisFloor.filter(boss => boss.tags && !boss.tags.some(tag => tag === 142)));
            } else {
                this.staticResources.set(COMMON_BOSSES, []);
            }
        });

        // ...and the next floorset
        get(`/Api/Resources/next-floorset/${floorId}`, false, false).then(floors => {
            if (floors) {
                this.staticResources.set(NEXT_FLOORSET, floors);
            } else {
                this.staticResources.set(NEXT_FLOORSET, []);
            }
        });
    },


    /** displays the 'Was the floor cursed?' menu */
    menu_WasTheFloorCursed: function () {
        const noCurse = this.getStaticResource(NO_CURSE);
        const allCurses = this.getServerResource(`/Api/Resources/?ResourceType=3`);

        this.display(
            H2(t('Was the floor cursed?')),
            Div(id('no')),
            Div(id('yes'))
        );

        new Boxes(this, 'no', this.process_CurseSelected, noCurse, 1, false, '/img/gameplay_events.png');
        new Searchbox(this, this.process_CurseSelected, 2, allCurses, false, 'yes');

        // focus on the 'no curse' box
        setTimeout(() => {
            const box = document.getElementById('b10');
            if (box) {
                box.focus();
            }
        }, 100);
    },


    /**
     * processes the selected curse and decides what menu to display next
     * @param {string} curseiId - the selected curse
     */
    process_CurseSelected: function (curseId) {
        if (curseId !== 'NoCurse') {
            this.history.addCurse({
                EventType: 9,
                Player: this.playerOneOrTwo,
                RelatedResource1: curseId
            });
        }

        if (this.history.weAreOnFirstFloor() && !this.history.currentCharacterHasSeed()) {
            this.menu_Seed();
        } else {
            this.menu_Main();
        }
    },


    menu_Seed: function () {
        this.display(
            H1(t('Did NL show the seed?')),
            P(t('If so, you can enter it here (it can be entered later at any point!)')),
            Div(
                div(
                    cl('display-inline'),
                    input(
                        attr({ type: 'text', maxlength: '4', id: 'seed-1', size: '4', spellcheck: 'false' }),
                        event('input', e => { this.uppercase(e); this.validateSeed(); this.skipToNextInput(e); })
                    ),
                    span(
                        t(' ')
                    ),
                    input(
                        attr({ type: 'text', maxlength: '4', id: 'seed-2', size: '4', spellcheck: 'false' }),
                        event('input', e => { this.uppercase(e); this.validateSeed(); }),
                        event('keydown', e => {
                            const btn = document.getElementById('submit-seed-button')
                            if (!btn.disabled) {
                                btn.click();
                            }
                        })
                    )
                ),
                button(
                    t('Use this seed!'),
                    attr({ disabled: 'true', id: 'submit-seed-button' }),
                    event('click', () => {
                        const seed = document.getElementById('seed-1').value + document.getElementById('seed-2').value;
                        this.process_Seed(seed);
                    })
                )
            ),
            Div(
                button(
                    t('No, Skip!'),
                    event('click', () => this.process_Seed(''))
                )
            )
        );

        document.getElementById('seed-1').focus();
    },


    /**
     * processes the chosen seed, then sends the player to the 'starting item' menu or the main menu
     * @param {string} seed
     */
    process_Seed: function (seed) {
        if (seed) {
            this.seedHandler.seedWasSelected(seed);
        }

        if (this.history.weAreOnFirstFloor() && !this.history.characterHasStartingItems()) {
            this.menu_WasThereAStartingItem();
        } else {
            this.menu_Main();
        }
    },


    /** displays the 'Did we start with any items?' menu */
    menu_WasThereAStartingItem: function () {
        this.display(
            H2(t('Did we start with any items?')),
            P(t('If not, click this button:')),
            Div(id('no')),
            Hr(),
            P(t('If yes, start choosing one of them:')),
            Div(id('yes'))
        );

        new Boxes(this, 'no', this.process_StartingItemSelected, this.getStaticResource(NO_STARTING_ITEMS), 1, false, '/img/gameplay_events.png');
        new Searchbox(this, this.process_StartingItemSelected, 3, this.getServerResource(`/Api/Resources/?ResourceType=6`), false, 'yes');
    },


    /**
     * processes the starting item, then 
     * - asks the user if there were more starting items
     * - or sends him along to the starting trinket selection
     * @param {string} itemId
     */
    process_StartingItemSelected: function (itemId) {
        if (itemId === 'none') {
            this.menu_WasThereAStartingTrinket();
        } else {
            this.history.addEvent({
                EventType: 2,
                RelatedResource1: itemId,
                RelatedResource2: 'StartingItem',
                Player: this.playerOneOrTwo,
                Rerolled: false
            });
            this.menu_WasThereAnotherStartingItem();
        }
    },


    /** displays the 'Was there another starting item?' menu */
    menu_WasThereAnotherStartingItem: function () {
        this.display(
            H2(t('Was there another starting item?')),
            Div(id('another'))
        );

        new Boxes(this, 'another', this.process_AnotherStartingItemChoice, this.getStaticResource(MORE_STARTING_ITEMS), 1, false, '/img/gameplay_events.png');
    },


    /**
     * processes the choice of the user and sends him to the next step
     * @param {'yes'|'no'} choice
     */
    process_AnotherStartingItemChoice: function (choice) {
        if (choice === 'yes') {
            this.menu_SelectAnotherStartingItem();
        } else {
            this.menu_WasThereAStartingTrinket();
        }
    },


    /** displays the 'Choose another starting item' menu */
    menu_SelectAnotherStartingItem: function () {
        this.display(
            H2(t('What other item did we start with?')),
            Div(id('yes')),
            Hr(),
            P(
                span(
                    t('There were no more items, skip!'),
                    cl('u', 'hand'),
                    event('click', () => this.process_StartingItemSelected('none'))
                )
            )
        );

        new Searchbox(this, this.process_StartingItemSelected, 3, this.getServerResource(`/Api/Resources/?ResourceType=6`), false, 'yes');
    },


    /** displays the 'Did we start with any trinkets?' menu */
    menu_WasThereAStartingTrinket: function () {
        this.display(
            H2(t('Did we start with any trinkets?')),
            P(t('If not, click this button:')),
            Div(id('no')),
            Hr(),
            P(t('If yes, start choosing one of them:')),
            Div(id('yes'))
        );

        new Boxes(this, 'no', this.process_StartingTrinketSelected, this.getStaticResource(NO_STARTING_TRINKETS), 1, false, '/img/gameplay_events.png');
        new Searchbox(this, this.process_StartingTrinketSelected, 3, this.getServerResource(`/Api/Resources/?ResourceType=13`), false, 'yes');
    },


    /**
     * processes the selected trinket and asks the user if there were any more starting trinkets
     * @param {string} trinketId
     */
    process_StartingTrinketSelected: function(trinketId) {
        if (trinketId === 'none') {
            this.menu_Main();
        } else {
            this.history.addEvent({
                EventType: 19,
                RelatedResource1: trinketId,
                Player: this.playerOneOrTwo
            });
            this.menu_WereThereMoreStartingTrinkets();
        }
    },


    /** displays the 'Where there more starting trinkets?' menu */
    menu_WereThereMoreStartingTrinkets: function () {
        this.display(
            H2(t('Was there another starting trinket?')),
            Div(id('another'))
        );

        new Boxes(this, 'another', this.process_MoreStartingTrinketsChoice, this.getStaticResource(MORE_STARTING_TRINKETS), 1, false, '/img/gameplay_events.png');
    },


    /**
     * processes the user choice whether there were more starting trinkets or not
     * @param {'yes'|'no'} choice
     */
    process_MoreStartingTrinketsChoice: function (choice) {
        if (choice === 'yes') {
            this.menu_WhatOtherStartingTrinketWasThere();
        } else {
            this.menu_Main();
        }
    },


    /** displays the 'Choose the next starting trinket' menu */
    menu_WhatOtherStartingTrinketWasThere: function () {
        this.display(
            H2(t('What other trinket did we start with?')),
            Div(id('yes')),
            Hr(),
            P(
                span(
                    t('There were no more trinkets, skip!'),
                    cl('u', 'hand'),
                    event('click', () => this.process_StartingTrinketSelected('none'))
                )
            )
        );

        new Searchbox(this, this.process_StartingTrinketSelected, 3, this.getServerResource(`/Api/Resources/?ResourceType=13`), false, 'yes');
    },
    

    /**
     * uppercases the content of an input[type=text] element
     * @param {Event} e - the raw input event
     */
    uppercase: function (e) {
        e.target.value = e.target.value.toUpperCase();
    },


    /** validates the seed of menu_Seed, disables the submit button if the seed isn't 8 characters */
    validateSeed: function () {
        const part1 = document.getElementById('seed-1');
        const part2 = document.getElementById('seed-2');
        const button = document.getElementById('submit-seed-button');
        if ((part1.value + part2.value).length !== 8) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    },

    
    /**
     * checks whether the seed input is 4 characters long and places the cursor into the next input field
     * @param {Event} e - the raw input event
     */
    skipToNextInput: function(e) {
        if (e.target.value.length === 4) {
            document.getElementById('seed-2').focus();
        }
    },


    /**
     * @param {string} s
     * @returns {string}
     */
    copyString: function (s) {
        return (' ' + s).slice(1);
    },

    /** Displays the main select screen that will be displayed after every gameplay event choice */
    menu_Main: function () {
        this.cleanup();
        const taintedIsaacEvents = this.getStaticResource(TAINTED_ISAAC_EVENTS);
        const gameplayEvents = this.getStaticResource(MAJOR_GAMEPLAY_EVENTS);
        const consumableEvents = this.getStaticResource(USED_CONSUMABLES);
        const currentCharacter = this.history.getCurrentCharacter();

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
                    cl('u', 'hand'),
                    id('launch-tutorial'),
                    event('click', () => {
                        this.highlightTutorial = false;
                        this.launchTutorial();
                    })
                )
            )
        );

        // focus on 'main menu container' and start listening to keyboard events
        const ct = document.getElementById(this.menuContainerId);
        if (ct) {
            ct.focus();
            boundEventListener = mainMenuKeyEvent.bind(this);
            ct.addEventListener('keydown', boundEventListener);
        }

        new Boxes(this, 'ge', this.processMainMenuSelection, gameplayEvents, 1, false, '/img/gameplay_events.png');
        new Boxes(this, 'ce', this.processMainMenuSelection, consumableEvents, 2, false, '/img/gameplay_events.png');
    },


    /**
     * Processes the selection made in the main menu and displays the correct menu depending on the choice
     * @param {string} selectedEvent - the box that was clicked in the main menu
     */
    processMainMenuSelection: function (selectedEvent) {

        // remove the main menu event listener
        const ct = document.getElementById(this.menuContainerId);
        if (ct && window.boundEventListener) {
            ct.removeEventListener('keydown', window.boundEventListener);
            window.boundEventListener = null;
        }

        // pause the youtube player if 'autopause' is true. don't pause on 'down to the next floor' prompt.
        if (this.playerControls.autopause && selectedEvent !== '3') {
            this.youtubePlayer.pauseVideo();
        }

        this.seedHandler.hideSeedInputElement();

        if (!selectedEvent) {
            this.menu_Main();
            return;
        }

        const selection = parseInt(selectedEvent, 10);

        switch (selection) {
            case 2: this.menu_WhereDidCollectedItemComeFrom(); break;
            case 18: this.menu_WhereDidCollectedTouchedItemComeFrom(); break;
            case 14: this.menu_HowWasItemAbsorbed(); break;
            case 4: this.menu_SelectBoss(); break;
            case 8: this.menu_SelectTrinket(); break;
            case 15: this.menu_HowWasTheCharacterRerolled(); break;
            case 1: this.menu_ConfirmNlDied(); break;
            case 16: this.menu_ConfirmNlWon(); break;
            case 3: this.process_CheckBossWasSelected(); break;
            case 5: this.menu_SelectPill(); break;
            case 6: this.menu_ChooseTarotCard(); break;
            case 7: this.menu_ChooseRune(); break;
            case 10: this.menu_ChooseOtherConsumable(); break;
            case 20: this.menu_WhatOtherEventHappened(); break;
            case 21: this.menu_WhatOtherEventHappened(); break;
            default: this.menu_Main(); break;
        }
    },

    menu_WhatItemDidTaintedIsaacPutDown: function() {
        const searchboxContent = this.getServerResource(`/Api/Resources/?ResourceType=6`);
        const boxesContent = this.getStaticResource(TAINTED_ISAAC_EVENTS);
        this.display(
            H2(
                t('Did this item replace one of Tainted Isaac\'s old items?')
            ),
            Div(id('no')),
            Hr(),
            P(
                t('If yes, what item was replaced?')
            ),
            Div(id('res')),
            Hr(),
            Div(
                this.backToMainMenu()
            )
        );

        new Boxes(this, 'no', this.process_WhatItemDidTaintedIsaacPutDown, boxesContent, 2, false, '/img/gameplay_events.png');
        new Searchbox(this, this.process_WhatItemDidTaintedIsaacPutDown, 1, searchboxContent, false, 'res', true);
    },

    process_WhatItemDidTaintedIsaacPutDown: function (item) {
        if (item !== 'cancel')  {
            this.history.addEvent({
                EventType: 23,
                RelatedResource1: item,
                RelatedResource2: this.tempValue,
                Player: this.playerOneOrTwo
            });
        }

        this.menu_Main();
    },

    menu_WhatItemReplacedTheOldItem: function() {
        const searchboxContent = this.getServerResource(`/Api/Resources/?ResourceType=6`);
        this.display(
            H2(
                span(t('What is ')),
                span(
                    t('the new item'), 
                    style('color: orange')
                ),
                span(t('?'))
            ),
            Div(id('res')),
            Hr(),
            Div(
                this.backToMainMenu()
            )
        );

        new Searchbox(this, this.process_WhatItemReplacedTheOldItem, 1, searchboxContent, false, 'res', true);
    },

    process_WhatItemReplacedTheOldItem: function(item) {
        this.history.addEvent({
            EventType: 23,
            RelatedResource1: item,
            RelatedResource2: this.tempValue,
            Player: this.playerOneOrTwo
        });
        this.tempValue = null;
        this.menu_Main();
    },

    /** checks if a boss was selected on the floor, and shows a warning if not */
    process_CheckBossWasSelected: function() {
        if (!this.history.currentFloorHasBossfight()) {
            this.display(
                H2(
                    t('Warning! No bossfight was selected for this floor.'),
                    style('color: orange')
                ),
                Hr(),
                P(t('Is this correct?')),
                Div(id('no-bf-bosses'))
            );
            new Boxes(this, 'no-bf-bosses', this.process_NoBossfightSelected, this.getStaticResource(CONFIRM_NO_BOSSFIGHT_ON_THIS_FLOOR), 1, false, '/img/gameplay_events.png');
        } else {
            this.menu_ConfirmNextFloor();
        }
    },


    /**
     * processes whether the user confirmed that there was indeed no bossfight on this floor
     * @param {'confirm'|'cancel'} choice 
     */
    process_NoBossfightSelected: function(choice) {
        if (choice === 'confirm') {
            this.menu_ConfirmNextFloor();
        } else {
            this.menu_Main();
        }
    },


    /** displays the 'confirm: we are going down to the next floor?' menu */
    menu_ConfirmNextFloor: function () {
        this.display(
            H2(t('Please Confirm: Down to the next floor?')),
            P(t('This cant be undone!')),
            Div(id('confirm'))
        );
        new Boxes(this, 'confirm', this.process_ConfirmNextFloorChoice, this.getStaticResource(CONFIRM_DOWN_TO_NEXT_FLOOR), 1, false, '/img/gameplay_events.png');
    },


    /**
     * processes whether the user confirmed going down to the next floor
     * @param {'confirm'|'cancel'} choice
     */
    process_ConfirmNextFloorChoice: function (choice) {
        if (choice === 'confirm') {
            this.menu_ChooseNextFloor();
        } else {
            this.menu_Main();
        }
    },


    /** displays the 'what pill was taken?' menu */
    menu_SelectPill: function () {
        this.display(
            H2(t('What pill was used?')),
            Div(id('pills')),
            Div(
                this.backToMainMenu()
            )
        );

        new Searchbox(this, this.process_PillTaken, 1, this.getServerResource(`/Api/Resources/?ResourceType=8`), false, 'pills');
    },


    /**
     * saves the pill, then sends the user back to the main menu
     * @param {string} pillId
     */
    process_PillTaken: function (pillId) {
        this.history.addEvent({
            EventType: 5,
            Player: this.playerOneOrTwo,
            RelatedResource1: pillId
        });

        this.menu_Main();
    },


    /** displays the 'What trinket was taken?' menu */
    menu_SelectTrinket: function () {
        this.display(
            H2(t('What trinket was taken?')),
            P(t('Only select trinkets that were used for a while, don\'t add trinkets thatwere just picked up briefly or on accident.')),
            Div(id('trinkets')),
            Div(
                this.backToMainMenu()
            )
        );

        new Searchbox(this, this.process_TrinketSelected, 1, this.getServerResource(`/Api/Resources/?ResourceType=13`), false, 'trinkets');
    },


    /**
     * saves the selected trinket and sends the user back to the main menu
     * @param {string} trinketId
     */
    process_TrinketSelected: function (trinketId) {
        this.history.addEvent({
            EventType: 8,
            RelatedResource1: trinketId,
            Player: this.playerOneOrTwo
        });

        this.menu_Main();
    },


    /** displays the 'What boss was encountered?' menu */
    menu_SelectBoss: function () {
        this.display(
            H2(t('What boss was encountered?')),
            P(t('Common bosses for this floor:')),
            Div(id('common')),
            P(t('All Bosses:')),
            Div(id('all')),
            P(
                cl('gray'),
                span(
                    t('❔ ')
                ),
                span(
                    t('I don\'t know what to do!'),
                    cl('u', 'hand'),
                    event('click', () => { this.youtubePlayer.pauseVideo(); helpSelectBoss(); })
                )
            ),
            Div(
                this.backToMainMenu()
            )
        );

        new Boxes(this, 'common', this.process_Bossfight, this.getStaticResource(COMMON_BOSSES), 1, false);
        new Searchbox(this, this.process_Bossfight, 2, this.getServerResource(`/Api/Resources/?ResourceType=1`), false, 'all');
    },


    /**
     * saves the bossfight, then sends the user back to the main menu
     * @param {string} bossId
     */
    process_Bossfight: function (bossId) {
        this.history.addEvent({
            EventType: 4,
            RelatedResource1: bossId
        });

        this.menu_Main();
    },


    /** displays the 'Where did the touched item come from?' menu */
    menu_WhereDidCollectedTouchedItemComeFrom: function () {
        this.display(
            H2(t('Where did the touched item come from?')),
            P(t('Common Item Sources')),
            Div(id('common'), t(this.loading)),
            P(t('All Sources')),
            Div(id('all'), t(this.loading)),
            P(
                cl('gray'),
                span(
                    t('❔ ')
                ),
                span(
                    t('I don\'t know what to select!'),
                    cl('u', 'hand'),
                    event('click', () => { this.youtubePlayer.pauseVideo(); helpSelectItemsource(); })
                )
            ),
            Div(
                this.backToMainMenu()
            )
        );

        const resources = this.getServerResource(`/Api/Resources/?ResourceType=7`);
        new Boxes(this, 'common', this.process_CollectedTouchedItemSource, resources, 1, false, undefined, 15);
        new Searchbox(this, this.process_CollectedTouchedItemSource, 2, resources, false, 'all');
    },


    /**
     * saves the selected itemsource and displays the next menu
     * @param {string} itemSourceId
     */
    process_CollectedTouchedItemSource: function (itemSourceId) {
        this.tempValue = itemSourceId;
        this.menu_WhatItemWasTouched();
    },


    /** displays the 'What item was touched?' menu */
    menu_WhatItemWasTouched: function () {
        this.display(
            H2(t('What spacebar item was touched and put down right after?')),
            Div(
                this.wasItemRerolled(),
            ),
            Div(id('items'), t(this.loading)),
            P(
                cl('gray'),
                span(
                    t('❔ ')
                ),
                span(
                    t('I don\'t know what to do!'),
                    cl('u', 'hand'),
                    event('click', () => { this.youtubePlayer.pauseVideo(); helpSelectTouchedItem(); })
                )
            ),
            Hr(),
            P(
                style('font-size: 0.75rem;'),
                t('"Touched" means picking it up briefly to get the item out of the item pool, or to get it\'s transformation bonuses.'),
                br(),
                br(),
                t('Example: Buying "Guppy\'s Paw" from the Deal with the Devil and leaving it behind, just to get one step closer to the Guppy transformation.'),
                br(),
            ),
            Div(
                this.backToMainMenu()
            )
        );

        new Searchbox(this, this.process_TouchedItemSelected, 1, this.getServerResource(`/Api/Resources/?ResourceType=6&RequiredTags=139`), false, 'items', true)
    },


    /**
     * saves the touched item and its itemsource, then sends the user back to the main menu
     * @param {string} itemId
     */
    process_TouchedItemSelected: function (itemId) {
        this.history.addEvent({
            EventType: 18,
            Player: this.playerOneOrTwo,
            RelatedResource1: itemId,
            RelatedResource2: this.copyString(this.tempValue),
            Rerolled: this.wasRerolled
        });
        this.menu_Main();
    },


    /** displays the 'Where did the item come from?' menu */
    menu_WhereDidCollectedItemComeFrom: function () {
        this.display(
            H2(t('Where did the item come from?')),
            P(t('Common Item Sources')),
            Div(id('common'), t(this.loading)),
            P(t('All Sources')),
            Div(id('all'), t(this.loading)),
            P(
                cl('gray'),
                span(
                    t('❔ ')
                ),
                span(
                    t('I don\'t know what to select!'),
                    cl('u', 'hand'),
                    event('click', () => { this.youtubePlayer.pauseVideo(); helpSelectItemsource(); })
                )
            ),
            Div(
                this.backToMainMenu()
            )
        );

        const resources = this.getServerResource(`/Api/Resources/?ResourceType=7`);
        new Boxes(this, 'common', this.process_CollectedItemSource, resources, 1, false, undefined, 15);
        new Searchbox(this, this.process_CollectedItemSource, 2, resources, false, 'all');
    },


    /**
     * saves the selected itemsource and displays the next menu
     * @param {string} itemSourceId
     */
    process_CollectedItemSource: function (itemSourceId) {
        this.tempValue = itemSourceId;
        this.menu_WhatItemWasCollected();
    },


    /** displays the 'What item was collected?' menu */
    menu_WhatItemWasCollected: function () {
        this.display(
            Div(
                h2(t('What item was collected?')),
                this.wasItemRerolled(),
                div(id('items'), t(this.loading)),
                p(
                    cl('gray'),
                    span(
                        t('❔ ')
                    ),
                    span(
                        t('I don\'t know what to do!'),
                        cl('u', 'hand'),
                        event('click', () => { this.youtubePlayer.pauseVideo(); helpSelectItem(); })
                    )
                ),
                this.backToMainMenu()
            )
        );

        new Searchbox(this, this.process_CollectedItemSelected, 1, this.getServerResource(`/Api/Resources/?ResourceType=6`), false, 'items')
    },


    /**
     * saves the collected item and its itemsource, then sends the user back to the main menu
     * @param {string} itemId
     */
    process_CollectedItemSelected: function (itemId) {
        this.history.addEvent({
            EventType: 2,
            Player: this.playerOneOrTwo,
            RelatedResource1: itemId,
            RelatedResource2: this.copyString(this.tempValue),
            Rerolled: this.wasRerolled
        });

        const currentCharacter = this.history.getCurrentCharacter();

        if (currentCharacter.CharacterId === 'TaintedIsaac') {
            this.tempValue = itemId;
            this.menu_WhatItemDidTaintedIsaacPutDown();
        } else {
            this.menu_Main();
        }
    },


    /** displays the 'How was the item absorbed?' menu */
    menu_HowWasItemAbsorbed: function () {
        this.display(
            Div(
                h2(t('How was the item absorbed?')),
                div(id('ab'), t(this.loading)),
                this.backToMainMenu()
            )
            
        );

        new Boxes(this, 'ab', this.process_HowWasItemAbsorbed, this.getServerResource(`/Api/Resources/?ResourceType=0&RequiredTags=148`), 1, false);
    },


    /**
     * processes how the item was absorbed. Special treatment for black rune!
     * @param {string} absorberId
     */
    process_HowWasItemAbsorbed: function (absorberId) {
        if (absorberId === 'BlackRune') {
            this.process_ChosenRune('BlackRune');
        } else {
            this.tempValue = absorberId;
            this.menu_WhatItemWasAbsorbed();
        }
    },


    /** displays the 'What item was absorbed?' menu */
    menu_WhatItemWasAbsorbed: function () {
        this.display(
            Div(
                h2(t('What item was absorbed?')),
                this.wasItemRerolled(),
                div(id('what'), t(this.loading)),
                p(
                    cl('gray'),
                    span(
                        t('❔ ')
                    ),
                    span(
                        t('I don\'t know what to do!'),
                        cl('u', 'hand'),
                        event('click', () => { this.youtubePlayer.pauseVideo(); helpSelectAbsorbedItemModal(); })
                    )
                ),
                this.backToMainMenu(),
            )
        );

        new Searchbox(this, this.process_AbsorbedItem, 1, this.getServerResource(`/Api/Resources/?ResourceType=6`), false, 'what');
    },


    /**
     * processes the absorbed item
     * @param {string} itemId
     */
    process_AbsorbedItem: function (itemId) {
        this.history.addEvent({
            EventType: 14,
            Rerolled: this.wasRerolled,
            RelatedResource2: this.copyString(this.tempValue),
            RelatedResource1: itemId,
            Player: this.playerOneOrTwo
        });

        this.menu_WasAnotherItemAbsorbed();
    },


    /** displays the 'Did another item get absorbed?' menu */
    menu_WasAnotherItemAbsorbed: function () {
        this.display(
            H2(t('Did another item get absorbed?')),
            Div(id('another'))
        );

        new Boxes(this, 'another', this.process_WasAnotherItemAbsorbed, this.getStaticResource(DID_BLACK_RUN_ABSORB_ANOTHER_ITEM), 1, false, '/img/gameplay_events.png');
    },


    /**
     * asks the user for the next item that was absorbed or sends him back to the main menu
     * @param {'yes'|'no'} choice
     */
    process_WasAnotherItemAbsorbed: function (choice) {
        if (choice === 'no') {
            this.menu_Main();
        } else {
            this.menu_WhatItemWasAbsorbed();
        }
    },


    /** displays the 'What rune was chosen?' menu */
    menu_ChooseRune: function() {
        this.display(
            H2(t('What rune was used?')),
            Div(id('ru')),
            Div(
                this.backToMainMenu()
            )
        );

        new Searchbox(this, this.process_ChosenRune, 1, this.getServerResource(`/Api/Resources/?ResourceType=9`), false, 'ru');
    },


    /**
     * processes the chosen rune and decides what menu do display next.
     * if the rune was 'Black Rune', ask if the rune absorbed an item
     * @param {string} runeId
     */
    process_ChosenRune: function(runeId) {
        this.history.addEvent({
            EventType: 7,
            Player: this.playerOneOrTwo,
            RelatedResource1: runeId
        });

        if (runeId === 'BlackRune') {
            this.tempValue = runeId;
            this.menu_DidBlackRuneAbsorbAnItem();
            return;
        }

        this.menu_Main();
    },


    /** displays the 'did the black rune absorb an item' menu */
    menu_DidBlackRuneAbsorbAnItem: function () {
        this.display(
            H2(t('Did "Black Rune" absorb an item?')),
            Div(id('rune'))
        );

        new Boxes(this, 'rune', this.process_DidBlackRuneAbsorbAnItem, this.getStaticResource(DID_BLACK_RUN_ABSORB_AN_ITEM), 1, false, '/img/gameplay_events.png');
    },


    /**
     * displays the next menu based on whether the black rune absorbed an item or not
     * @param {'yes'|'no'} choice
     */
    process_DidBlackRuneAbsorbAnItem: function (choice) {
        if (choice === 'no') {
            this.menu_Main();
        } else {
            this.menu_WhatItemDidBlackRuneAbsorb();
        }
    },


    /** displays the 'What item did "Black Rune" absorb?' menu */
    menu_WhatItemDidBlackRuneAbsorb: function () {
        this.display(
            H2(t('What item did "Black Rune" absorb?')),
            Div(this.wasItemRerolled()),
            Div(id('br')),
            Div(
                this.backToMainMenu('Nothing (else) was absorbed, cancel!')
            )
        );

        new Searchbox(this, this.process_BlackRuneAbsorbedItem, 1, this.getServerResource(`/Api/Resources/?ResourceType=6`), false, 'br');
    },


    /**
     * processes the item that was absorbed by black rune, then asks the user if another item was absorbed
     * @param {string} itemId
     */
    process_BlackRuneAbsorbedItem: function (itemId) {
        this.history.addEvent({
            EventType: 14,
            Rerolled: this.wasRerolled,
            RelatedResource2: 'BlackRune',
            RelatedResource1: itemId,
            Player: this.playerOneOrTwo
        });

        this.menu_DidBlackRuneAbsorbAnotherItem();
    },


    /** displays the 'Did Black Rune absorb another item?' menu */
    menu_DidBlackRuneAbsorbAnotherItem: function () {
        this.display(
            H2(t('Did "Black Rune" absorb another item?')),
            Div(id('another'))
        );

        new Boxes(this, 'another', this.process_DidBlackRuneAbsorbAnItem, this.getStaticResource(DID_BLACK_RUN_ABSORB_ANOTHER_ITEM), 1, false, '/img/gameplay_events.png');
    },


    /** displays the 'What Other Consumable was used?' menu */
    menu_ChooseOtherConsumable: function() {
        this.display(
            H2(t('What consumable was used?')),
            Div(id('other')),
            Div(
                this.backToMainMenu()
            )
        );

        new Searchbox(this, this.process_OtherConsumableChosen, 1, this.getServerResource(`/Api/Resources/?ResourceType=15`), false, 'other');
    },

    /**
     * processes the 'other consumable' that was chosen and sends the user back to the main menu
     * @param {string} consumableId
     */
    process_OtherConsumableChosen: function(consumableId) {
        if (consumableId) {
            this.history.addEvent({
                EventType: 10,
                Player: this.currentPlayer,
                RelatedResource1: consumableId
            });
        }

        this.menu_Main();
    },


    /** displays the 'How did NL reroll his character' menu */
    menu_HowWasTheCharacterRerolled: function () {
        this.display(
            H2(t('How was the character rerolled?')),
            Div(id('rerolls')),
            Div(
                this.backToMainMenu()
            )
        );

        new Boxes(this, 'rerolls', this.process_CharacterRerollWasChosen, this.getServerResource(`/Api/Resources/?ResourceType=14`), 1, false);
    },


    /**
     * processes the chosen character reroll and asks the user if the character reroll triggered a transformation
     * @param {string} rerollId
     */
    process_CharacterRerollWasChosen: function (rerollId) {
        this.tempValue = rerollId;

        this.history.addEvent({
            EventType: 15,
            RelatedResource1: rerollId,
            Player: this.playerOneOrTwo
        });

        this.menu_DidRerollTriggerTransformation();
    },


    /** displays the 'Did the character reroll trigger a transformation?' menu */
    menu_DidRerollTriggerTransformation: function () {
        this.display(
            H2(t('Did the character reroll trigger a transformation?')),
            P(t('for example: NL rerolled into a bunch of "Fly" items and is now "Lord of the Flies".')),
            Div(id('rr'))
        );

        new Boxes(this, 'rr', this.process_RerollTriggeredTransformationChoice, this.getStaticResource(DID_REROLL_TRIGGER_TRANSFORMATION), 1, false, '/img/gameplay_events.png');
    },


    /**
     * if user choses 'yes', sends him to the menu that asks him to enter the transformation
     * if user choses 'no', sends him to the main menu
     * @param {'yes'|'no'} choice
     */
    process_RerollTriggeredTransformationChoice: function (choice) {
        if (choice === 'no') {
            this.menu_Main();
        } else {
            this.menu_WhatTransformationDidNlRerollInto();
        }
    },


    /** displays the 'What transformation did NL reroll into?' menu */
    menu_WhatTransformationDidNlRerollInto: function () {
        this.display(
            H2(t('What transformation did NL reroll into?')),
            Div(id('tr')),
            Div(
                this.backToMainMenu('no transformation happened, cancel!')
            )
        );

        new Searchbox(this, this.process_RerollTransformationChosen, 1, this.getServerResource(`/Api/Resources/?ResourceType=12`), false, 'tr');
    },


    /**
     * processes the transformation that happened after the reroll, then asks the user if there were more transformations
     * @param {string} transformationId
     */
    process_RerollTransformationChosen: function (transformationId) {
        this.history.addEvent({
            EventType: 21,
            RelatedResource1: this.copyString(this.tempValue),
            RelatedResource2: transformationId,
            Player: this.playerOneOrTwo
        });

        this.menu_WereThereMoreTransformationsNlRerolledInto();
    },


    /** displays the 'Was there another transformation NL rerolled into?' menu */
    menu_WereThereMoreTransformationsNlRerolledInto: function () {
        this.display(
            H2(t('Was there another transformation?')),
            Div(id('more'))
        );

        new Boxes(this, 'more', this.process_RerollTriggeredTransformationChoice, this.getStaticResource(DID_REROLL_TRIGGER_ANOTHER_TRANSFORMATION), 1, false, '/img/gameplay_events.png');
    },


    /** displays the 'What tarot card was used' menu */
    menu_ChooseTarotCard: function () {
        this.display(
            H2(t('What card was used?')),
            Div(id('cards')),
            Div(
                this.backToMainMenu()
            )
        )

        new Searchbox(this, this.process_TarotCardChosen, 1, this.getServerResource(`/Api/Resources/?ResourceType=10`), false, 'cards');
    },


    /**
     * processes the chosen tarot card and sends the user back to the main menu
     * @param {string} cardId
     */
    process_TarotCardChosen: function (cardId) {
        this.history.addEvent({
            EventType: 6,
            Player: this.playerOneOrTwo,
            RelatedResource1: cardId
        });
        this.menu_Main();
    },


    /** displays the 'Confirm: NL Won?' menu */
    menu_ConfirmNlWon: function () {
        this.display(
            H2(t('Please confirm: NL WON the run?')),
            Div(id('won')),
            Div(
                this.backToMainMenu()
            )
        );
        new Boxes(this, 'won', this.process_ConfirmNlWon, this.getStaticResource(CONFIRM_NL_WON), 1, false, '/img/gameplay_events.png');
    },


    /**
     * processes the user choice and displays the next menu
     * @param {'confirm'|'cancel'} choice
     */
    process_ConfirmNlWon: function (choice) {
        if (choice === 'cancel') {
            this.menu_Main();
        } else {
            this.menu_DidNlDoAnotherRun();
        }
    },


    /** displays the 'Did NL do another run?' menu */
    menu_DidNlDoAnotherRun: function () {
        this.display(
            H2(t('Did NL do another run?')),
            Div(id('another'))
        );

        new Boxes(this, 'another', this.process_AnotherRunChoice, this.getStaticResource(WAS_THERE_ANOTHER_RUN), 1, false, '/img/gameplay_events.png');
    },


    /**
     * displays the next menu depending if there was another run or not
     * @param {'run'|'victory-lap'|'end'} choice
     */
    process_AnotherRunChoice: function (choice) {
        if (choice === 'victory-lap') {
            this.menu_ConfirmVictoryLap();
        } else if (choice === 'run') {
            this.menu_ConfirmAnotherRun();
        } else {
            this.menu_ConfirmVideoEnded();
        }
    },


    /** displays the 'Confirm that NL did a victory lap' menu */
    menu_ConfirmVictoryLap: function () {
        this.display(
            H2(t('Please Confirm: NL did a victory lap')),
            Div(id('vic'))
        );

        new Boxes(this, 'vic', this.process_VictoryLapConfirm, this.getStaticResource(CONFIRM_VICTORY_LAP), 1, false, '/img/gameplay_events.png');
    },


    /**
     * displays the next menu based on the choice
     * @param {'confirm'|'cancel'} choice
     */
    process_VictoryLapConfirm: function (choice) {
        if (choice === 'cancel') {
            this.menu_DidNlDoAnotherRun();
        } else {
            this.history.addDurationToCurrentFloor();
            this.menu_ChooseNextFloor();
        }
    },


    /** displays the 'Confirm that NL did another run' menu */
    menu_ConfirmAnotherRun: function () {
        this.display(
            H2(t('Please Confirm: NL did another run?')),
            Div(id('run'))
        );

        new Boxes(this, 'run', this.process_NlDidAnotherRunConfirmation, this.getStaticResource(CONFIRM_ANOTHER_RUN), 1, false, '/img/gameplay_events.png');
    },


    /**
     * displays the next menu based on the choice
     * @param {'confirm'|'cancel'} choice
     */
    process_NlDidAnotherRunConfirmation: function (choice) {
        if (choice === 'cancel') {
            this.menu_DidNlDoAnotherRun();
        } else {
            this.history.addDurationToCurrentFloor();
            this.menu_WhatCharacterWasChosen();
        }
    },


    /** displays the 'Confirm that the video ended' menu */
    menu_ConfirmVideoEnded: function () {
        this.display(
            H2(t('Please Confirm: The video ended here?')),
            Div(id('end'))
        );

        new Boxes(this, 'end', this.process_VideoEndedConfirmation, this.getStaticResource(CONFIRM_RUN_ENDED), 1, false, '/img/gameplay_events.png');
    },


    /**
     * displays the next menu based on the choice
     * @param {'confirm'|'cancel'} choice
     */
    process_VideoEndedConfirmation: function (choice) {
        if (choice === 'cancel') {
            this.menu_DidNlDoAnotherRun();
        } else {
            this.menu_SubmitEpisode();
        }
    },


    /** displays the 'Submit Episode' menu */
    menu_SubmitEpisode: function () {
        this.display(
            H2(t('Episode Complete')),
            P(t('...and ready to submit! Just click here:')),
            Div(
                button(
                    t('Submit Episode'),
                    event('click', e => this.process_SubmitEpisode(e))
                )
            )
        )
    },


    /**
     * submits the episode
     * @param {Event} e - the button click event
     */
    process_SubmitEpisode: function (e) {
        e.target.disabled = true;
        const episodeData = JSON.stringify(this.history.dataForThisEpisode);
        postResponse('/SubmitEpisode', episodeData, true).then(response => {
            if (response.ok) {
                this.menu_SubmitEpisodeSucceeded();
            } else {
                response.text()
                    .then(msg => this.menu_SubmitEpisodeFailed(msg))
                    .catch(() => this.menu_SubmitEpisodeFailed('Unknown error'));
            }
        }).catch(e => {
            console.error(e);
            this.menu_SubmitEpisodeFailed('The server could not be reached or you are offline');
        });
    },


    /**
     * tells the user that the submission failed - including an error message
     * user can try to re-submit
     * @param {string} msg
     */
    menu_SubmitEpisodeFailed: function (msg) {
        this.display(
            H2(
                t('Submission failed!'),
                style('color: orange'),
                id('header')
            ),
            P(
                id('message'),
                t('The error message is:'),
                br(),
                t(msg || 'I have no idea what happened.')
            ),
            Div(
                button(
                    t('Try Again!'),
                    event('click', e => {
                        document.getElementById('header').innerText = 'Resubmitting......';
                        document.getElementById('message').innerHTML = '';
                        this.process_SubmitEpisode(e);
                    })
                )
            )
        );
    },


    /** displays the 'submission succeeded!' menu */
    menu_SubmitEpisodeSucceeded: function () {

        // user is allowed to leave the page unpromptet now:
        window.removeEventListener('beforeunload', beforeUnloadEvent);
        useRegularPopstateHandler();

        this.display(
            H2(t('Submission Succeeded!')),
            Div(
                p(
                    t('Thank you very much for contributing!'),
                    br(),
                    br(),
                    a(
                        t('Click here to see the results'),
                        cl('u', 'hand'),
                        event('click', e => {
                            navigate(new Link().episode(this.videoId), e, PAGE_TYPE_EPISODE);
                        })
                    )
                )
            )
        )
    },


    /** displays the 'Confirm NL DIED?' menu */
    menu_ConfirmNlDied: function () {
        this.display(
            H2(t('Please Confirm: NL DIED?')),
            P(
                t('Only confirm this if the death '),
                span(
                    t('ended the run'),
                    style('color: orange')
                ),
                t('! If the character respawned (thanks to extra lives), go back and choose '),
                span(
                    t('"Other Event"'),
                    style('color: orange')
                ),
                t('.')
            ),
            Div(id('died')),
            Div(
                this.backToMainMenu()
            )
        );

        new Boxes(this, 'died', this.process_ConfirmNlDied, this.getStaticResource(CONFIRM_NL_DIED), 1, false, '/img/gameplay_events.png');
    },


    /**
     * processes the choice the user made and shows the next menu
     * @param {'confirm'|'cancel'} choice
     */
    process_ConfirmNlDied: function (choice) {
        if (choice === 'cancel') {
            this.menu_Main();
        } else {
            this.menu_WhatKilledNl();
        }
    },


    /** displays the 'What Killed NL?' menu */
    menu_WhatKilledNl: function () {
        this.display(
            H2(t('How did he die?')),
            P(t('Hint: If you can\'t find an enemy in the list, it might still be missing - choose "Missing Death".')),
            Div(id('how')),
            Div(
                this.backToMainMenu()
            )
        );

        new Searchbox(this, this.process_EnemySelected, 1, this.getServerResource(`/Api/Resources/?ResourceType=11`), false, 'how');
    },


    /**
     * processes the selected enemy, then asks the user if there was another run
     * @param {string} enemyId
     */
    process_EnemySelected: function (enemyId) {
        this.history.addEvent({
            EventType: 1,
            RelatedResource1: enemyId
        });

        this.menu_DidNlDoAnotherRun();
    },


    /** the main menu tutorial, powered by Driver.js */
    launchTutorial: function () {
        this.youtubePlayer.pauseVideo();

        const driver = new Driver({ allowClose: false });
        driver.defineSteps([
            {
                element: '#b10',
                popover: {
                    title: 'Collected Item',
                    description: 'If NL collects an item, click here!',
                    position: 'left'
                }
            },
            {
                element: '#b11',
                popover: {
                    title: 'Touched Item',
                    description: 'If NL only touches a spacebar item and puts it down again (to get transformation bonuses or to take it out of the item pool), click here!',
                    position: 'left'
                }
            },
            {
                element: '#b12',
                popover: {
                    title: 'Bossfight',
                    description: 'If NL encounters a boss, click here (even if he doesn\'t win or doesn\'t finish the fight!).',
                    position: 'left'
                }
            },
            {
                element: '#b13',
                popover: {
                    title: 'Trinkets',
                    description: 'If NL switches out his trinket, click here! Only trinkets that NL used for a while count!',
                    position: 'left'
                }
            },
            {
                element: '#b14',
                popover: {
                    title: 'Character Reroll',
                    description: 'Did NL use the D4 / D100 / the 6-Room or did "Missing No." trigger at the beginning of the floor? That\'s what this is for!',
                    position: 'left'
                }
            },
            {
                element: '#b15',
                popover: {
                    title: 'Absorbed Items',
                    description: 'This box is for items that got absorbed by Void or Black Rune!',
                    position: 'left'
                }
            },
            {
                element: '#b16',
                popover: {
                    title: 'DIED!',
                    description: 'If NL got killed and the run ended, click this box to choose how he got killed!',
                    position: 'left'
                }
            },
            {
                element: '#b17',
                popover: {
                    title: 'WON!',
                    description: 'Northernlion killed a final boss and won the run? click here!',
                    position: 'left'
                }
            },
            {
                element: '#b18',
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
                element: '#b19',
                popover: {
                    title: 'Other Events',
                    description: 'Everything that doesn\'t fit anywhere else. Currently used for: Respawning after death (thanks to extra lives), '
                        + 'and changing the character with the "Clicker".',
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
                        + 'back 5 seconds, ▶️ and ⏸️ play and pause the video. The checkbox pauses the video every time you select an item.',
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
                        + 'Removing a floor or a character ' // REMOVED FOR NOW: will also remove all events that happend on that floor, or everything that happened to that character! (a confirmation dialog will appear in those cases.)',
                        + 'is not possible, because it screws up the recorded floor timestamps. Just be aware of that :)',
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



function registerSubmitVideoPage() {
    const cleanup = () => {

        // reset layout
        const nav = document.getElementById('nav');
        if (nav) {
            addClassIfNotExists(nav, 'w20');
            removeClassIfExists(nav, 'display-none');
        }

        const main = document.getElementById('main');
        if (main) {
            removeClassIfExists(main, 'w100');
            addClassIfNotExists(main, 'w80');
        }

        // remove beforeUnload event
        window.removeEventListener('beforeunload', beforeUnloadEvent);

        // clear 'video is currently being added' interval
        if (interval) {
            clearInterval(interval)
        }
    }

    registerPage(SubmitVideoPage, 'Loading data...', ['SubmitVideo', '{id}'], undefined, cleanup);
}


(() => {
    registerSubmitVideoPage();
})();


export {
    SubmitVideoPage,
    registerSubmitVideoPage
}

