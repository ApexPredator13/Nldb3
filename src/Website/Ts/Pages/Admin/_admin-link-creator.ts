import { ResourceType } from "../../Enums/resource-type";



export class AdminLink {
    static AdminOverview() {
        return '/Admin/Overview';
    }

    static AddVideos() {
        return '/Admin/AddVideo';
    }

    static CreateMod() {
        return '/Admin/CreateMod';
    }

    static Mod(modId: number) {
        return `/Admin/Mod/${modId.toString(10)}`;
    }

    static ModDeleted(modName: string) {
        return `/Admin/ModDeleted/${modName}`;
    }

    static ModLinkDeleted(modLinkName: string) {
        return `/Admin/ModLinkDeleted/${modLinkName}`;
    }

    static Mods() {
        return '/Admin/Mods';
    }

    static ResourceOverview(type: ResourceType) {
        return `/Admin/Resources/${type.toString(10)}`;
    }

    static VideosSaved(videoIds: string) {
        return `/Admin/VideosSaved/${videoIds}`;
    }

    static CreateLink(modId: number) {
        return `/Admin/CreateLink/${modId}`;
    }
}