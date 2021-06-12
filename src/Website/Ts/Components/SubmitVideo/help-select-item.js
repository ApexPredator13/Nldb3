import { modal, Div, h2, hr, p, span, t, h4, input, br, attr, style } from "../../Framework/renderer";
import { dismissModalSection } from "../General/modal-contents";

export function helpSelectItem() {
    modal(true, Div(
        h2(
            t('Help')
        ),
        hr(),
        h4(
            t('The item is not in the list!')
        ),
        p(
            t('Choose "Missing Item".')
        ),
        hr(),
        h4(
            t('What counts as "Collected Item"?')
        ),
        p(
            t('Collected passives of course, and spacebar items NL took and used for a while (meaning: they had an impact on the run in some manner).'),
            br(),
            t('For spacebar items that were merely touched(for example to get an item out of an item pool or to work towards a transformation) use the "Item Touched" option from the main selection instead of "Item Collected".')
        ),
        hr(),
        h4(
            t('What if the item was rerolled?')
        ),
        p(
            t('Select only the item that was actually collected, with the "this item was rerolled into" checkbox '),
            input(
                attr({ type: 'checkbox', checked: 'true' })
            ),
            t(' checked.')
        ),
        hr(),
        h4(
            t('I don\'t know what item was collected!')
        ),
        p(
            t('In some rare cases it\'s possible that the collected item cannot be identified at all (corrupted video, absorbing a "?" item while having curse of the blind...).'),
            br(),
            t('In this case, choose '),
            span(
                t('"Unknown Item"'),
                style('color: orange')
            ),
            t(' from the list.')
        ),
        hr(),
        h4(
            t('What are "Chest Item" and "Dark Room Item"?')
        ),
        p(
            t('Items on those floors that are dropped by chests or exploded slot machines.')
        ),
        hr(),
        h4(
            t('Do I add items that exploded into consumables while NL was playing as Tainted Cain?')
        ),
        p(
            t('No, those had no impact on the run at all and should be ignored. In those type of runs, only add items that were collected via Bag of Crafting.')
        ),
        dismissModalSection()
    ))
}



