import { modal, Div, h2, hr, h4, p, t, input, attr, br, span, style } from "../../Framework/renderer";
import { dismissModalSection } from "../General/modal-contents";

export function helpSelectAbsorbedItemModal() {
    modal(true, Div(
        h2('Help'),
        hr(),
        h4(
            t('The item is not in the list!')
        ),
        p(
            t('Choose "Missing Item".')
        ),
        hr(),
        h4(
            t('What if the item was rerolled before it was absorbed?')
        ),
        p(
            t('Select only the item that was actually sucked up, with the "this item was rerolled into" checkbox '),
            input(
                attr({ type: 'checkbox', checked: 'true' })
            ),
            t(' checked.')
        ),
        hr(),
        h4(
            t('I don\'t know what item was absorbed!')
        ),
        p(
            t('Most of the time that happens when a "?" item is sucked up while having curse of the blind.'),
            br(),
            t('In this case, choose '),
            span(
                t('"Unknown Item" '),
                style('color: orange')
            ),
            t('from the list.')
        ),
        dismissModalSection()
    ));
}

