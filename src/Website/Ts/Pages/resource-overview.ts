import { Component, FrameworkElement } from "../Framework/renderer";
import { ResourceType } from "../Enums/resource-type";
import { PageData, registerPage, getPageData, initRouter } from "../Framework/router";

export class ResourceOverviewPage implements Component {
    E: FrameworkElement;

    constructor() {
        const type = getPageData() as ResourceType;

        let header = '';
        let descriptionLine1 = '';
        let descriptionLine2 = '';

        switch (type) {
            case ResourceType.Boss:
                header = "Overview of all Bosses Northernlion defeated";
                descriptionLine1 = "Click on a boss for more details!";
                break;
            case ResourceType.Character:
                header = "Overview of all Binding Of Isaac-Characters";
                descriptionLine1 = "Click on a character for more details!";
                break;
            case ResourceType.CharacterReroll:
                header = "Overview of all Character Rerolls in The Binding Of Isaac";
                descriptionLine1 = "A list of all items, rooms or other events that can reroll the character you're playing. Click on a reroll for more details!";
                break;
            case ResourceType.Curse:
                header = "Overview of all Curses in The Binding Of Isaac";
                descriptionLine1 = "A list of all curses Northernlion has encountered.";
                descriptionLine2 = "Click on a curse for more details!";
                break;
            case ResourceType.Enemy:
                header = "Overview of everything that can kill you in The Binding Of Isaac";
                descriptionLine1 = "Specific Enemies don't kill Northernlion too often, so most entries won't have too much data in them.";
                descriptionLine2 = "However, it can sometimes be interesting to compare enemies with each other! Consider using the 'Options' in the bottom left of the page after selecting an emeny!";
                break;
            case ResourceType.Floor:
                header = "Overview of all floors in The Binding Of Isaac";
                descriptionLine1 = "Click on a floor for more details!";
                break;
            case ResourceType.Transformation:
                header = "Overview of all Transformations in The Binding Of Isaac";
                descriptionLine1 = "Click on a transformation for more details!";
                break;
            case ResourceType.Trinket:
                header = "Overview of all Trinkets in The Binding Of Isaac";
                descriptionLine1 = "NOTE: Support for trinkets was added very recently, so most trinkets won't have much data yet!";
                break;
            case ResourceType.Item:
                header = "Overview of all Items in The Binding Of Isaac";
                descriptionLine1 = "Click on an item for more details!";
                break;
            case ResourceType.ItemSource:
                header = "Overview of all Item-Sources in The Binding Of Isaac";
                descriptionLine1 = "Everything that can drop an item can be found here! Click on an item source for more details!";
                break;
            case ResourceType.OtherConsumable:
                header = "Overview of Other Consumables";
                descriptionLine1 = "NOTE: Support for misc consumables was added very recently, so most of them won't have much data yet!";
                descriptionLine2 = "Click on a consumable for more details!";
                break;
            case ResourceType.Pill:
                header = "Overview of all Pills in The Binding Of Isaac";
                descriptionLine1 = "NOTE: Support for pills was added very recently, so most pills won't have much data yet!";
                descriptionLine2 = "Click on a pill for more details!";
                break;
            case ResourceType.Rune:
                header = "Overview of all Runes in The Binding Of Isaac";
                descriptionLine1 = "NOTE: Support for runes was added very recently, so most runes won't have much data yet!";
                descriptionLine2 = "Click on a rune for more details!";
                break;
            case ResourceType.TarotCard:
                header = "Overview of all Tarot Cards in The Binding Of Isaac";
                descriptionLine1 = "NOTE: Support for tarot cards was added very recently, so most tarot cards won't have much data yet!";
                descriptionLine2 = "Click on a tarot card for more details!";
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
            c: children
        }
    }

    static RegisterPage() {
        const page: PageData = {
            AppendTo: 'main-container',
            Component: ResourceOverviewPage,
            Data: ResourceType.Item,
            Title: 'Overview',
            Urls: ['/Items', '/Bosses', '/Characters', '/ItemSources', '/Floors', '/Transformations', '/CharacterRerolls', '/Curses', '/Pills', '/Runes', '/TarotCards', '/Trinkets', '/OtherConsumables']
        }

        registerPage('resource-overview', page);
    }
}

(() => {
    ResourceOverviewPage.RegisterPage();
    initRouter();
})();

