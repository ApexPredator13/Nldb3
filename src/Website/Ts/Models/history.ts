import { ResourceType } from "../Enums/resource-type";

interface HistoryImage {
    x: number,
    y: number,
    w: number,
    h: number,
    type: ResourceType
}

interface History {
    characterHistory: Array<CharacterHistory>
}

interface CharacterHistory {
    characterImage: HistoryImage,
    floors: Array<FloorHistory>
}

interface FloorHistory {
    floorImage: HistoryImage,
    events: Array<EventHistory>
}

interface EventHistory {
    image: HistoryImage
}

export {
    HistoryImage,
    History,
    CharacterHistory,
    FloorHistory,
    EventHistory
}