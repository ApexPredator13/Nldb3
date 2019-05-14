export interface SubmittedGameplayEvent {
    EventType: number,
    RelatedResource1: string,
    RelatedResource2: string | null,
    RelatedResource3: number | null,
    Player: number | null
}
