import { ResourceType } from "../enums/resource-type";

export interface RemovedHistoryItem {
    CharacterIndex: number,
    FloorIndex?: number | undefined,
    EventIndex?: number | undefined,
    Type: ResourceType
}
