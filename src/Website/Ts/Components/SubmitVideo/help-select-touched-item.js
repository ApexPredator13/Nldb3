import { modal, Div, h1, t, p, br, hr, input, style, h4, attr } from "../../Framework/renderer";
import { dismissModalSection } from "../General/modal-contents";

export function helpSelectTouchedItem() {
    modal(true,
        Div(
            h1(
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
                t('What if the item was rerolled?')
            ),
            p(
                t('Select only the item that was actually touched, with the "this item was rerolled into" checkbox '),
                input(
                    attr({ type: 'checkbox', checked: 'true' })
                ),
                t(' checked.')
            ),
            hr(),
            h4(
                t('What counts as touched item?')
            ),
            p(
                t('Collected spacebar items that were only '),
                span(
                    t('picked up and put down again'),
                    style('color: orange')
                ),
                t(', to get them out of the item pool or get the transformation progress benefit.')
            ),
            br(),
            t('For passives and spacebar items that were actually used and had some impact on the run, use the "Item Collected" option instead.'),
            hr(),
            h4(
                t('I don\'t know what item was touched!')
            ),
            p(
                t('In some rare cases it\'s possible that the item cannot be identified at all (corrupted video, absorbing a "?" item while having curse of the blind...).'),
                br(),
                t('In this case, choose '),
                span(
                    t('"Unknown Item"'),
                    style('color: orange')
                ),
                t('from the list.')
            ),
            dismissModalSection()
        )
    );
}



