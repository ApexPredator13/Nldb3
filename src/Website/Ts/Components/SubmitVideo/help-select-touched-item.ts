import { Component, FrameworkElement, A } from "../../Framework/renderer";

export class HelpSelectTouchedItem implements Component {
    E: FrameworkElement;

    constructor() {
        this.E = {
            e: ['div'],
            a: [[A.Class, 'modal-container']],
            c: [
                {
                    e: ['h1', 'Help']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h4', 'The item is not in the list!']
                },
                {
                    e: ['p', 'Choose "Missing Item".']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h4', 'What if the item was rerolled?']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'Select only the item that was actually touched, with the "this item was rerolled into" checkbox ']
                        },
                        {
                            e: ['input'],
                            a: [[A.Type, 'checkbox'], [A.Checked, 'true']]
                        },
                        {
                            e: ['span', ' checked.']
                        }
                    ]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h4', 'What counts as touched item?']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'Collected spacebar items that were only ']
                        },
                        {
                            e: ['span', 'picked up and put down again'],
                            a: [[A.Style, 'color: orange']]
                        },
                        {
                            e: ['span', ', to get them out of the item pool or get the transformation progress benefit.']
                        },
                        {
                            e: ['br']
                        },
                        {
                            e: ['span', 'For passives and spacebar items that were actually used and had some impact on the run, use the "Item Collected" option instead.']
                        }
                    ]
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h4', 'I don\'t know what item was touched!']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'In some rare cases it\'s possible that the item cannot be identified at all (corrupted video, absorbing a "?" item while having curse of the blind...).']
                        },
                        {
                            e: ['br']
                        },
                        {
                            e: ['span', 'In this case, choose ']
                        },
                        {
                            e: ['span', '"Unknown Item"'],
                            a: [[A.Style, 'color: orange']]
                        },
                        {
                            e: ['span', ' from the list.']
                        }
                    ]
                }
            ]
        }
    }
}