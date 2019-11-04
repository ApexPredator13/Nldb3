import { ModUrl } from './mod-url'

export interface Mod {
    id: number | undefined,
    name: string,
    links: Array<ModUrl> | undefined
}