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

    static ModLinkDeleted(modId: number, modLinkName: string) {
        return `/Admin/ModLinkDeleted/${modId.toString(10)}/${modLinkName}`;
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

    static CreateModLink(modId: number) {
        return `/Admin/CreateLink/${modId}`;
    }

    static CreateNewResource() {
        return '/Admin/CreateResource';
    }

    static ResourceDetails(id: string) {
        return `/Admin/Resource/${id}`;
    }

    static ResourceDeleted(resourceType: ResourceType, resourceId: string) {
        return `/Admin/ResourceDeleted/${resourceType.toString(10)}/${resourceId}`;
    }

    static EditResource(resourceId: string) {
        return `/Admin/EditResource/${resourceId}`;
    }

    static RedirectNextResource(resourceType: ResourceType, resourceId: string) {
        return `/Admin/RedirectNextResource/${resourceType.toString(10)}/${resourceId}`;
    }

    static DeleteResource(resourceType: ResourceType, resourceId: string) {
        return `/Admin/DeleteResource/${resourceType.toString(10)}/${resourceId}`;
    }

    static AdminSubmissions() {
        return '/Admin/Submissions';
    }

    static EditSubmission(videoId: string, submissionId: number) {
        return `/Admin/EditSubmission/${videoId}/${submissionId}`;
    }

    static EditGameplayEvent(eventId: number) {
        return `/Admin/EditGameplayEvent/${eventId.toString(10)}`;
    }

    static InsertGameplayEvent(videoId: string, submissionId: number, insertAfterEventId: number, playedCharacterId: number, playedFloorId: number, runNumber: number, floorNumber: number) {
        return `/Admin/InsertGameplayEvent/${videoId}/${submissionId.toString(10)}/${insertAfterEventId.toString(10)}/${playedCharacterId.toString(10)}/${playedFloorId.toString(10)}/${runNumber.toString(10)}/${floorNumber.toString(10)}`
    }

    static DeleteEvent(videoId: string, submissionId: number, eventId: number) {
        return `/Admin/DeleteEvent/${videoId}/${submissionId.toString(10)}/${eventId.toString(10)}`;
    }
}

