import { GameplayEventType } from "../Enums/gameplay-event-type";

export interface SubmittedGameplayEvent {
    EventType: GameplayEventType,
    RelatedResource1: string,
    RelatedResource2: string | null,
    RelatedResource3: number | null,
    Player: number | null
}
