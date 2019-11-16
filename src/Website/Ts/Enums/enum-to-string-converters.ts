import { ResourceType } from "./resource-type";
import { ExistsIn } from "./exists-in";
import { GameMode } from "./game-mode";

const convertGameModeToString = (mode: GameMode): string => {
    switch (mode) {
        case GameMode.AllModes: return 'All Modes';
        case GameMode.Normal: return 'Normal';
        case GameMode.Hard: return 'Hard';
        case GameMode.Greed: return 'Greed Mode';
        case GameMode.Greedier: return 'Greedier Mode';
        case GameMode.SpecialChallenge: return 'Special Challenge';
        case GameMode.SpecialSeed: return 'Special Seed';
        case GameMode.Unspecified: return 'Unspecified';
        case GameMode.HardAndNormal: return 'Hard and Normal';
        case GameMode.CommunityChallenge: return 'Community Challenge';
        default: return '';
    }
}

const convertExistsInToString = (n: ExistsIn): string => {
    switch (n) {
        case ExistsIn.Nowhere: return 'Nowhere';
        case ExistsIn.EveryVersion: return 'Every Version';
        case ExistsIn.VanillaOnly: return 'Vanilla Exclusive';
        case ExistsIn.WrathOfTheLambOnly: return 'Wrath of the Lamb Exclusive';
        case ExistsIn.CommunityRemixOnly: return 'Community Remix Exclusive';
        case ExistsIn.RebirthOnly: return 'Rebirth Exclusive';
        case ExistsIn.AfterbirthOnly: return 'Afterbirth Exclusive';
        case ExistsIn.AntibirthOnly: return 'Antibirth Exclusive';
        case ExistsIn.AfterbirthPlusOnly: return 'Afterbirth† Exclusive';
        case ExistsIn.RepentanceOnly: return 'Repentance Exclusive';
        case ExistsIn.BoosterPack1Only: return 'Booster Pack 1 Exclusive';
        case ExistsIn.BoosterPack2Only: return 'Booster Pack 2 Exclusive';
        case ExistsIn.BoosterPack3Only: return 'Booster Pack 3 Exclusive';
        case ExistsIn.BoosterPack4Only: return 'Booster Pack 4 Exclusive';
        case ExistsIn.BoosterPack5Only: return 'Booster Pack 5 Exclusive';
        case ExistsIn.VanillaOnwards: return 'Vanilla Onwards';
        case ExistsIn.WrathOfTheLambOnwards: return 'Wrath of the Lamb Onwards';
        case ExistsIn.CommunityRemixOnwards: return 'Community Remix Onwards';
        case ExistsIn.RebirthOnwards: return 'Rebirth Onwards';
        case ExistsIn.AfterbirthOnwards: return 'Afterbirth Onwards';
        case ExistsIn.AnitbirthOnwards: return 'Antibirth Onwards';
        case ExistsIn.AfterbirthPlusOnwards: return 'Afterbirth† Onwards';
        case ExistsIn.BoosterPack1Onwards: return 'Booster Pack 1 Onwards';
        case ExistsIn.BoosterPack2Onwards: return 'Booster Pack 2 Onwards';
        case ExistsIn.BoosterPack3Onwards: return 'Booster Pack 3 Onwards';
        case ExistsIn.BoosterPack4Onwards: return 'Booster Pack 4 Onwards';
        case ExistsIn.BoosterPack5Onwards: return 'Booster Pack 5 Onwards';
        case ExistsIn.RepentanceOnwards: return 'Repentance Onwards';
        case ExistsIn.Unspecified: return 'Unspecified';
        case ExistsIn.AntibirthAndRepentanceOnwards: return 'Antibirth & Repentance Onwards';
        default: return '';
    }
}

const convertResourceTypeToString = (r: ResourceType): string => {
    switch (r) {
        case ResourceType.Unspecified: return 'Unspecified';
        case ResourceType.Boss: return 'Boss';
        case ResourceType.Character: return 'Playable Character';
        case ResourceType.Curse: return 'Curse';
        case ResourceType.OtherEvent: return 'Other Event';
        case ResourceType.Floor: return 'Floor';
        case ResourceType.Item: return 'Item';
        case ResourceType.ItemSource: return 'Item Source';
        case ResourceType.Pill: return 'Pill';
        case ResourceType.Rune: return 'Rune';
        case ResourceType.TarotCard: return 'Tarot Card';
        case ResourceType.Enemy: return 'Enemy';
        case ResourceType.Transformation: return 'Transformation';
        case ResourceType.Trinket: return 'Trinket';
        case ResourceType.CharacterReroll: return 'Character Reroll';
        case ResourceType.OtherConsumable: return 'Other Consumable';
        default: return '';
    }
}

export {
    convertGameModeToString,
    convertExistsInToString,
    convertResourceTypeToString
}

