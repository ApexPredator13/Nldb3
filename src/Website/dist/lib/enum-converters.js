var convertGameModeToString = function (mode) {
    switch (mode) {
        case 0: return 'All Modes';
        case 1: return 'Normal';
        case 2: return 'Hard';
        case 3: return 'Greed Mode';
        case 4: return 'Greedier Mode';
        case 5: return 'Special Challenge';
        case 6: return 'Special Seed';
        case 7: return 'Unspecified';
        default: return '';
    }
};
var convertExistsInToString = function (n) {
    switch (n) {
        case 0: return 'Nowhere';
        case 1: return 'Every Version';
        case 2: return 'Vanilla Exclusive';
        case 3: return 'Wrath of the Lamb Exclusive';
        case 4: return 'Community Remix Exclusive';
        case 5: return 'Rebirth Exclusive';
        case 6: return 'Afterbirth Exclusive';
        case 7: return 'Antibirth Exclusive';
        case 8: return 'Afterbirth† Exclusive';
        case 9: return 'Repentance Exclusive';
        case 10: return 'Booster Pack 1 Exclusive';
        case 11: return 'Booster Pack 2 Exclusive';
        case 12: return 'Booster Pack 3 Exclusive';
        case 13: return 'Booster Pack 4 Exclusive';
        case 14: return 'Booster Pack 5 Exclusive';
        case 15: return 'Vanilla Onwards';
        case 16: return 'Wrath of the Lamb Onwards';
        case 17: return 'Community Remix Onwards';
        case 18: return 'Rebirth Onwards';
        case 19: return 'Afterbirth Onwards';
        case 20: return 'Antibirth Onwards';
        case 21: return 'Afterbirth† Onwards';
        case 22: return 'Booster Pack 1 Onwards';
        case 23: return 'Booster Pack 2 Onwards';
        case 24: return 'Booster Pack 3 Onwards';
        case 25: return 'Booster Pack 4 Onwards';
        case 26: return 'Booster Pack 5 Onwards';
        case 27: return 'Repentance Onwards';
        case 28: return 'Unspecified';
        case 29: return 'Antibirth & Repentance Onwards';
        default: return '';
    }
};
var convertResourceTypeToString = function (r) {
    switch (r) {
        case 0: return 'Unspecified';
        case 1: return 'Boss';
        case 2: return 'Playable Character';
        case 3: return 'Curse';
        case 4: return 'Other Event';
        case 5: return 'Floor';
        case 6: return 'Item';
        case 7: return 'Item Source';
        case 8: return 'Pill';
        case 9: return 'Rune';
        case 10: return 'Tarot Card';
        case 11: return 'Enemy';
        case 12: return 'Transformation';
        case 13: return 'Trinket';
        case 14: return 'Character Reroll';
        default: return '';
    }
};
export { convertGameModeToString, convertExistsInToString, convertResourceTypeToString };
