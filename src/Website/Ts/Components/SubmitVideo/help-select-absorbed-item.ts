import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { DismissModal } from "../Modal/dismiss-modal";

export class HelpSelectAbsorbedItem implements Component {
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
                    e: ['h4', 'The item is not in the list!']
                },
                {
                    e: ['p', 'Choose "Missing Item".']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['h4', 'What if the item was rerolled before it was absorbed?']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'Select only the item that was actually sucked up, with the "this item was rerolled into" checkbox ']
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
                    e: ['h4', 'I don\'t know what item was absorbed!']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'Most of the time that happens when a "?" item is sucked up while having curse of the blind. ']
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
                },
                {
                    e: ['hr']
                },
                new DismissModal()
            ]
        }
    }
}


