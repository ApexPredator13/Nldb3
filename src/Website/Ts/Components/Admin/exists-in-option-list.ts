import { ExistsIn } from "../../Enums/exists-in";
import { convertExistsInToString } from "../../Enums/enum-to-string-converters";
import { Option } from '../General/option';

export const existsInOptionlist = (selected: ExistsIn) => {
    return [
        new Option(ExistsIn.AntibirthAndRepentanceOnwards.toString(10), convertExistsInToString(ExistsIn.AntibirthAndRepentanceOnwards), selected === ExistsIn.AntibirthAndRepentanceOnwards ? true : false),
        new Option(ExistsIn.AfterbirthOnly.toString(10), convertExistsInToString(ExistsIn.AntibirthAndRepentanceOnwards), selected === ExistsIn.AntibirthAndRepentanceOnwards ? true : false),
        new Option(ExistsIn.AfterbirthOnwards.toString(10), convertExistsInToString(ExistsIn.AfterbirthOnwards), selected === ExistsIn.AfterbirthOnwards ? true : false),
        new Option(ExistsIn.AfterbirthPlusOnly.toString(10), convertExistsInToString(ExistsIn.AfterbirthPlusOnly), selected === ExistsIn.AfterbirthPlusOnly ? true : false),
        new Option(ExistsIn.AfterbirthPlusOnwards.toString(10), convertExistsInToString(ExistsIn.AfterbirthPlusOnwards), selected === ExistsIn.AfterbirthPlusOnwards ? true : false),
        new Option(ExistsIn.AnitbirthOnwards.toString(10), convertExistsInToString(ExistsIn.AnitbirthOnwards), selected === ExistsIn.AnitbirthOnwards ? true : false),
        new Option(ExistsIn.AntibirthOnly.toString(10), convertExistsInToString(ExistsIn.AntibirthOnly), selected === ExistsIn.AntibirthOnly ? true : false),
        new Option(ExistsIn.BoosterPack1Only.toString(10), convertExistsInToString(ExistsIn.BoosterPack1Only), selected === ExistsIn.BoosterPack1Only ? true : false),
        new Option(ExistsIn.BoosterPack1Onwards.toString(10), convertExistsInToString(ExistsIn.BoosterPack1Onwards), selected === ExistsIn.BoosterPack1Onwards ? true : false),
        new Option(ExistsIn.BoosterPack2Only.toString(10), convertExistsInToString(ExistsIn.BoosterPack2Only), selected === ExistsIn.BoosterPack2Only ? true : false),
        new Option(ExistsIn.BoosterPack2Onwards.toString(10), convertExistsInToString(ExistsIn.BoosterPack2Onwards), selected === ExistsIn.BoosterPack2Onwards ? true : false),
        new Option(ExistsIn.BoosterPack3Only.toString(10), convertExistsInToString(ExistsIn.BoosterPack3Only), selected === ExistsIn.BoosterPack3Only ? true : false),
        new Option(ExistsIn.BoosterPack3Onwards.toString(10), convertExistsInToString(ExistsIn.BoosterPack3Onwards), selected === ExistsIn.BoosterPack3Onwards ? true : false),
        new Option(ExistsIn.BoosterPack4Only.toString(10), convertExistsInToString(ExistsIn.BoosterPack4Only), selected === ExistsIn.BoosterPack4Only ? true : false),
        new Option(ExistsIn.BoosterPack4Onwards.toString(10), convertExistsInToString(ExistsIn.BoosterPack4Onwards), selected === ExistsIn.BoosterPack4Onwards ? true : false),
        new Option(ExistsIn.BoosterPack5Only.toString(10), convertExistsInToString(ExistsIn.BoosterPack5Only), selected === ExistsIn.BoosterPack5Only ? true : false),
        new Option(ExistsIn.BoosterPack5Onwards.toString(10), convertExistsInToString(ExistsIn.BoosterPack5Onwards), selected === ExistsIn.BoosterPack5Onwards ? true : false),
        new Option(ExistsIn.CommunityRemixOnly.toString(10), convertExistsInToString(ExistsIn.CommunityRemixOnly), selected === ExistsIn.CommunityRemixOnly ? true : false),
        new Option(ExistsIn.CommunityRemixOnwards.toString(10), convertExistsInToString(ExistsIn.CommunityRemixOnwards), selected === ExistsIn.CommunityRemixOnwards ? true : false),
        new Option(ExistsIn.EveryVersion.toString(10), convertExistsInToString(ExistsIn.EveryVersion), selected === ExistsIn.EveryVersion ? true : false),
        new Option(ExistsIn.Nowhere.toString(10), convertExistsInToString(ExistsIn.Nowhere), selected === ExistsIn.Nowhere ? true : false),
        new Option(ExistsIn.RebirthOnly.toString(10), convertExistsInToString(ExistsIn.RebirthOnly), selected === ExistsIn.RebirthOnly ? true : false),
        new Option(ExistsIn.RebirthOnwards.toString(10), convertExistsInToString(ExistsIn.RebirthOnwards), selected === ExistsIn.RebirthOnwards ? true : false),
        new Option(ExistsIn.RepentanceOnly.toString(10), convertExistsInToString(ExistsIn.RepentanceOnly), selected === ExistsIn.RepentanceOnly ? true : false),
        new Option(ExistsIn.RepentanceOnwards.toString(10), convertExistsInToString(ExistsIn.RepentanceOnwards), selected === ExistsIn.RepentanceOnwards ? true : false),
        new Option(ExistsIn.Unspecified.toString(10), convertExistsInToString(ExistsIn.Unspecified), selected === ExistsIn.Unspecified ? true : false),
        new Option(ExistsIn.VanillaOnly.toString(10), convertExistsInToString(ExistsIn.VanillaOnly), selected === ExistsIn.VanillaOnly ? true : false),
        new Option(ExistsIn.VanillaOnwards.toString(10), convertExistsInToString(ExistsIn.VanillaOnwards), selected === ExistsIn.VanillaOnwards ? true : false),
        new Option(ExistsIn.WrathOfTheLambOnly.toString(10), convertExistsInToString(ExistsIn.WrathOfTheLambOnly), selected === ExistsIn.WrathOfTheLambOnly ? true : false),
        new Option(ExistsIn.WrathOfTheLambOnwards.toString(10), convertExistsInToString(ExistsIn.WrathOfTheLambOnwards), selected === ExistsIn.WrathOfTheLambOnwards ? true : false),
    ]
}