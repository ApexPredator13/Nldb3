import { Mod } from './mod';
import { GameMode } from '../Enums/game-mode';
import { ExistsIn } from '../Enums/exists-in';
import { ResourceType } from '../Enums/resource-type';
import { Tag } from '../Enums/tags';

export interface IsaacResource {
    id: string,
    name: string,
    resource_type: ResourceType,
    exists_in: ExistsIn,
    x: number,
    y: number,
    w: number,
    h: number,
    game_mode: GameMode,
    color: string,
    mod: Mod | undefined,
    tags: Array<Tag> | undefined
    display_order: number | undefined;
    difficulty: number | undefined;
}