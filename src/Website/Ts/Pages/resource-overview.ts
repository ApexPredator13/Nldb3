import { Component, FrameworkElement, A, AsyncComponentPart } from "../Framework/renderer";
import { PageData, registerPage, initRouter, extractParametersFromRoute, navigate, PageType } from "../Framework/router";
import { ResourceType } from "../Enums/resource-type";
import { get } from "../Framework/http";
import { IsaacResource } from "../Models/isaac-resource";
import { ResourceOrderBy } from "../Enums/resource-order-by";
import { Boxes } from "../Components/General/boxes";
import { Link } from "./_link-creator";

export class ResourceOverviewPage implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    resourceType: ResourceType;

    constructor() {
        const type = extractParametersFromRoute(1)[0];

        let header = '';
        let descriptionLine1 = '';
        let descriptionLine2 = '';

        switch (type) {
            case 'Bosses':
                header = "Overview of all Bosses Northernlion defeated";
                descriptionLine1 = "Click on a boss for more details!";
                this.resourceType = ResourceType.Boss;
                break;
            case 'Characters':
                header = "Overview of all Binding Of Isaac-Characters";
                descriptionLine1 = "Click on a character for more details!";
                this.resourceType = ResourceType.Character
                break;
            case 'CharacterRerolls':
                header = "Overview of all Character Rerolls in The Binding Of Isaac";
                descriptionLine1 = "A list of all items, rooms or other events that can reroll the character you're playing. Click on a reroll for more details!";
                this.resourceType = ResourceType.CharacterReroll;
                break;
            case 'Curses':
                header = "Overview of all Curses in The Binding Of Isaac";
                descriptionLine1 = "A list of all curses Northernlion has encountered.";
                descriptionLine2 = "Click on a curse for more details!";
                this.resourceType = ResourceType.Curse;
                break;
            case 'Enemies':
                header = "Overview of everything that can kill you in The Binding Of Isaac";
                descriptionLine1 = "Specific Enemies don't kill Northernlion too often, so most entries won't have too much data in them.";
                descriptionLine2 = "However, it can sometimes be interesting to compare enemies with each other! Consider using the 'Options' in the bottom left of the page after selecting an emeny!";
                this.resourceType = ResourceType.Enemy;
                break;
            case 'Floors':
                header = "Overview of all floors in The Binding Of Isaac";
                descriptionLine1 = "Click on a floor for more details!";
                this.resourceType = ResourceType.Floor;
                break;
            case 'Transformations':
                header = "Overview of all Transformations in The Binding Of Isaac";
                descriptionLine1 = "Click on a transformation for more details!";
                this.resourceType = ResourceType.Transformation;
                break;
            case 'Trinkets':
                header = "Overview of all Trinkets in The Binding Of Isaac";
                descriptionLine1 = "NOTE: Support for trinkets was added very recently, so most trinkets won't have much data yet!";
                this.resourceType = ResourceType.Trinket;
                break;
            case 'Items':
                header = "Overview of all Items in The Binding Of Isaac";
                descriptionLine1 = "Click on an item for more details!";
                this.resourceType = ResourceType.Item;
                break;
            case 'ItemSources':
                header = "Overview of all Item-Sources in The Binding Of Isaac";
                descriptionLine1 = "Everything that can drop an item can be found here! Click on an item source for more details!";
                this.resourceType = ResourceType.ItemSource;
                break;
            case 'OtherConsumables':
                header = "Overview of Other Consumables";
                descriptionLine1 = "NOTE: Support for misc consumables was added very recently, so most of them won't have much data yet!";
                descriptionLine2 = "Click on a consumable for more details!";
                this.resourceType = ResourceType.OtherConsumable;
                break;
            case 'Pills':
                header = "Overview of all Pills in The Binding Of Isaac";
                descriptionLine1 = "NOTE: Support for pills was added very recently, so most pills won't have much data yet!";
                descriptionLine2 = "Click on a pill for more details!";
                this.resourceType = ResourceType.Pill;
                break;
            case 'Runes':
                header = "Overview of all Runes in The Binding Of Isaac";
                descriptionLine1 = "NOTE: Support for runes was added very recently, so most runes won't have much data yet!";
                descriptionLine2 = "Click on a rune for more details!";
                this.resourceType = ResourceType.Rune;
                break;
            case 'TarotCards':
                header = "Overview of all Tarot Cards in The Binding Of Isaac";
                descriptionLine1 = "NOTE: Support for tarot cards was added very recently, so most tarot cards won't have much data yet!";
                descriptionLine2 = "Click on a tarot card for more details!";
                this.resourceType = ResourceType.TarotCard;
                break;
            default:
                this.resourceType = ResourceType.Item;
                break;
        }

        const children: Array<FrameworkElement> = new Array<FrameworkElement>();
        if (header) {
            children.push({ e: ['h1', header] });
        }
        if (descriptionLine1) {
            children.push({ e: ['p', descriptionLine1] });
        }
        if (descriptionLine2) {
            children.push({ e: ['p', descriptionLine2] });
        }


        this.E = {
            e: ['div'],
            c: [
                ...children,
                {
                    e: ['div'],
                    a: [[A.Id, 'resources']]
                }
            ]
        };

        this.A = this.LoadResources();
    }

    private LoadResources(): Array<AsyncComponentPart> {
        const part: AsyncComponentPart = {
            I: 'resources',
            P: get<Array<IsaacResource>>(`/Api/Resources/?ResourceType=${this.resourceType.toString(10)}&OrderBy=${ResourceOrderBy.Name.toString(10)}`).then(resources => {
                if (!resources) {
                    return {
                        e: ['div', 'No resources were found.']
                    };
                }

                // initialize map
                const sortedResources = new Map<string, Array<IsaacResource>>();
                sortedResources.set('Other', new Array<IsaacResource>());

                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                for (let i = 0; i < letters.length; ++i) {
                    sortedResources.set(letters.charAt(i), new Array<IsaacResource>());
                }

                if (this.resourceType === ResourceType.Boss) {
                    sortedResources.set('Double Trouble', new Array<IsaacResource>());
                }

                // sort resources
                for (const resource of resources) {

                    if (this.resourceType === ResourceType.Boss && this.IsDoubleTrouble(resource.name)) {
                        const doubleTroubleBosses = sortedResources.get('Double Trouble');
                        if (doubleTroubleBosses) {
                            doubleTroubleBosses.push(resource);
                            continue;
                        }
                    }

                    const letter = resource.name.charAt(0).toUpperCase();
                    const resultsForLetter = sortedResources.get(letter);
                    if (resultsForLetter) {
                        resultsForLetter.push(resource);
                    } else {
                        const other = sortedResources.get('Other');
                        if (other) {
                            other.push(resource);
                        }
                    }
                }

                // build box areas
                const areas = new Array<FrameworkElement>();
                let i = 0;

                for (const resourceSet of sortedResources) {
                    if (resourceSet[1].length === 0) {
                        continue;
                    }

                    const boxes = new Boxes<ResourceOverviewPage>(this, i++, resourceSet[1], undefined, true);
                    boxes.Subscribe(this.ItemClicked);

                    areas.push(
                        {
                            e: ['div'],
                            c: [
                                {
                                    e: ['hr']
                                },
                                {
                                    e: ['h3', resourceSet[0]]
                                },
                                boxes
                            ]
                        }
                    );
                }

                return {
                    e: ['div'],
                    c: areas
                };
            })
        };

        return [part];
    }

    private ItemClicked(id: string) {
        navigate(Link.IsaacResource(id), undefined, PageType.IsaacResource);
    }

    private IsDoubleTrouble(name: string) {
        const nameLower = name.toLowerCase();
        if (nameLower.indexOf(' and ') !== -1) {
            return true;
        }
        if (nameLower.indexOf('double ') !== -1) {
            return true;
        }
        if (nameLower.indexOf('quad ') !== -1) {
            return true;
        }
        if (nameLower.indexOf(' & ') !== -1) {
            return true;
        }
        return false;
    }

    static RegisterPage() {
        const page: PageData = {
            Component: ResourceOverviewPage,
            Title: 'Overview',
            Url: ['Items|Bosses|Characters|ItemSources|Floors|Transformations|CharacterRerolls|Curses|Pills|Runes|TarotCards|Trinkets|OtherConsumables']
        }

        registerPage(page);
    }
}

(() => {
    ResourceOverviewPage.RegisterPage();
    initRouter();
})();

