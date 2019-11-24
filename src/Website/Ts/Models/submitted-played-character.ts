import { SubmittedPlayedFloor } from "./submitted-played-floor";
import { GameMode } from "../Enums/game-mode";

export interface SubmittedPlayedCharacter {
    CharacterId: string,
    GameMode: GameMode,
    PlayedFloors: Array<SubmittedPlayedFloor>,
    Seed: string | null |undefined
}