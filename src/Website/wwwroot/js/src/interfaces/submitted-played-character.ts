import { SubmittedPlayedFloor } from "./submitted-played-floor";

export interface SubmittedPlayedCharacter {
    CharacterId: string,
    GameMode: number,
    PlayedFloors: Array<SubmittedPlayedFloor>,
    Seed: string | null |undefined
}