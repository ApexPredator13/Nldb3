const RO_BOSSES      = 'Bosses';
const RO_ITEMS       = 'Items';
const RO_CHARACTERS  = 'Characters';
const RO_ITEMSOURCES = 'ItemSources';
const RO_FLOORS      = 'Floors';
const RO_REROLL      = 'CharacterRerolls';
const RO_CURSES      = 'Curses';
const RO_PILLS       = 'Pills';
const RO_RUNES       = 'Runes';
const RO_TAROT       = 'TarotCards';
const RO_TRINKET     = 'Trinkets';
const RO_OC          = 'OtherConsumables';
const RO_TRANS       = 'Transformations';



/** 
 *  Creates links for all pages
 *  @constructor 
 */
function Link() { }


Link.prototype = {
    /** Home */
    home: function () {
        return '';
    },

    /** /ReportProblem */
    reportProblem: function() {
        return '/ReportProblem';
    },

    /** /ProblemReported */
    problemSubmitted: function() {
        return '/ProblemSubmitted';
    },

    /**
     * /DeleteQuote/{quoteId}
     * @param {number} quoteId - the quote that should be deleted
     */
    deleteQuote: function (quoteId) {
        return `/DeleteQuote/${quoteId.toString(10)}`
    },

    /** /Downoads */
    downloads: function () {
        return '/Downloads';
    },

    /**
     * /{Episode}
     * @param {string} videoId - the ID of the video
     */
    episode: function (videoId) {
        return `/${videoId}`;
    },

    /** /Episodes */
    episodes: function () {
        return '/Episodes';
    },

    /**
     * /ResourceOverview - pass one of the RO_XXXXX constants that are exported from this file
     * @param {string} type
     */
    resourceOverview: function (type) {
        return `/${type}`;
    },

    /**
     * /{ResourceId}
     * @param {string} resourceId
     */
    isaacResource: function (resourceId) {
        return `/${resourceId}`;
    },

    /** /Quotes */
    quotes: function () {
        return '/Quotes';
    },

    /**
     * /SubmitVideo/{videoId}
     * @param {string} videoId - the youtube video ID
     */
    submitVideo: function (videoId) {
        return `/SubmitVideo/${videoId}`;
    },

    /** /ManageQuotes */
    manageMyQuotes: function () {
        return '/ManageQuotes';
    },

    /**
     * edit a single quote
     * @param {number} quoteId
     */
    editQuote: function (quoteId) {
        return `/EditQuote/${quoteId.toString(10)}`;
    }
}

export {
    Link,

    RO_BOSSES,
    RO_ITEMS,
    RO_CHARACTERS,
    RO_ITEMSOURCES,
    RO_FLOORS,
    RO_REROLL,
    RO_CURSES,
    RO_PILLS,
    RO_RUNES,
    RO_TAROT,
    RO_TRINKET,
    RO_OC,
    RO_TRANS
}

