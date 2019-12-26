import { Render, Div, h1, t, do_nothing, p, div, hr, h3, id } from "../Framework/renderer";
import { registerPage, initRouter, navigate, PAGE_TYPE_ISAAC_RESOURCE } from "../Framework/router";
import { get } from "../Framework/http";
import { renderBoxes } from "../Components/General/renderBoxes";
import { Link } from "./_link-creator";

function resourceOverviewPage(parameters) {
    console.log(parameters);
    const { header, descriptionLine1, descriptionLine2 } = createHeaderAndDescription(parameters[0]);
    const type = getResourceType(parameters[0]);

    new Render([
        Div(
            header ? h1(t(header)) : do_nothing,
            descriptionLine1 ? p(t(descriptionLine1)) : do_nothing,
            descriptionLine2 ? p(t(descriptionLine2)) : do_nothing,

            div(id('resources'))
        )
    ]);

    get(`/Api/Resources/?ResourceType=${type}&OrderBy=${1}`).then(resources => {

        console.log('resources', resources);

        // sort resources by alphabet / sometimes type
        const sortedResources = new Map();
        sortedResources.set('Other', []);

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < letters.length; ++i) {
            sortedResources.set(letters.charAt(i), []);
        }

        sortedResources.set('Double Trouble', []);

        for (let i = 0; i < resources.length; ++i) {
            const resource = resources[i];

            if (type === 1 && isDoubleTrouble(resource.name)) {
                const doubleTroubleBosses = sortedResources.get('Double Trouble');
                doubleTroubleBosses.push(resource);
                continue;
            }

            const letter = resource.name.charAt(0).toUpperCase();
            const resultsForLetter = sortedResources.get(letter);
            if (resultsForLetter) {
                resultsForLetter.push(resource);
            } else {
                const other = sortedResources.get('Other');
                other.push(resource);
            }
        }


        // draw box containers
        const boxContainers = [];
        for (const sortedResource of sortedResources) {
            if (sortedResource[1].length > 0) {
                boxContainers.push(
                    div(
                        id(sortedResource[0]),
                        hr(),
                        h3(t(sortedResource[0]))
                    )
                )
            }
        }

        new Render([
            Div(
                ...boxContainers
            )
        ], 'resources');

        // draw box sets into containers
        for (const resourceSet of sortedResources) {
            if (resourceSet[1].length > 0) {
                renderBoxes(resourceSet[0], [navigateToResource], resourceSet[1]);
            }
        }
    });
}

function navigateToResource(id) {
    const link = new Link();
    navigate(link.IsaacResource(id), null, PAGE_TYPE_ISAAC_RESOURCE);
}


function registerResourceOverviewPage() {
    registerPage(resourceOverviewPage, 'Overview', ['Items|Bosses|Characters|ItemSources|Floors|Transformations|CharacterRerolls|Curses|Pills|Runes|TarotCards|Trinkets|OtherConsumables']);
}

function isDoubleTrouble(name) {
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

function getResourceType(type) {
    switch (type) {
        case 'Bosses': return 1;
        case 'Characters': return 2;
        case 'CharacterRerolls': return 14;
        case 'Curses': return 3;
        case 'Enemies': return 11;
        case 'Floors': return 5;
        case 'Transformations': return 12;
        case 'Trinkets': return 13;
        case 'Items': return 6;
        case 'ItemSources': return 7;
        case 'OtherConsumables': return 15;
        case 'Pills': return 8;
        case 'Runes': return 9;
        case 'TarotCards': return 10;
        default: return 6;
    }
}

function createHeaderAndDescription(type) {
    let header = '';
    let descriptionLine1 = '';
    let descriptionLine2 = '';

    switch (type) {
        case 'Bosses':
            header = "Overview of all Bosses Northernlion defeated";
            descriptionLine1 = "Click on a boss for more details!";
            break;
        case 'Characters':
            header = "Overview of all Binding Of Isaac-Characters";
            descriptionLine1 = "Click on a character for more details!";
            break;
        case 'CharacterRerolls':
            header = "Overview of all Character Rerolls in The Binding Of Isaac";
            descriptionLine1 = "A list of all items, rooms or other events that can reroll the character you're playing. Click on a reroll for more details!";
            break;
        case 'Curses':
            header = "Overview of all Curses in The Binding Of Isaac";
            descriptionLine1 = "A list of all curses Northernlion has encountered.";
            descriptionLine2 = "Click on a curse for more details!";
            break;
        case 'Enemies':
            header = "Overview of everything that can kill you in The Binding Of Isaac";
            descriptionLine1 = "Specific Enemies don't kill Northernlion too often, so most entries won't have too much data in them.";
            descriptionLine2 = "However, it can sometimes be interesting to compare enemies with each other! Consider using the 'Options' in the bottom left of the page after selecting an emeny!";
            break;
        case 'Floors':
            header = "Overview of all floors in The Binding Of Isaac";
            descriptionLine1 = "Click on a floor for more details!";
            break;
        case 'Transformations':
            header = "Overview of all Transformations in The Binding Of Isaac";
            descriptionLine1 = "Click on a transformation for more details!";
            break;
        case 'Trinkets':
            header = "Overview of all Trinkets in The Binding Of Isaac";
            descriptionLine1 = "NOTE: Support for trinkets was added very recently, so most trinkets won't have much data yet!";
            break;
        case 'Items':
            header = "Overview of all Items in The Binding Of Isaac";
            descriptionLine1 = "Click on an item for more details!";
            break;
        case 'ItemSources':
            header = "Overview of all Item-Sources in The Binding Of Isaac";
            descriptionLine1 = "Everything that can drop an item can be found here! Click on an item source for more details!";
            break;
        case 'OtherConsumables':
            header = "Overview of Other Consumables";
            descriptionLine1 = "NOTE: Support for misc consumables was added very recently, so most of them won't have much data yet!";
            descriptionLine2 = "Click on a consumable for more details!";
            break;
        case 'Pills':
            header = "Overview of all Pills in The Binding Of Isaac";
            descriptionLine1 = "NOTE: Support for pills was added very recently, so most pills won't have much data yet!";
            descriptionLine2 = "Click on a pill for more details!";
            break;
        case 'Runes':
            header = "Overview of all Runes in The Binding Of Isaac";
            descriptionLine1 = "NOTE: Support for runes was added very recently, so most runes won't have much data yet!";
            descriptionLine2 = "Click on a rune for more details!";
            break;
        case 'TarotCards':
            header = "Overview of all Tarot Cards in The Binding Of Isaac";
            descriptionLine1 = "NOTE: Support for tarot cards was added very recently, so most tarot cards won't have much data yet!";
            descriptionLine2 = "Click on a tarot card for more details!";
            break;
    }

    return {
        header: header,
        descriptionLine1: descriptionLine1,
        descriptionLine2: descriptionLine2
    };
}

(() => {
    registerResourceOverviewPage();
    initRouter();
})();

export {
    registerResourceOverviewPage,
    resourceOverviewPage
}