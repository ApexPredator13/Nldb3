import { SubmittedPlayedCharacter } from "./submitted-played-character";

export interface SubmittedCompleteEpisode {
    VideoId: string,
    PlayedCharacters: Array<SubmittedPlayedCharacter>
};