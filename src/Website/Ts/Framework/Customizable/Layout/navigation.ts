import { Component, FrameworkElement, A, EventType, AsyncComponentPart } from "../../renderer";
import { getUser, signin, isAdmin, loadAdminPages } from "../authentication";
import { NavSection } from "../../../Components/Navigation/nav-section";
import { navigate } from "../../router";
import { Link } from "../../../Pages/_link-creator";
import { ResourceType } from "../../../Enums/resource-type";
import { removeClassIfExists } from "../../browser";

export class NavigationComponent implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>

    constructor() {
        const authContainerId = 'nav-auth-container';
        const navSectionClass = 'nav-section';

        this.E = {
            e: ['nav'],
            a: [[A.Class, 'w20'], [A.Id, 'nav']],
            c: [
                {
                    e: ['div'],
                    a: [[A.Class, `${navSectionClass} l`], [A.Id, authContainerId]],
                    c: [
                        {
                            e: ['p', 'Checking login state...']
                        }
                    ]
                },
                {
                    e: ['div'],
                    a: [[A.Class, navSectionClass]],
                    c: [
                        new NavSection(770, Link.Home(), 'Front Page')
                    ]
                },
                {
                    e: ['div'],
                    a: [[A.Class, navSectionClass]],
                    c: [
                        {
                            e: ['h3', 'Learn more about...'],
                            a: [[A.Class, 'l']]
                        },
                        new NavSection(630, Link.Episodes(), 'Episodes'),
                        new NavSection(70, Link.ResourceOverview(ResourceType.Item), 'Collected Items'),
                        new NavSection(140, Link.ResourceOverview(ResourceType.Boss), 'Bossfights'),
                        new NavSection(455, Link.ResourceOverview(ResourceType.Character), 'Played Characters'),
                        new NavSection(420, Link.ResourceOverview(ResourceType.ItemSource), 'Item Sources'),
                        new NavSection(490, '/Quotes', 'Quotes'),
                        new NavSection(105, Link.ResourceOverview(ResourceType.Floor), 'Floors'),
                        new NavSection(525, Link.ResourceOverview(ResourceType.Transformation), 'Transformations'),
                        new NavSection(385, Link.ResourceOverview(ResourceType.CharacterReroll), 'Character Rerolls'),
                        new NavSection(560, Link.ResourceOverview(ResourceType.Curse), 'Curses'),
                        new NavSection(175, Link.ResourceOverview(ResourceType.Pill), 'Swallowed Pills'),
                        new NavSection(245, Link.ResourceOverview(ResourceType.Rune), 'Used Runes'),
                        new NavSection(210, Link.ResourceOverview(ResourceType.TarotCard), 'Tarot Cards'),
                        new NavSection(280, Link.ResourceOverview(ResourceType.Trinket), 'Collected Trinkets'),
                        new NavSection(315, Link.ResourceOverview(ResourceType.OtherConsumable), 'Other Consumables')
                    ]
                },
                {
                    e: ['div'],
                    a: [[A.Class, navSectionClass]],
                    c: [
                        new NavSection(805, Link.Downloads(), 'Downloads')
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
                a: [[A.Href, '/Account/Logout']]
            });

            if (isAdmin(user)) {
                loadAdminPages().then(() => {
                    const link = document.getElementById('admin-link');
                    removeClassIfExists(link, 'display-none');
                })
                userProfileLinks.push(
                    {
                        e: ['br']
                    },
                    {
                        e: ['a', 'Admin-Area'],
                        a: [[A.Href, '/Admin/Overview'], [A.Id, 'admin-link'], [A.Class, 'display-none']],
                        v: [[EventType.Click, e => { e.preventDefault(); navigate('/Admin/Overview'); }]]
                    }
                );
            }

            const element: FrameworkElement = {
                e: ['p', 'Logged in as: '],
                c: [
                    {
                        e: ['span'],
                        a: [[A.Class, 'orange']],
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

