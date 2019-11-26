import { GameplayEventType } from "../Enums/gameplay-event-type";

export interface SubmittedGameplayEvent {
    EventType: GameplayEventType,
    RelatedResource1: string,
    RelatedResource2?: string,
    RelatedResource3?: number,
    Player?: 1 | 2,
    Rerolled?: boolean
}
