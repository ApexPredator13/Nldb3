import { SubmitVideoPage } from "../../Pages/submit-video.js"
import { resourceTypeToString } from "../../Enums/enum-to-string-converters";
import { post } from "../../Framework/http";
import { Render, Div, id, t, table, td, tr, cl, p, modal, h2, hr, button, hideModal, div, attr } from "../../Framework/renderer";
import { isaacImage } from "../General/isaac-image";
import "../../Framework/Customizable/typedefs";
import { YoutubePlayer } from "./youtube-player";

/**
 * @typedef {function(RemoveHistoryElement):*} HistorySubscriber
 */


/**
 * Saves everything that happened in an episode and displays it in a table
 * @constructor
 * @param {SubmitVideoPage} caller - the THIS context of the subscriber
 * @param {string} videoId - ID of the youtube video
 * @param {string} historyTableContainerId - the container the table will be rendered into
 * @param {YoutubePlayer} youtubePlayer - the youtube player instance
 * @param {HistorySubscriber} subscriberFunction - the function that will be notified after an element was deleted
 */
function HistoryTable(caller, videoId, historyTableContainerId, youtubePlayer, subscriberFunction) {

    /** @type {SubmitVideoPage}  */
    this.caller = caller;

    /** @type {HistorySubscriber} */
    this.subscriberFunction = subscriberFunction;

    /** @type {YoutubePlayer} */
    this.youtubePlayer = youtubePlayer;

    /** @type {EpisodeData} */
    this.dataForThisEpisode = {
        VideoId: videoId,
        PlayedCharacters: []
    };


    // renders the initial content
    new Render([
        Div(
            id('history-container'),

            p(
                t('Event History - click on items to remove them')
            ),
            table(
                id('history'),
                tr(
                    td(
                        t('Nothing was added yet.')
                    )
                )
            )
        )
    ], historyTableContainerId);
}





