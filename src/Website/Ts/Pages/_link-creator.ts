import { ResourceType } from "../Enums/resource-type";

export class Link {
    static Home() {
        return '';
    }

    static Downloads() {
        return '/Downloads';
    }

    static Episode(videoId: string) {
        return `/${videoId}`;
    }

    static Episodes() {
        return '/Episodes';
    }

    static ResourceOverview(resource: ResourceType) {
        let resourceType = '';
        switch (resource) {
            case ResourceType.Boss:
                resourceType = 'Bosses';
                break;
            case ResourceType.Item:
                resourceType = 'Items';
                break;
            case ResourceType.Character:
                resourceType = 'Characters';
                break;
            case ResourceType.ItemSource:
                resourceType = 'ItemSources';
                break;
            case ResourceType.Floor:
                resourceType = 'Floors';
                break;
            case ResourceType.Transformation:
                resourceType = 'Transformations';
                break;
            case ResourceType.CharacterReroll:
                resourceType = 'CharacterRerolls';
                break;
            case ResourceType.Curse:
                resourceType = 'Curses';
                break;
            case ResourceType.Pill:
                resourceType = 'Pills';
                break;
            case ResourceType.Rune:
                resourceType = 'Runes';
                break;
            case ResourceType.TarotCard:
                resourceType = 'TarotCards';
                break;
            case ResourceType.Trinket:
                resourceType = 'Trinkets';
                break;
            case ResourceType.OtherConsumable:
                resourceType = 'OtherConsumables';
                break;
        }

        return `/${resourceType}`;
    }
}