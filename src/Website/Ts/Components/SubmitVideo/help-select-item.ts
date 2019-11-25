import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { DismissModal } from "../Modal/dismiss-modal";

export class HelpSelectItem implements Component {
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
                    e: ['h4', 'What counts as a "Collected Item"?']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'Collected passives of course, and spacebar items NL took and used for a while (meaning: they had an impact on the run in some manner).']
                        },
                        {
                            e: ['br']
                        },
                        {
                            e: ['span', 'For spacebar items that were merely touched (for example to get an item out of an item pool or to work towards a transformation) use the "Item Touched" option from the main selection instead of "Item Collected".']
                        }
                    ]
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
                            e: ['span', 'Select only the item that was actually collected, with the "this item was rerolled into" checkbox ']
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
                    e: ['h4', 'I don\'t know what item was collected!']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['span', 'In some rare cases it\'s possible that the collected item cannot be identified at all (corrupted video, absorbing a "?" item while having curse of the blind...).']
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


