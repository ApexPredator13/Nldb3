import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { DismissModal } from "../Modal/dismiss-modal";

export class HelpSelectBoss implements Component {
    E: FrameworkElement;

    constructor() {
        this.E = {
            e: ['div'],
            a: [[A.Class, 'modal-container']],
            c: [
                {
                    e: ['h2', 'Help']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h4', 'The boss is not in the list!']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'Selct ']
                        },
                        {
                            e: ['span', 'Missing Boss'],
                            a: [[A.Style, 'color: orange']]
                        },
                        {
                            e: ['span', ' from the list']
                        }
                    ]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h4'],
                    c: [
                        {
                            e: ['span', 'What do I do in ']
                        },
                        {
                            e: ['span', 'Greed Mode'],
                            a: [[A.Style, 'color: gold']]
                        },
                        {
                            e: ['span', '?']
                        }
                    ]
                },
                {
                    e: ['p', 'Ultra Greed and Ultra Greedier if '],
                    c: [
                        {
                            e: ['span', 'Since it\'s just random waves of enemies that happen to include bosses, don\'t add any bossfights to the floors.']
                        },
                        {
                            e: ['br']
                        },
                        {
                            e: ['span', 'The only bossfight that should be added in Greed Mode is ']
                        },
                        {
                            e: ['span', 'Ultra Greed'],
                            a: [[A.Style, 'color: lightgray']]
                        },
                        {
                            e: ['span', ' and ']
                        },
                        {
                            e: ['span', 'Ultra Greedier'],
                            a: [[A.Style, 'color: yellow']]
                        },
                        {
                            e: ['span', '.']
                        }
                    ]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h4', 'When to select "Double XYZ" or "X and Y"?']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'For example: "Double Monstro" or "Pin and Mega Fatty". They always appear in ']
                        },
                        {
                            e: ['span', 'big rooms'],
                            a: [[A.Style, 'color: orange']]
                        },
                        {
                            e: ['span', '. If there is a pair that hasn\'t appeared yet (which is very possible!), just add them as \'Missing Boss\'.']
                        }
                    ]
                },
                {
                    e: ['hr']
                },
                new DismissModal()
            ]
        }
    }
}