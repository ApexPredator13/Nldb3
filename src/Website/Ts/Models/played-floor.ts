import { IsaacResource } from "./isaac-resource";
import { GameplayEvent } from './gameplay-event';

export interface PlayedFloor {
    id: number;
    floor: IsaacResource;
    action: number;
    run_number: number;
    floor_number: number;
    died_from: IsaacResource | null;
    events: Array<GameplayEvent>;
    submission: number;
    duration: number;
}