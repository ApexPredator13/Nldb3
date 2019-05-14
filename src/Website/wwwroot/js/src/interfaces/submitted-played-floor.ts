import { SubmittedGameplayEvent } from "./submitted-gameplay-event";

export interface SubmittedPlayedFloor {
    FloorId: string,
    Duration: number | null,
    GameplayEvents: Array<SubmittedGameplayEvent>
}