import { Component, FrameworkElement, A } from "../../Framework/renderer";
import { DismissModal } from "../Modal/dismiss-modal";

export class HelpSelectItemsource implements Component {
    E: FrameworkElement;

    constructor() {
        this.E = {
            e: ['div'],
            a: [[A.Class, 'modal-container']],
            c: [
                {
                    e: ['h2', 'What droppen an item?']
                },
                {
                    e: ['hr']
                },
                {
                    e: ['p', 'Always select the thing that directly dropped or spawned the item.'],
                },
                {
                    e: ['p', 'Examples:']
                },
                {
                    e: ['p'],
                    c: [
                        {
                            e: ['ul'],
                            a: [[A.Class, 'l']],
                            c: [
                                {
                                    e: ['li'],
                                    c: [
                                        {
                                            e: ['strong'],
                                            c: [
                                                {
                                                    e: ['span', 'NL collects an item from the ']
                                                },
                                                {
                                                    e: ['span', 'Item Room'],
                                                    a: [[A.Style, 'color: gold']]
                                                },
                                                {
                                                    e: ['span', ' pedestal: ']
                                                }
                                            ]
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['span', 'Select ']
                                        },
                                        {
                                            e: ['span', 'Item Room'],
                                            a: [[A.Style, 'color: gold']]
                                        },
                                        {
                                            e: ['span', ' (as you might expect).']
                                        }
                                    ]
                                },
                                {
                                    e: ['li'],
                                    c: [
                                        {
                                            e: ['strong'],
                                            c: [
                                                {
                                                    e: ['span', 'NL opens a ']
                                                },
                                                {
                                                    e: ['span', 'Red Chest'],
                                                    a: [[A.Style, 'color: Maroon']]
                                                },
                                                {
                                                    e: ['span', ' inside a ']
                                                },
                                                {
                                                    e: ['span', 'Curse Room'],
                                                    a: [[A.Style, 'color: SaddleBrown']]
                                                },
                                                {
                                                    e: ['span', ': ']
                                                }
                                            ]
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['span', 'Select ']
                                        },
                                        {
                                            e: ['span', 'Red Chest'],
                                            a: [[A.Style, 'color: Maroon']]
                                        },
                                        {
                                            e: ['span', ', because the chest spawned the item, not the curse room!']
                                        }
                                    ]
                                },
                                {
                                    e: ['li'],
                                    c: [
                                        {
                                            e: ['strong'],
                                            c: [
                                                {
                                                    e: ['span', 'NL rerolls an item from the ']
                                                },
                                                {
                                                    e: ['span', 'Item Room'],
                                                    a: [[A.Style, 'color: gold']]
                                                },
                                                {
                                                    e: ['span', ' with the ']
                                                },
                                                {
                                                    e: ['span', 'D6'],
                                                    a: [[A.Style, 'color: red']]
                                                },
                                                {
                                                    e: ['span', ' and collects it:']
                                                }
                                            ]
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['span', 'Select ']
                                        },
                                        {
                                            e: ['span', 'Item Room'],
                                            a: [[A.Style, 'color: gold']]
                                        },
                                        {
                                            e: ['span', ', because it\'s still an item that was spawned by the ']
                                        },
                                        {
                                            e: ['span', 'Item Room'],
                                            a: [[A.Style, 'color: gold']]
                                        },
                                        {
                                            e: ['span', '! There is a checkbox ']
                                        },
                                        {
                                            e: ['input'],
                                            a: [[A.Type, 'checkbox'], [A.Checked, 'true']]
                                        },
                                        {
                                            e: ['span', ' on the next page called \'This item was rerolled before it was collected\'. Check that! :)']
                                        }
                                    ]
                                },
                                {
                                    e: ['li'],
                                    c: [
                                        {
                                            e: ['strong'],
                                            c: [
                                                {
                                                    e: ['span', 'NL enters an ']
                                                },
                                                {
                                                    e: ['span', 'Item Room'],
                                                    a: [[A.Style, 'color: gold']]
                                                },
                                                {
                                                    e: ['span', ', duplicates the item with ']
                                                },
                                                {
                                                    e: ['span', 'Diplopia'],
                                                    a: [[A.Style, 'color: LightGray']]
                                                },
                                                {
                                                    e: ['span', ' or ']
                                                },
                                                {
                                                    e: ['span', 'Crooked Penny'],
                                                    a: [[A.Style, 'color: Goldenrod']]
                                                },
                                                {
                                                    e: ['span', ', then collects BOTH: ']
                                                }
                                            ]
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['span', 'Choose ']
                                        },
                                        {
                                            e: ['span', 'Item Room'],
                                            a: [[A.Style, 'color: gold']]
                                        },
                                        {
                                            e: ['span', ' for the original, ']
                                        },
                                        {
                                            e: ['span', 'and ']
                                        },
                                        {
                                            e: ['span', 'Diplopia'],
                                            a: [[A.Style, 'color: LightGray']]
                                        },
                                        {
                                            e: ['span', ' or ']
                                        },
                                        {
                                            e: ['span', 'Crooked Penny'],
                                            a: [[A.Style, 'color: Goldenrod']]
                                        },
                                        {
                                            e: ['span', ' for the copy!']
                                        }
                                    ]
                                },
                                {
                                    e: ['li'],
                                    c: [
                                        {
                                            e: ['strong'],
                                            c: [
                                                {
                                                    e: ['span', 'It\'s not in the list! What do I do? ']
                                                }
                                            ],
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['span', 'Choose \'Missing Item Source\'.']
                                        }
                                    ]
                                },
                                {
                                    e: ['li'],
                                    c: [
                                        {
                                            e: ['strong'],
                                            c: [
                                                {
                                                    e: ['span', 'NL collected ']
                                                },
                                                {
                                                    e: ['span', 'Eden\'s Blessing'],
                                                    a: [[A.Style, 'color: MediumTurquoise']]
                                                },
                                                {
                                                    e: ['span', ' on the last run and starts with an extra item: ']
                                                }
                                            ]
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['span', 'Choose ']
                                        },
                                        {
                                            e: ['span', 'Eden\'s Blessing'],
                                            a: [[A.Style, 'color: LightCyan']]
                                        },
                                        {
                                            e: ['span', ' for the additional starting item instead of the generic "Starting Item" option.']
                                        }
                                    ]
                                },
                                {
                                    e: ['li'],
                                    c: [
                                        {
                                            e: ['strong'],
                                            c: [
                                                {
                                                    e: ['span', 'GB Bug'],
                                                    a: [[A.Style, 'color: DarkSeaGreen']]
                                                },
                                                {
                                                    e: ['span', ' touched a consumable and rerolled it into an item:']
                                                }
                                            ]
                                        },
                                        {
                                            e: ['br']
                                        },
                                        {
                                            e: ['span', 'Choose ']
                                        },
                                        {
                                            e: ['span', 'GB Bug'],
                                            a: [[A.Style, 'color: DarkSeaGreen']]
                                        },
                                        {
                                            e: ['span', ', because it created the item.']
                                        },
                                    ]
                                }
                            ]
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