import { Component, FrameworkElement, Attribute, EventType, AsyncComponentPart } from "../../Framework/renderer";
import { getUser, signin } from "../../Framework/authentication";
import { NavSectionComponent } from "../../Components/Navigation/nav-section";

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
                        new NavSectionComponent(770, '/', 'Front Page')
                    ]
                },
                {
                    e: ['div'],
                    a: [[Attribute.Class, navSectionClass]],
                    c: [
                        {
                            e: ['h3', 'Learn more about...']
                        },
                        new NavSectionComponent(630, '/Videos', 'Episodes'),
                        new NavSectionComponent(70, '/Items', 'Collected Items'),
                        new NavSectionComponent(140, '/Bosses', 'Bossfights'),
                        new NavSectionComponent(455, '/Characters', 'Played Characters'),
                        new NavSectionComponent(420, '/ItemSources', 'Item Sources'),
                        new NavSectionComponent(490, '/Quotes', 'Quotes'),
                        new NavSectionComponent(105, '/Floors', 'Floors'),
                        new NavSectionComponent(525, '/Transformations', 'Transformations'),
                        new NavSectionComponent(385, '/CharacterRerolls', 'Character Rerolls'),
                        new NavSectionComponent(560, '/Curses', 'Curses'),
                        new NavSectionComponent(175, '/Pills', 'Swallowed Pills'),
                        new NavSectionComponent(245, '/Runes', 'Used Runes'),
                        new NavSectionComponent(210, '/TarotCards', 'Tarot Cards'),
                        new NavSectionComponent(280, '/Trinkets', 'Collectged Trinkets'),
                        new NavSectionComponent(315, '/OtherConsumables', 'Other Consumables')
                    ]
                },
                {
                    e: ['div'],
                    a: [[Attribute.Class, navSectionClass]],
                    c: [
                        new NavSectionComponent(805, '/Downloads', 'Downloads')
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
                    {
                        e: ['a', 'Logout'],
                        a: [[Attribute.Href, '/Account/Logout']]
                    }
                ]
            }
            return element;
        }
    }
}

