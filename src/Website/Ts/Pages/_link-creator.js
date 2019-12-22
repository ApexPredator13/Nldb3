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

function Link() {
    this.Home = () => '';
    this.Downloads = () => '/Downloads';
    this.Episode = videoId => `/${videoId}`;
    this.Episodes = () => '/Episodes';
    this.ResourceOverview = type => `/${type}`;
    this.SubmitVideo = id => `/SubmitVideo/${id}`;
    this.IsaacResource = id => `/${id}`;
    this.Quotes = () => '/Quotes';
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

