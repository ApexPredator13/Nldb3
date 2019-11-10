import { SubmissionType } from "../Enums/submission-type";
import { PlayedCharacter } from "./played-character";

export interface SubmittedEpisode {
    id: number;
    video_id: string;
    submission_type: SubmissionType;
    latest: boolean;
    played_characters: Array<PlayedCharacter>;
    username: string;
    is_two_player: boolean;
}