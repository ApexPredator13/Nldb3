import { Component, FrameworkElement, Attribute, EventType } from "../../Framework/renderer";
import { getUser, signin } from "../../Framework/authentication";

export class NavigationComponent implements Component {
    E: FrameworkElement;
    AE: Promise<FrameworkElement>
    AEI: string;

    constructor() {
        this.AEI = 'nav-auth-container';

        this.E = {
            e: ['nav'],
            a: [[Attribute.Class, 'w20'], [Attribute.Id, 'nav']],
            c: [
                {
                    e: ['div', 'Checking login state...'],
                    a: [[Attribute.Class, 'nav-section l'], [Attribute.Id, this.AEI]],
                }
            ]
        }

        this.AE = this.CreateUserSection();
    }

    private async CreateUserSection(): Promise<FrameworkElement> {
        const user = await getUser();
        console.info('(navigation) user is', user);

        if (!user) {
            const element: FrameworkElement = {
                e: ['p', 'User not found!'],
                c: [
                    {
                        e: ['br']
                    },
                    {
                        e: ['span', 'Login'],
                        v: [[EventType.Click, () => signin()]]
                    }
                ]
            }
            return element;
        } else {
            const element: FrameworkElement = {
                e: ['p', `Logged in as: ${user.profile.name}`]
            }
            return element;
        }
    }
}

