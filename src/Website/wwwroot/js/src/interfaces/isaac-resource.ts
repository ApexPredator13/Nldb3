import { Mod } from './mod';
import { Tag } from './tag'

export interface IsaacResource {
    id: string,
    name: string,
    resource_type: number,
    exists_in: number,
    x: number,
    y: number,
    w: number,
    h: number,
    game_mode: number,
    color: string,
    mod: Mod | undefined,
    tags: Array<Tag> | undefined
    display_order: number | undefined;
    difficulty: number | undefined;
}