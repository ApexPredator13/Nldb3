import { ExistsIn } from "../../Enums/exists-in";
import { convertExistsInToString, convertGameModeToString, convertResourceTypeToString, convertTagToString, convertGameplayEventTypeToString } from "../../Enums/enum-to-string-converters";
import { Option } from '../General/option';
import { GameMode } from "../../Enums/game-mode";
import { ResourceType } from "../../Enums/resource-type";
import { Tag } from "../../Enums/tags";
import { IsaacResource } from "../../Models/isaac-resource";
import { GameplayEventType } from "../../Enums/gameplay-event-type";

const gameModeOptionList = (selectedOption?: GameMode) => {
    return [
        new Option(GameMode.AllModes.toString(10), convertGameModeToString(GameMode.AllModes), selectedOption === GameMode.AllModes ? true : false),
        new Option(GameMode.CommunityChallenge.toString(10), convertGameModeToString(GameMode.CommunityChallenge), selectedOption === GameMode.CommunityChallenge ? true : false),
        new Option(GameMode.Greed.toString(10), convertGameModeToString(GameMode.Greed), selectedOption === GameMode.Greed ? true : false),
        new Option(GameMode.Greedier.toString(10), convertGameModeToString(GameMode.Greedier), selectedOption === GameMode.Greedier ? true : false),
        new Option(GameMode.Hard.toString(10), convertGameModeToString(GameMode.Hard), selectedOption === GameMode.Hard ? true : false),
        new Option(GameMode.Normal.toString(10), convertGameModeToString(GameMode.Normal), selectedOption === GameMode.Normal ? true : false),
        new Option(GameMode.HardAndNormal.toString(10), convertGameModeToString(GameMode.HardAndNormal), selectedOption === GameMode.HardAndNormal ? true : false),
        new Option(GameMode.SpecialChallenge.toString(10), convertGameModeToString(GameMode.SpecialChallenge), selectedOption === GameMode.SpecialChallenge ? true : false),
        new Option(GameMode.SpecialSeed.toString(10), convertGameModeToString(GameMode.SpecialSeed), selectedOption === GameMode.SpecialSeed ? true : false),
        new Option(GameMode.Unspecified.toString(10), convertGameModeToString(GameMode.Unspecified), selectedOption === GameMode.Unspecified ? true : false),
    ];
}

