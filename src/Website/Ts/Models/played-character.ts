import { IsaacResource } from './isaac-resource';
import { PlayedFloor } from './played-floor';

export interface PlayedCharacter {
    id: number;
    character: IsaacResource;
    action: number;
    run_number: number;
    died_from: IsaacResource | null;
    played_floors: Array<PlayedFloor>;
    submission: number;
    seed: string | null;
}