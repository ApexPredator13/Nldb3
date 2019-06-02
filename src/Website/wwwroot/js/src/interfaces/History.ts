interface HistoryImage {
    x: number,
    y: number,
    w: number,
    h: number
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