const existsInOptionlist = (selected?: ExistsIn) => {
    return [
        new Option(ExistsIn.VanillaOnwards.toString(10), convertExistsInToString(ExistsIn.VanillaOnwards), selected === ExistsIn.VanillaOnwards ? true : false),
        new Option(ExistsIn.VanillaOnly.toString(10), convertExistsInToString(ExistsIn.VanillaOnly), selected === ExistsIn.VanillaOnly ? true : false),
        new Option(ExistsIn.WrathOfTheLambOnwards.toString(10), convertExistsInToString(ExistsIn.WrathOfTheLambOnwards), selected === ExistsIn.WrathOfTheLambOnwards ? true : false),
        new Option(ExistsIn.WrathOfTheLambOnly.toString(10), convertExistsInToString(ExistsIn.WrathOfTheLambOnly), selected === ExistsIn.WrathOfTheLambOnly ? true : false),
        new Option(ExistsIn.CommunityRemixOnwards.toString(10), convertExistsInToString(ExistsIn.CommunityRemixOnwards), selected === ExistsIn.CommunityRemixOnwards ? true : false),
        new Option(ExistsIn.CommunityRemixOnly.toString(10), convertExistsInToString(ExistsIn.CommunityRemixOnly), selected === ExistsIn.CommunityRemixOnly ? true : false),
        new Option(ExistsIn.RebirthOnwards.toString(10), convertExistsInToString(ExistsIn.RebirthOnwards), selected === ExistsIn.RebirthOnwards ? true : false),
        new Option(ExistsIn.RebirthOnly.toString(10), convertExistsInToString(ExistsIn.RebirthOnly), selected === ExistsIn.RebirthOnly ? true : false),
        new Option(ExistsIn.AfterbirthOnwards.toString(10), convertExistsInToString(ExistsIn.AfterbirthOnwards), selected === ExistsIn.AfterbirthOnwards ? true : false),
        new Option(ExistsIn.AfterbirthOnly.toString(10), convertExistsInToString(ExistsIn.AntibirthAndRepentanceOnwards), selected === ExistsIn.AntibirthAndRepentanceOnwards ? true : false),
        new Option(ExistsIn.AntibirthOnly.toString(10), convertExistsInToString(ExistsIn.AntibirthOnly), selected === ExistsIn.AntibirthOnly ? true : false),
        new Option(ExistsIn.AnitbirthOnwards.toString(10), convertExistsInToString(ExistsIn.AnitbirthOnwards), selected === ExistsIn.AnitbirthOnwards ? true : false),
        new Option(ExistsIn.AntibirthAndRepentanceOnwards.toString(10), convertExistsInToString(ExistsIn.AntibirthAndRepentanceOnwards), selected === ExistsIn.AntibirthAndRepentanceOnwards ? true : false),
        new Option(ExistsIn.AfterbirthPlusOnwards.toString(10), convertExistsInToString(ExistsIn.AfterbirthPlusOnwards), selected === ExistsIn.AfterbirthPlusOnwards ? true : false),
        new Option(ExistsIn.AfterbirthPlusOnly.toString(10), convertExistsInToString(ExistsIn.AfterbirthPlusOnly), selected === ExistsIn.AfterbirthPlusOnly ? true : false),
        new Option(ExistsIn.BoosterPack1Onwards.toString(10), convertExistsInToString(ExistsIn.BoosterPack1Onwards), selected === ExistsIn.BoosterPack1Onwards ? true : false),
        new Option(ExistsIn.BoosterPack1Only.toString(10), convertExistsInToString(ExistsIn.BoosterPack1Only), selected === ExistsIn.BoosterPack1Only ? true : false),
        new Option(ExistsIn.BoosterPack2Onwards.toString(10), convertExistsInToString(ExistsIn.BoosterPack2Onwards), selected === ExistsIn.BoosterPack2Onwards ? true : false),
        new Option(ExistsIn.BoosterPack2Only.toString(10), convertExistsInToString(ExistsIn.BoosterPack2Only), selected === ExistsIn.BoosterPack2Only ? true : false),
        new Option(ExistsIn.BoosterPack3Onwards.toString(10), convertExistsInToString(ExistsIn.BoosterPack3Onwards), selected === ExistsIn.BoosterPack3Onwards ? true : false),
        new Option(ExistsIn.BoosterPack3Only.toString(10), convertExistsInToString(ExistsIn.BoosterPack3Only), selected === ExistsIn.BoosterPack3Only ? true : false),
        new Option(ExistsIn.BoosterPack4Onwards.toString(10), convertExistsInToString(ExistsIn.BoosterPack4Onwards), selected === ExistsIn.BoosterPack4Onwards ? true : false),
        new Option(ExistsIn.BoosterPack4Only.toString(10), convertExistsInToString(ExistsIn.BoosterPack4Only), selected === ExistsIn.BoosterPack4Only ? true : false),
        new Option(ExistsIn.BoosterPack5Onwards.toString(10), convertExistsInToString(ExistsIn.BoosterPack5Onwards), selected === ExistsIn.BoosterPack5Onwards ? true : false),
        new Option(ExistsIn.BoosterPack5Only.toString(10), convertExistsInToString(ExistsIn.BoosterPack5Only), selected === ExistsIn.BoosterPack5Only ? true : false),
        new Option(ExistsIn.RepentanceOnwards.toString(10), convertExistsInToString(ExistsIn.RepentanceOnwards), selected === ExistsIn.RepentanceOnwards ? true : false),
        new Option(ExistsIn.RepentanceOnly.toString(10), convertExistsInToString(ExistsIn.RepentanceOnly), selected === ExistsIn.RepentanceOnly ? true : false),
        new Option(ExistsIn.EveryVersion.toString(10), convertExistsInToString(ExistsIn.EveryVersion), selected === ExistsIn.EveryVersion ? true : false),
        new Option(ExistsIn.Nowhere.toString(10), convertExistsInToString(ExistsIn.Nowhere), selected === ExistsIn.Nowhere ? true : false),
        new Option(ExistsIn.Unspecified.toString(10), convertExistsInToString(ExistsIn.Unspecified), selected === ExistsIn.Unspecified ? true : false),
        new Option(ExistsIn.CommunityRemixAndAntibirth.toString(10), convertExistsInToString(ExistsIn.CommunityRemixAndAntibirth), selected === ExistsIn.CommunityRemixAndAntibirth ? true : false),
        new Option(ExistsIn.CommunityRemixAndAntibirthAndRepentanceOnwards.toString(10), convertExistsInToString(ExistsIn.CommunityRemixAndAntibirthAndRepentanceOnwards), selected === ExistsIn.CommunityRemixAndAntibirthAndRepentanceOnwards ? true : false),
        new Option(ExistsIn.CommunityRemixAndAntibirthAndAfterbirthOnwards.toString(10), convertExistsInToString(ExistsIn.CommunityRemixAndAntibirthAndAfterbirthOnwards), selected === ExistsIn.CommunityRemixAndAntibirthAndAfterbirthOnwards ? true : false),
        new Option(ExistsIn.VanillaAndWrathOfTheLambExclusive.toString(10), convertExistsInToString(ExistsIn.VanillaAndWrathOfTheLambExclusive), selected === ExistsIn.VanillaAndWrathOfTheLambExclusive ? true : false),
        new Option(ExistsIn.CommunityRemixAndRebirthOnwards.toString(10), convertExistsInToString(ExistsIn.CommunityRemixAndRebirthOnwards), selected === ExistsIn.CommunityRemixAndRebirthOnwards ? true : false),
    ];
}

