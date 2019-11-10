import { Component, FrameworkElement, Attribute, AsyncComponentPart } from "../Framework/renderer";
import { TopicComponent } from "../Components/Home/Topic";
import { Frontpage } from "../Models/frontpage";
import { get } from "../Framework/http";
import { FrontpageTopUser } from "../Models/frontpage-top-user";
import { RankNameComponent, RankImageComponent } from "../Components/Home/Rank";
import { StatImageComponent, StatTextComponent, StatsHeaderComponent } from "../Components/Home/Stat";
import { registerPage, PageData, initRouter } from "../Framework/router";
import { ResourceType } from "../Enums/resource-type";

export class HomePage implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    constructor() {
        const asyncContainerId = 'below-fold-content';
        this.E = this.AboveTheFoldContent(asyncContainerId);
        this.A = [{ P: this.BelowTheFoldContent(), I: asyncContainerId }];
    }
    
    static RegisterPage() {
        const page: PageData = {
            AppendTo: 'main-container',
            Component: HomePage,
            Title: 'Welcome to the Northernlion Database',
            Urls: ['/']
        }

        registerPage('home', page);
    }

    private AboveTheFoldContent(asyncContainerId: string): FrameworkElement {

        const topic1 = new TopicComponent('Isaac Episodes', "-100", '/Episodes');
        const topic2 = new TopicComponent('Items', "-241", '/Items', ResourceType.Item);
        const topic3 = new TopicComponent('Quotes', "-382", '/');
        const topic4 = new TopicComponent('Item Sources', "-523", '/ItemSources', ResourceType.ItemSource);
        const topic5 = new TopicComponent('Bossfights', "-664", '/Bosses', ResourceType.Boss);
        const topic6 = new TopicComponent('Characters', "-805", '/Characters', ResourceType.Character);
        const topic7 = new TopicComponent('Floors', "-946", '/Floors', ResourceType.Floor);
        const topic8 = new TopicComponent('Random Episode Generator', "-1369", '/');
        const topic9 = new TopicComponent('Transformations', "-1228", '/Transformations', ResourceType.Transformation);

        return {
            e: ['div'],
            c: [
                { e: ['h1', 'Welcome to the Northernlion Database!'] },
                { e: ['p', 'A database dedicated to the best Let\'s Play series on the internet.'] },
                { e: ['hr'] },
                {
                    e: ['div'],
                    a: [[Attribute.Id, 'topics']],
                    c: [
                        {
                            e: ['div'],
                            a: [[Attribute.Class, 'topics-row']],
                            c: [
                                topic1.E,
                                topic2.E,
                                topic3.E
                            ]
                        },
                        {
                            e: ['div'],
                            a: [[Attribute.Class, 'topics-row']],
                            c: [
                                topic4.E,
                                topic5.E,
                                topic6.E
                            ]
                        },
                        {
                            e: ['div'],
                            a: [[Attribute.Class, 'topics-row']],
                            c: [
                                topic7.E,
                                topic8.E,
                                topic9.E
                            ]
                        }
                    ]
                },
                {
                    e: ['div', 'loading page...'],
                    a: [[Attribute.Id, asyncContainerId]]
                }
            ]
        }
    }

    private async BelowTheFoldContent(): Promise<FrameworkElement> {

        const [topUsers, data] = await Promise.all([
            get<Array<FrontpageTopUser>>('/api/frontpage/top-users'),
            get<Frontpage>('/api/frontpage'),
        ]);

        const restUsers: Array<FrameworkElement> = new Array<FrameworkElement>();
        for (let i = 3; i < topUsers.length; ++i) {
            restUsers.push({ e: ['span', topUsers[i].name + (i === topUsers.length - 1 ? '' : ', ')] })
        }

        const belowFoldContent: FrameworkElement = {
            e: ['div'],
            c: [
                {
                    e: ['div'],
                    a: [[Attribute.Id, 'top-contributors-container']],
                    c: [
                        {
                            e: ['div'],
                            a: [[Attribute.Class, 'fp-contributors-header']],
                            c: [
                                {
                                    e: ['h3', 'Big thanks to our top contributors!!']
                                }
                            ]
                        },
                        new RankImageComponent('0', '-1560'),
                        new RankNameComponent(topUsers[0], 1),
                        new RankImageComponent('-50', '-1560'),
                        new RankNameComponent(topUsers[1], 2),
                        new RankImageComponent('-100', '-1560'),
                        new RankNameComponent(topUsers[2], 3),
                        {
                            e: ['div'],
                            a: [[Attribute.Class, 'fp-contributors-header']],
                            c: [
                                {
                                    e: ['h3', '...and all the other major contributors!']
                                }
                            ]
                        },
                        {
                            e: ['div'],
                            a: [[Attribute.Style, 'padding: 0 20%; background-color: transparent; font-size: 1.1rem; border-top: none'], [Attribute.Class, 'fp-contributors-header']],
                            c: [
                                {
                                    e: ['p'],
                                    a: [[Attribute.Style, 'padding-top: 0'], [Attribute.Id, 'major-contributors']],
                                    c: restUsers
                                }
                            ]
                        }
                    ]
                },
                {
                    e: ['div'],
                    a: [[Attribute.Id, 'fp-stats-container']],
                    c: [
                        new StatsHeaderComponent(`So far, ${data.video_count.toString(10)} videos have been added to the database. In those videos, Northernlion...`),
                        new StatImageComponent('0', '-1510'),
                        new StatTextComponent(`...picked up ${data.items_collected.toString(10)} items`),
                        new StatImageComponent('-50', '-1510'),
                        new StatTextComponent(`...fought ${data.bosses_fought.toString(10)} bosses`),
                        new StatImageComponent('-100', '-1510'),
                        new StatTextComponent(`...went through ${data.floors_visited.toString(10)} floors`),
                        new StatImageComponent('-150', '-1510'),
                        new StatTextComponent(`...played for ${data.total_playtime_days.toString(10)} full days, ${data.total_playtime_hours.toString(10)} hours, ${data.total_playtime_minutes.toString(10)} minutes and ${data.total_playtime_seconds.toString(10)} seconds`),
                        new StatImageComponent('0', '-1610'),
                        new StatTextComponent(`...played ${data.characters_played.toString(10)} characters`),
                        new StatImageComponent('-150', '-1560'),
                        new StatTextComponent(`...lost ${data.average_deaths.toString(10)} runs`),

                        new StatsHeaderComponent('On an average run, Northernlion...'),
                        new StatImageComponent('-50', '-1610'),
                        new StatTextComponent(`collects ${data.average_items_total.toFixed(2)} items`),
                        new StatImageComponent('-100', '-1610'),
                        new StatTextComponent(`fights ${data.average_bossfights.toFixed(2)} bosses`),
                        new StatImageComponent('-150', '-1610'),
                        new StatTextComponent(`buys ${data.average_items_shop.toFixed(2)} items from the shop`),
                        new StatImageComponent('0', '-1660'),
                        new StatTextComponent(`goes through ${data.average_floors_visited.toFixed(2)} floors`),
                        new StatImageComponent('-50', '-1660'),
                        new StatTextComponent(`dies ${data.average_deaths.toFixed(2)} times`),
                        new StatImageComponent('-100', '-1660'),
                        new StatTextComponent(`picks up ${data.average_chest_items.toFixed(2)} items from the chest`),
                        new StatImageComponent('-150', '-1660'),
                        new StatTextComponent(`transforms ${data.average_transformations.toFixed(2)} times`),
                        new StatImageComponent('0', '-1710'),
                        new StatTextComponent(`has a ${data.average_chest_items.toFixed(2)}% chance of winning`)
                    ]
                },
                {
                    e: ['div'],
                    a: [[Attribute.Style, 'width: 100%; height: 300px']]
                }
            ]
        }
        return belowFoldContent;
    }
}

(() => {
    HomePage.RegisterPage();
    initRouter();
})();

