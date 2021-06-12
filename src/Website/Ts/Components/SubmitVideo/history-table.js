import { SubmitVideoPage } from "../../Pages/submit-video.js"
import { resourceTypeToString } from "../../Enums/enum-to-string-converters";
import { post } from "../../Framework/http";
import { Html, Div, id, t, table, td, tr, cl, p, modal, h2, hr, button, hideModal, div, attr, event, Tbody, style } from "../../Framework/renderer";
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
    new Html([
        Div(
            id('history-container'),

            p(
                t('Event History - click on items to remove them')
            ),
            table(
                id('history'),
                attr({
                    style: 'margin-top: 5px; margin-bottom: 0;'
                }),
                tr(
                    td(
                        t('Nothing was added yet.')
                    )
                )
            )
        )
    ], historyTableContainerId, true, false);
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
        this.addDurationToCurrentFloor();

        // then add the next
        const currentCharacter = this.getCurrentCharacter();
        currentCharacter.PlayedFloors.push(floor);

        // if co-op, also add the floor to the other player
        if (currentCharacter.GameMode === 12) {
            const coopCharacter = this.getCoopCharacter();
            coopCharacter.PlayedFloors.push({
                FloorId: floor.FloorId,
                Duraction: floor.Duration,
                GameplayEvents: []
            });
        }

        this.reloadHistory();
    },

    /**
     * gets the current timestamp from the youtube video player, gets time from all floors so far, and saves the difference of those two to the floor object.
     * does nothing if the duration is already set or if there is no floor selected yet.
     * @param {SubmittableFloor} floor - the floor that should get the duration
     */
    addDurationToCurrentFloor() {
        const floor = this.getCurrentFloor();
        if (floor && floor.Duration === null) {
            const currentPlayerTime = this.youtubePlayer.getCurrentTime();
            const timeSoFar = this.recordedFloorTimeSoFar();
            const timeSpentOnThisFloor = currentPlayerTime - timeSoFar;
            floor.Duration = timeSpentOnThisFloor;

            // if coop, also add the duration to the co-op floor
            const character = this.getCurrentCharacter();
            if (character.GameMode === 12) {
                const coopFloor = this.getCoopFloor();
                coopFloor.Duration = timeSpentOnThisFloor;
            }
        }
    },

    /**
     * adds a curse to the current floor
     * @param {SubmittableGameplayEvent} event
     */
    addCurse: function (event) {

        const currentCharacter = this.getCurrentCharacter();
        const currentFloor = this.getCurrentFloor();

        if (currentFloor) {
            currentFloor.GameplayEvents.unshift(event);
        }

        // if co-op, also add it to the other floor
        if (currentCharacter.GameMode === 12) {
            const coopFloor = this.getCoopFloor();
            if (coopFloor) {
                coopFloor.GameplayEvents.unshift(event);
            }
        }

        this.reloadHistory();
    },

    /**
     * adds a gameplay event to the current character on the current floor
     * @param {SubmittableGameplayEvent} event
     */
    addEvent: function (event) {
        // bossfight (4) and enemy who ended (1) the run are for both players.
        // all other events are saved individually
        const currentCharacter = this.getCurrentCharacter();

        // coop: record bossfight and run end for both players
        // otherwise just for the current character
        const floors = [];

        if (currentCharacter.GameMode != 12) {                                                                  // normal gameplay
            floors.push(this.getCurrentFloor());
        } else if (currentCharacter.GameMode === 12 && event.Player === 1) {                                    // coop player 1
            floors.push(this.getCurrentFloor());
        } else if (currentCharacter.GameMode === 12 && event.Player === 2) {                                    // coop player 2
            floors.push(this.getCoopFloor());
        }  else if (currentCharacter.GameMode === 12 && (event.EventType === 4 || event.EventType === 1)) {     // coop both players
            floors.push(this.getCurrentFloor(), this.getCoopFloor());
        }
        
        for (let i = 0; i < floors.length; ++i) {
            const currentFloor = floors[i];
            if (currentFloor) {
                currentFloor.GameplayEvents.push(event);
            }
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
     * adds a seed to the current character as well as the co-op character
     * @param {(string|null)} seed
     */
    addSeed: function(seed) {
        const currentCharacter = this.getCurrentCharacter();
        currentCharacter.Seed = seed;

        if (currentCharacter.GameMode === 12) {
            const coopCharacter = this.getCoopCharacter();
            coopCharacter.Seed = seed;
        }
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
        const currentCharacter = this.dataForThisEpisode.PlayedCharacters[currentCharacterIndex];
        return currentCharacter.GameMode !== 12 ? currentCharacter : this.dataForThisEpisode.PlayedCharacters[currentCharacterIndex - 1];
    },


    /**
     * returns the current co-op character.
     * @returns {SubmittableCharacter}
     */
    getCoopCharacter: function () {
        const currentCharacterIndex = this.dataForThisEpisode.PlayedCharacters.length - 1;
        return this.dataForThisEpisode.PlayedCharacters[currentCharacterIndex];
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
     * returns the current floor the co-op character is on, or null if no floor was added yet.
     * @returns {(SubmittableFloor|null)}
     */
    getCoopFloor: function () {
        const coopCharacter = this.getCoopCharacter();
        if (!coopCharacter.PlayedFloors || coopCharacter.PlayedFloors.length === 0) {
            return null;
        }

        const currentFloorIndex = coopCharacter.PlayedFloors.length - 1;
        return coopCharacter.PlayedFloors[currentFloorIndex];
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
            // DISABLED FOR NOW: Breaks timestamps!!
            // user wants to remove character: show confirmation prompt
            // this.showRemoveCharacterWarning(data);
        } else if (data.characterIndex !== null && data.floorIndex !== null && data.eventIndex === null) {
            // DISABLED FOR NOW: Breaks timestamps!!
            // user wants to remove floor: show confirmation prompt
            // this.showRemoveFloorWarning(data);
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
     * checks whether there is a 'Bossfight' event on the current floor
     */
    currentFloorHasBossfight: function() {
        const currentFloor = this.getCurrentFloor();
        
        if (currentFloor) {
            const events = currentFloor.GameplayEvents;
            if (events && events.length > 0) {
                for (let i = 0; i < events.length; ++i) {
                    if (events[i].EventType === 4) {
                        return true;
                    }
                }
            }
        }

        return false;
    },


    /**
     * removes a floor from a character for good.
     * @param {RemoveHistoryElement} data - data necessary to remove the floor
     */
    removeFloor: function (data) {
        hideModal();
        if (data && data.characterIndex !== null && data.floorIndex !== null) {
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
            this.notifySubscribersOfDeletion(data);
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
                                    // DELETING CHARACTER DISABLED FOR NOW: breaks timestamps!
                                    attr({
                                        c: c.toString(10),
                                        // title: 'Click to remove character',
                                        // class: 'hand display-inline'
                                    }),
                                    isaacImage(character.characterImage, undefined, false),
                                    // event('click', e => this.removeHistoryElement(e))
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
                                // DELETING FLOOR DISABLED FOR NOW: breaks timestamps!
                                attr({
                                    c: c.toString(10),
                                    f: f.toString(10),
                                    // title: 'Click to remove floor',
                                    class: 'display-inline'
                                    // class: 'hand display-inline'
                                }),
                                isaacImage(floor.floorImage, undefined, false),
                                // event('click', e => this.removeHistoryElement(e))
                            )
                        )
                    );

                    // add events
                    tds.push(
                        td(
                            style('padding: 0; text-align: left;'),
                            ...events.map((ev, e) => div(
                                    attr({
                                        c: c.toString(10),
                                        f: f.toString(10),
                                        e: e.toString(10),
                                        et: ev.image.type.toString(10),
                                        class: 'hand display-inline c',
                                        title: `Click to remove ${resourceTypeToString(ev.image.type).toLowerCase()}`,
                                    }),
                                    isaacImage(ev.image, undefined, false),
                                    event('click', e => this.removeHistoryElement(e))
                                ))
                        )
                    );

                    trs.push(tr(...tds));
                }
            }
            new Html([Tbody(...trs)], 'history');
        });
    }
}

export { HistoryTable }