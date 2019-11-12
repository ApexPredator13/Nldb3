import { Component, FrameworkElement, Attribute, EventType, AsyncComponentPart } from "../../Framework/renderer";
import { getUser, signin, isAdmin, loadAdminPages } from "../../Framework/authentication";
import { NavSection } from "../../Components/Navigation/nav-section";
import { ResourceType } from "../../Enums/resource-type";
import { goToRouteWithUrl } from "../../Framework/router";

export class NavigationComponent implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>

    constructor() {
        const authContainerId = 'nav-auth-container';
        const navSectionClass = 'nav-section';

        this.E = {
            e: ['nav'],
            a: [[Attribute.Class, 'w20'], [Attribute.Id, 'nav']],
            c: [
                {
                    e: ['div'],
                    a: [[Attribute.Class, `${navSectionClass} l`], [Attribute.Id, authContainerId]],
                    c: [
                        {
                            e: ['p', 'Checking login state...']
                        }
                    ]
                },
                {
                    e: ['div'],
                    a: [[Attribute.Class, navSectionClass]],
                    c: [
                        new NavSection(770, '/', 'Front Page')
                    ]
                },
                {
                    e: ['div'],
                    a: [[Attribute.Class, navSectionClass]],
                    c: [
                        {
                            e: ['h3', 'Learn more about...']
                        },
                        new NavSection(630, '/Episodes', 'Episodes'),
                        new NavSection(70,  '/Items', 'Collected Items', ResourceType.Item),
                        new NavSection(140, '/Bosses', 'Bossfights', ResourceType.Boss),
                        new NavSection(455, '/Characters', 'Played Characters', ResourceType.Character),
                        new NavSection(420, '/ItemSources', 'Item Sources', ResourceType.ItemSource),
                        new NavSection(490, '/Quotes', 'Quotes'),
                        new NavSection(105, '/Floors', 'Floors', ResourceType.Floor),
                        new NavSection(525, '/Transformations', 'Transformations', ResourceType.Transformation),
                        new NavSection(385, '/CharacterRerolls', 'Character Rerolls', ResourceType.CharacterReroll),
                        new NavSection(560, '/Curses', 'Curses', ResourceType.Curse),
                        new NavSection(175, '/Pills', 'Swallowed Pills', ResourceType.Pill),
                        new NavSection(245, '/Runes', 'Used Runes', ResourceType.Rune),
                        new NavSection(210, '/TarotCards', 'Tarot Cards', ResourceType.TarotCard),
                        new NavSection(280, '/Trinkets', 'Collected Trinkets', ResourceType.Trinket),
                        new NavSection(315, '/OtherConsumables', 'Other Consumables', ResourceType.OtherConsumable)
                    ]
                },
                {
                    e: ['div'],
                    a: [[Attribute.Class, navSectionClass]],
                    c: [
                        new NavSection(805, '/Downloads', 'Downloads')
                    ]
                }
            ]
        }

        this.A = [{
            P: this.CreateUserSection(),
            I: authContainerId
        }];
    }

    private async CreateUserSection(): Promise<FrameworkElement> {
        const user = await getUser();
        console.info('(navigation) user is', user);

        if (!user) {
            const element: FrameworkElement = {
                e: ['p'],
                c: [
                    {
                        e: ['a', 'Login / Register'],
                        v: [[EventType.Click, e => { e.preventDefault(); signin(); }]]
                    }
                ]
            }
            return element;
        } else {
            const userProfileLinks = new Array<FrameworkElement>();
            userProfileLinks.push({
                e: ['a', 'Logout'],
                a: [[Attribute.Href, '/Account/Logout']]
            });

            if (isAdmin(user)) {
                loadAdminPages();
                userProfileLinks.push({
                    e: ['br']
                }, {
                    e: ['a', 'Admin-Area'],
                    a: [[Attribute.Href, '/Admin/Overview']],
                    v: [[EventType.Click, e => { e.preventDefault(); goToRouteWithUrl('/Admin/Overview'); }]]
                });
            }

            const element: FrameworkElement = {
                e: ['p', 'Logged in as: '],
                c: [
                    {
                        e: ['span'],
                        a: [[Attribute.Class, 'orange']],
                        c: [
                            {
                                e: ['strong', `${user.profile.name}`]
                            }
                        ]
                    },
                    {
                        e: ['br']
                    },
                    ...userProfileLinks
                ]
            }
            return element;
        }
    }
}

