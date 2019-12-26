
/**
 * @typedef {Object} SubmittableGameplayEvent
 * @property {number} EventType - the type of event
 * @property {string} RelatedResource1 - the first resource that was part of the event
 * @property {string} [RelatedResource2] - the second resource that was part of the event
 * @property {number} [RelatedResource3] - an additional number - currently only used for transformation progress
 * @property {number} [Player] - if the event was for player 1 or 2
 * @property {boolean} [Rerolled] - if the event (probably itempickup) was after a reroll
 */

/**
 * @typedef {Object} SubmittableFloor
 * @property {string} FloorId - the ID of the floor
 * @property {(number|null)} Duration - how long a floor took
 * @property {SubmittableGameplayEvent[]} GameplayEvents - all floor events
 */

/**
 * @typedef {Object} SubmittableCharacter
 * @property {string} CharacterId - the ID of the character
 * @property {number} GameMode - the game mode the character has been chosen for
 * @property {SubmittableFloor[]} PlayedFloors - all floors the character went through
 * @property {(string|null|undefined)} Seed - the seed for the run
 */

/**
 * @typedef {Object} EpisodeData
 * @property {string} VideoId - the ID of the current video
 * @property {SubmittableCharacter[]} PlayedCharacters - all played characters
 */

/**
 * @typedef {Object} RemoveHistoryElement
 * @property {boolean} valid - a flag indicating if the event can be removed from history or not
 * @property {(number|null)} characterIndex - the array index of the character from the EpisodeData.PlayedCharacters array
 * @property {(number|null)} floorIndex - the array index of the floor in the SubmittableCharacter.PlayedFloors array
 * @property {(number|null)} eventIndex - the array index of the event in the SubmittableFloor.GameplayEvents array
 * @property {(number|null)} eventType - the type of the resource the event refers to (Item, Bossfight, Curse...)
 */

/**
 * @typedef {Object} HistoryImage
 * @property {number} x - the image X coordinate
 * @property {number} y - the image Y coordinate
 * @property {number} w - the image width
 * @property {number} h - the image height
 * @property {number} type - the resource type
 */

/**
 * @typedef {Object} EventHistory
 * @property {HistoryImage} image - the image of the event
 */

/**
 * @typedef {Object} FloorHistory
 * @property {HistoryImage} floorImage - the image of the floor
 * @property {EventHistory[]} events - all events from the floor
 */

/**
 * @typedef {Object} CharacterHistory
 * @property {FloorHistory[]} floors - all floors the character went through
 * @property {HistoryImage} characterImage - the image of the character
 */

/**
 * @typedef {Object} CompleteHistory
 * @property {CharacterHistory[]} characterHistory - all characters that were played
 */

/**
 * @typedef {Object} ModUrl
 * @property {number} id
 * @property {string} url
 * @property {string} link_text
 */

/**
 * @typedef {Object} Mod
 * @property {number} id
 * @property {string} name
 * @property {ModUrl[]} links
 */

/**
 * @typedef {Object} IsaacResource
 * @property {string} id
 * @property {string} name
 * @property {number} resource_type
 * @property {number} exists_in
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {number} game_mode
 * @property {string} color
 * @property {Mod|undefined} mod
 * @property {number[]|undefined} tags
 * @property {number|undefined} display_order
 * @property {number|undefined} difficulty
 */

/**
 * @typedef {Object} GameplayEvent
 * @property {number} id
 * @property {number} event_type
 * @property {IsaacResource} r1
 * @property {IsaacResource|undefined} r2
 * @property {number|undefined} r3
 * @property {number} action
 * @property {IsaacResource|undefined} in_consequence_of
 * @property {number} run_number
 * @property {number|undefined} player
 * @property {number} floor_number
 * @property {number} submission
 * @property {boolean} was_rerolled
 * @property {number} played_character
 * @property {number} played_floor
 */