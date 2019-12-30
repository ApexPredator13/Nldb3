import { convertExistsInToString, convertGameModeToString, resourceTypeToString, convertTagToString, gameplayEventTypeToString } from "../../Enums/enum-to-string-converters";
import { option } from "../../Framework/renderer";

const gameModeOptionList = selected => {
    return Array.from(new Array(11).keys())
        .map(key => option(convertGameModeToString(key), key.toString(10), selected === key));
}

const existsInOptionlist = selected => {
    return Array.from(new Array(35).keys())
        .map(key => option(convertExistsInToString(key), key.toString(10), selected === key));
}

const resourceTypeOptionList = (selected) => {
    return Array.from(new Array(16).keys())
        .map(key => option(resourceTypeToString(key), key.toString(10), selected === key));
}

const gameplayEventTypeOptionList = (selected) => {
    return Array.from(new Array(22).keys())
        .map(key => option(gameplayEventTypeToString(key), key.toString(10), selected === key))
}

const tagsAsIsaacResources = () => {
    return Array.from(new Array(286).keys()).map(key => {
        return {
            id: key.toString(10),
            name: convertTagToString(key),
            x: 0, y: 0, w: 0, h: 0
        };
    });
}

const tagsOptionList = selected => {
    return Array.from(new Array(286).keys())
        .map(key => option(convertTagToString(key), key.toString(10), selected === key));
}

export {
    existsInOptionlist,
    gameModeOptionList,
    resourceTypeOptionList,
    tagsOptionList,
    tagsAsIsaacResources,
    gameplayEventTypeOptionList
}