HistoryTable.prototype = {

    /**
     * notifys all subscribers about a deleted history enty
     * @param {RemoveHistoryElement} data - data that should be emitted to all subscribers
     */
    notifySubscribersOfDeletion: function (data) {
        if (this.subscriberFunction) {
            this.subscriberFunction.call(this.caller, data);
        }
    },


    /**
     * adds a new character to the history
     * @param {SubmittableCharacter} character - the character that was chosen for the run
     */
    addCharacter: function(character) {
        this.dataForThisEpisode.PlayedCharacters.push(character);
        this.reloadHistory();
    },


    /**
     * adds a new floor to the current character
     * @param {SubmittableFloor} floor - the floor that should be added to the current character
     */
    addFloor: function(floor) {

        // add time to finished floor
        const currentFloor = this.getCurrentFloor();
        if (currentFloor) {
            const currentPlayerTime = this.youtubePlayer.getCurrentTime();
            const timeSoFar = this.recordedFloorTimeSoFar();
            const timeSpentOnThisFloor = currentPlayerTime - timeSoFar;
            currentFloor.Duration = timeSpentOnThisFloor;
        }

        // then add the next
        const currentCharacter = this.getCurrentCharacter();
        currentCharacter.PlayedFloors.push(floor);
        this.reloadHistory();
    },

    /**
     * adds a curse to the current floor
     * @param {SubmittableGameplayEvent} event
     */
    addCurse: function(event) {
        const currentFloor = this.getCurrentFloor();
        if (currentFloor) {
            currentFloor.GameplayEvents.unshift(event);
        }
        this.reloadHistory();
    },

    /**
     * adds a gameplay event to the current character on the current floor
     * @param {SubmittableGameplayEvent} event
     */
    addEvent: function(event) {
        const currentFloor = this.getCurrentFloor();
        if (currentFloor) {
            currentFloor.GameplayEvents.push(event);
        }
        this.reloadHistory();
    },

    /**
     * adds a gameplay event, if the last event type wasn't of type 'eventType' and the last resource1 wasn't 'resource1'
     * @param {SubmittableGameplayEvent} event - the event that should be added
     * @param {number} eventType - if last event was this type, don't add this one!
     * @param {string} resource1 - if last event had this as RelatedResource1, don't add this one!
     */
    addEventIfLastEventWasNotOfType: function(event, eventType, resource1) {
        const currentFloor = this.getCurrentFloor();
        if (currentFloor) {
            if (currentFloor.GameplayEvents.length === 0) {
                currentFloor.GameplayEvents.push(event);
                this.reloadHistory();
            } else {
                const currentEvent = currentFloor.GameplayEvents[currentFloor.GameplayEvents.length - 1];
                if (currentEvent.EventType !== eventType && currentEvent.RelatedResource1 !== resource1) {
                    currentFloor.GameplayEvents.push(event);
                    this.reloadHistory();
                }
            }
        }
    },

    /**
     * adds a seed to the current character
     * @param {(string|null)} seed
     */
    addSeed: function(seed) {
        const currentCharacter = this.getCurrentCharacter();
        currentCharacter.Seed = seed;
    },


    /** 
     * returns the seed of the current character if he has one - or null otherwise
     * @returns {(string|null)}
     */
    getSeed: function() {
        const currentCharacter = this.getCurrentCharacter();
        return currentCharacter ? currentCharacter.Seed : null;
    },


    /**
     * returns true if the current character has a Seed set, false otherwise
     * @returns {boolean}
     */
    currentCharacterHasSeed: function() {
        const currentCharacter = this.getCurrentCharacter();
        if (currentCharacter.Seed) {
            return true;
        } else {
            return false;
        }
    },


    /**
     * returns true if the current floor is the first floor for the character
     * @returns {boolean}
     */
    weAreOnFirstFloor: function () {
        const currentCharacter = this.getCurrentCharacter();
        if (currentCharacter.PlayedFloors.length === 1) {
            return true;
        } else {
            return false;
        }
    },


    /**
     * returns true if the SubmittableCharacter.PlayedFloors property of the current character is empty, true otherwise
     * @returns {boolean}
     */
    characterHasNoFloorsSelected: function () {
        const currentCharacter = this.getCurrentCharacter();
        if (!currentCharacter.PlayedFloors || currentCharacter.PlayedFloors.length === 0) {
            return true;
        } else {
            return false;
        }
    },


    /**
     * returns the current character.
     * @returns {SubmittableCharacter}
     */
    getCurrentCharacter: function() {
        const currentCharacterIndex = this.dataForThisEpisode.PlayedCharacters.length - 1;
        return this.dataForThisEpisode.PlayedCharacters[currentCharacterIndex];;
    },


    /**
     * returns the current floor the character is on, or null if no floor was added yet.
     * @returns {(SubmittableFloor|null)}
     */
    getCurrentFloor: function() {
        const currentCharacter = this.getCurrentCharacter();
        if (!currentCharacter.PlayedFloors || currentCharacter.PlayedFloors.length === 0) {
            return null;
        }

        const currentFloorIndex = currentCharacter.PlayedFloors.length - 1;
        return currentCharacter.PlayedFloors[currentFloorIndex];
    },


    /**
     * returns the combined duration (in seconds) of all floors (and all runs) so far.
     * @returns {number}
     */
    recordedFloorTimeSoFar: function () {
        const character = this.getCurrentCharacter();
        if (!character.PlayedFloors || character.PlayedFloors.length === 0) {
            return 0;
        }

        const recordedFloorTimeSoFar = this.dataForThisEpisode.PlayedCharacters
            .flatMap(c => c.PlayedFloors)
            .map(floor => typeof (floor.Duration) === 'number' ? floor.Duration : 0)
            .reduce((acc, curr) => acc += curr);

        console.log('time so far: ', recordedFloorTimeSoFar);
        return recordedFloorTimeSoFar;
    },


    /**
     * returns true if the character has a 'Starting Item' event, false otherwise
     * @returns {boolean}
     */
    characterHasStartingItems: function () {
        const currentCharacter = this.getCurrentCharacter();
        const events = currentCharacter.PlayedFloors.flatMap(floor => floor.GameplayEvents);
        return events.some(event => event.EventType === 2 && event.RelatedResource2 === 'StartingItem');
    },


    /**
     * returns all data that is required to remove an element from history
     * @param {Event} e - the raw click event
     * @returns {RemoveHistoryElement}
     */
    getRemoveIndexData: function(e) {
        const target = e.currentTarget;

        const invalidResult = {
            valid: false,
            characterIndex: null,
            eventIndex: null,
            floorIndex: null,
            eventType: null
        };

        if (!target || !(target instanceof HTMLDivElement)) {
            return invalidResult;
        }

        const characterIndex = target.getAttribute('c');
        const floorIndex = target.getAttribute('f');
        const eventIndex = target.getAttribute('e');
        const eventType = target.getAttribute('et');

        if (!characterIndex && !floorIndex && !eventIndex && !eventType) {
            return invalidResult;
        } else {
            e.stopPropagation();
            return {
                valid: true,
                characterIndex: characterIndex ? parseInt(characterIndex, 10) : null,
                eventIndex: eventIndex ? parseInt(eventIndex, 10) : null,
                floorIndex: floorIndex ? parseInt(floorIndex, 10) : null,
                eventType: eventType ? parseInt(eventType, 10) : null
            };
        }
    },


    /**
     * handles the click event after the user clicked on an item in the table (with the purpose of removing it from history)
     * @param {Event} e - the raw click event
     */
    removeHistoryElement: function (e) {
        const data = this.getRemoveIndexData(e);
        if (!data.valid) {
            return;
        }

        if (data.characterIndex !== null && data.floorIndex === null && data.eventIndex === null) {
            // user wants to remove character: show confirmation prompt
            this.showRemoveCharacterWarning(data);
        } else if (data.characterIndex !== null && data.floorIndex !== null && data.eventIndex === null) {
            // user wants to remove floor: show confirmation prompt
            this.showRemoveFloorWarning(data);
        } else if (data.characterIndex !== null && data.floorIndex !== null && data.eventIndex !== null) {
            // user wants to remove event: just let him do it
            this.removeEvent(data);
        }
    },


    /**
     * shows a prompt the user has to confirm before a whole floor gets deleted from history
     * @param {RemoveHistoryElement} data
     */
    showRemoveFloorWarning: function (data) {
        modal(false,
            Div(
                h2(
                    t('Warning!')
                ),
                hr(),
                p(
                    t('Removing an entire floor will also remove all things that happened within it (item pickups, bossfights...)!')
                ),
                p(
                    t('Really delete the floor?')
                ),
                p(
                    button(
                        t('No, Cancel!'),
                        cl('btn-yellow'),
                        id('cancel'),
                        event('click', hideModal)
                    ),
                    button(
                        t('Yes, Really!'),
                        cl('btn-red'),
                        id('confirm'),
                        event('click', () => this.removeFloor(data))
                    )
                )
            )
        );
    },


    /**
     * shows a prompt the user has to confirm before a whole character gets deleted from history
     * @param {RemoveHistoryElement} data - data necessary to remove the character
     */
    showRemoveCharacterWarning: function (data) {
        modal(false,
            Div(
                h2(
                    t('Warning!')
                ),
                hr(),
                p(
                    t('Removing the character will also remove all floors and collected items the character has gone through.')
                ),
                p(
                    t('Really delete the character?')
                ),
                p(
                    button(
                        t('No, Cancel!'),
                        cl('btn-yellow'),
                        id('cancel'),
                        event('click', hideModal)
                    ),
                    button(
                        t('Yes, Really!'),
                        cl('btn-red'),
                        id('confirm'),
                        event('click', () => this.removeCharacter(data))
                    )
                )
            )
        );
    },


    /**
     * removes a character from history for good.
     * @param {RemoveHistoryElement} data - data necessary to remove the character
     */
    removeCharacter: function (data) {
        hideModal();
        if (typeof(data.characterIndex) === 'number') {
            this.dataForThisEpisode.PlayedCharacters.splice(data.characterIndex, 1);
            this.reloadHistory();
            this.notifySubscribersOfDeletion(data);
        }
    },


    /**
     * removes a floor from a character for good.
     * @param {RemoveHistoryElement} data - data necessary to remove the floor
     */
    removeFloor: function (data) {
        hideModal();
        if (data && floorToRemove.characterIndex !== null && data.floorIndex !== null) {
            this.dataForThisEpisode.PlayedCharacters[data.characterIndex].PlayedFloors.splice(data.floorIndex, 1);
            this.reloadHistory();
            this.notifySubscribersOfDeletion(data);
        }
    },


    /**
     * removes a gameplay event from a floor
     * @param {RemoveHistoryElement} data - data necessary to remove a gameplay event
     */
    removeEvent: function (data) {
        if (data.characterIndex !== null && data.floorIndex !== null && data.eventIndex !== null) {
            this.dataForThisEpisode.PlayedCharacters[data.characterIndex].PlayedFloors[data.floorIndex].GameplayEvents.splice(data.eventIndex, 1);
            this.reloadHistory();
            this.notifySubscribersOfDeletion();
        }
    },


    /**
     * reloads history from the server and replaces the table with the new data
     */
    reloadHistory: function () {
        post('/api/resources/history', JSON.stringify(this.dataForThisEpisode)).then(( /** @type {CompleteHistory} */ history) => {
            const trs = [];

            for (let c = 0; c < history.characterHistory.length; ++c) {
                const character = history.characterHistory[c];

                for (let f = 0; f < character.floors.length; ++f) {
                    const tds = [];

                    // add character icon on first floor
                    if (f === 0) {
                        tds.push(
                            td(
                                div(
                                    attr({ c: c.toString(10), title: 'Click to remove character', class: 'hand display-inline' }),
                                    isaacImage(character.characterImage, undefined, false),
                                    event('click', this.removeHistoryElement)
                                )
                            )
                        );
                    } else {
                        tds.push(td());
                    }

                    // add floor icon
                    const floor = character.floors[f];
                    const events = floor.events;

                    tds.push(
                        td(
                            div(
                                attr({ c: c.toString(10), f: f.toString(10), title: 'Click to remove floor', class: 'hand display-inline' }),
                                isaacImage(floor.floorImage, undefined, false),
                                event('click', this.removeHistoryElement)
                            )
                        )
                    );

                    // add events
                    const eventTds = events.map((event, e) => td(
                        div(
                            attr({
                                c: c.toString(10),
                                f: f.toString(10),
                                e: e.toString(10),
                                et: event.image.type.toString(10),
                                class: 'hand display-inline',
                                title: `Click to remove ${resourceTypeToString(event.image.type).toLowerCase()}`
                            }),
                            isaacImage(event.image, undefined, false),
                            event('click', this.removeHistoryElement)
                        )
                    ));

                    tds.push(...eventTds);
                    trs.push(tr(...tds));
                }
            }

            new Render([trs], 'history', true, false);
        });
    }
}

export { HistoryTable }