const resourceTypeOptionList = (resourceType?: ResourceType) => {
    return [
        new Option(ResourceType.Boss.toString(10), convertResourceTypeToString(ResourceType.Boss), resourceType === ResourceType.Boss ? true : false),
        new Option(ResourceType.Character.toString(10), convertResourceTypeToString(ResourceType.Character), resourceType === ResourceType.Character ? true : false),
        new Option(ResourceType.CharacterReroll.toString(10), convertResourceTypeToString(ResourceType.CharacterReroll), resourceType === ResourceType.CharacterReroll ? true : false),
        new Option(ResourceType.Curse.toString(10), convertResourceTypeToString(ResourceType.Curse), resourceType === ResourceType.Curse ? true : false),
        new Option(ResourceType.Enemy.toString(10), convertResourceTypeToString(ResourceType.Enemy), resourceType === ResourceType.Enemy ? true : false),
        new Option(ResourceType.Floor.toString(10), convertResourceTypeToString(ResourceType.Floor), resourceType === ResourceType.Floor ? true : false),
        new Option(ResourceType.Item.toString(10), convertResourceTypeToString(ResourceType.Item), resourceType === ResourceType.Item ? true : false),
        new Option(ResourceType.ItemSource.toString(10), convertResourceTypeToString(ResourceType.ItemSource), resourceType === ResourceType.ItemSource ? true : false),
        new Option(ResourceType.OtherConsumable.toString(10), convertResourceTypeToString(ResourceType.OtherConsumable), resourceType === ResourceType.OtherConsumable ? true : false),
        new Option(ResourceType.OtherEvent.toString(10), convertResourceTypeToString(ResourceType.OtherEvent), resourceType === ResourceType.OtherEvent ? true : false),
        new Option(ResourceType.Pill.toString(10), convertResourceTypeToString(ResourceType.Pill), resourceType === ResourceType.Pill ? true : false),
        new Option(ResourceType.Rune.toString(10), convertResourceTypeToString(ResourceType.Rune), resourceType === ResourceType.Rune ? true : false),
        new Option(ResourceType.TarotCard.toString(10), convertResourceTypeToString(ResourceType.TarotCard), resourceType === ResourceType.TarotCard ? true : false),
        new Option(ResourceType.Transformation.toString(10), convertResourceTypeToString(ResourceType.Transformation), resourceType === ResourceType.Transformation ? true : false),
        new Option(ResourceType.Trinket.toString(10), convertResourceTypeToString(ResourceType.Trinket), resourceType === ResourceType.Trinket ? true : false),
        new Option(ResourceType.Unspecified.toString(10), convertResourceTypeToString(ResourceType.Unspecified), resourceType === ResourceType.Unspecified ? true : false)
    ];
}

const gameplayEventTypeOptionList = (selectedGameplayEventType: GameplayEventType) => {
    return Object.keys(GameplayEventType).filter(x => {
        const num = Number(x);
        if (isNaN(num)) {
            return false;
        }
        return true;
    }).map(x => {
        const num = Number(x) as GameplayEventType;
        const option = new Option(x, convertGameplayEventTypeToString(num), typeof (selectedGameplayEventType) === 'number' && selectedGameplayEventType === num);
        return option;
    });
}

const tagsAsIsaacResources = () => {
    const resources = Object.keys(Tag).filter(x => {
        const num = Number(x);
        if (isNaN(num)) {
            return false;
        }
        return true;
    }).map(x => {
        const num = Number(x);
        const res: IsaacResource = {
            id: num.toString(10),
            name: convertTagToString(num),
            x: 0,
            y: 0,
            h: 0,
            w: 0
        } as IsaacResource;
        return res;
    });
    return resources;
}

const tagsOptionList = (selectedTags?: Array<Tag>) => {
    const options = Object.keys(Tag).filter(x => {
        const num = Number(x);
        if (isNaN(num)) {
            return false;
        }
        return true;
    }).map(x => {
        const num = Number(x) as Tag;
        const option = new Option(x, convertTagToString(num), selectedTags && selectedTags.length > 0 && selectedTags.indexOf(num) !== -1);
        return option;
    });
    options.unshift(new Option('', 'Choose...', selectedTags && selectedTags.length === 0 ? true : false));
    return options;
}

export {
    existsInOptionlist,
    gameModeOptionList,
    resourceTypeOptionList,
    tagsOptionList,
    tagsAsIsaacResources,
    gameplayEventTypeOptionList
}

