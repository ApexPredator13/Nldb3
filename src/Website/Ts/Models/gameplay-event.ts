import { GameplayEventType } from "../Enums/gameplay-event-type";
import { IsaacResource } from "./isaac-resource";

export interface GameplayEvent {
    id: number;
    event_type: GameplayEventType;
    r1: IsaacResource;
    r2: IsaacResource | null;
    r3: number | null;
    action: number;
    in_consequence_of: IsaacResource | null;
    run_number: number;
    player: number | null;
    floor_number: number;
    submission: number;
}

