import { modal, Div, h2, hr, p, t, ul, li, strong, style, span, br, cl, input, attr, h4 } from "../../Framework/renderer";
import { dismissModalSection } from "../General/modal-contents";

export function helpSelectItemsource() {
    modal(true,
        Div(
            h2(
                t('Help'),
            ),
            hr(),

            h4(
                t('It\'s not in the list! What do I do?')
            ),
            p(
                t('Choose \'Missing Item Source\'.')
            ),
            hr(),

            h4(
                t('I\'m not sure what dropped the item...?'),
            ),
            hr(),
            p(
                t('Always select the thing that directly dropped or spawned the item. Examples:')
            ),
            p(
                ul(
                    cl('l'),

                    li(
                        strong(
                            t('NL collects an item from the '),
                            span(
                                t('Item Room'),
                                style('color: gold')
                            ),
                            t('pedestal:')
                        ),
                        br(),
                        t('Select '),
                        span(
                            t('Item Room'),
                            style('color: gold')
                        )
                    ),

                    li(
                        strong(
                            t('NL opens a '),
                            span(
                                t('Red Chest'),
                                style('color: Maroon')
                            ),
                            t(' inside a '),
                            span(
                                t('Curse Room'),
                                style('color: SaddleBrown')
                            ),
                            t(':')
                        ),
                        br(),
                        t('Select '),
                        span(
                            t('Red Chest'),
                            style('color: Maroon')
                        ),
                        t(', because the chest spawned the item, not the curse room!')
                    ),

                    li(
                        strong(
                            t('NL rerolls an item from the '),
                            span(
                                t('Item Room'),
                                style('color: gold')
                            ),
                            t(' with the '),
                            span(
                                t('D6'),
                                style('color: red')
                            ),
                            t(' and collects it:')
                        ),
                        br(),
                        span(
                            t('Select '),
                            span(
                                t('Item Room'),
                                style('color: gold')
                            ),
                            t(', because it\'s still an item that was spawned by the '),
                            span(
                                t('Item Room'),
                                style('color: gold')
                            ),
                            t('! There is a checkbox '),
                            input(
                                attr({ type: 'checkbox', checked: 'true' })
                            ),
                            t(' on the next page called \'This item was rerolled one or more times before pickup\'. Check that! :)')
                        )
                    ),

                    li(
                        strong(
                            t('NL enders an'),
                            span(
                                t('Item Room'),
                                style('color: gold')
                            ),
                            t(', duplicates the item with '),
                            span(
                                t('Diplopia'),
                                style('color: LightGray')
                            ),
                            t(' or '),
                            span(
                                t('Crooked Penny'),
                                style('color: goldenrod')
                            ),
                            t(', then collects BOTH!')
                        ),
                        br(),
                        t('Choose '),
                        span(
                            t('Item Room'),
                            style('color: gold')
                        ),
                        t(' for the original, and '),
                        span(
                            t('Diplopia'),
                            style('color: LightGray')
                        ),
                        t(' or '),
                        span(
                            t('Crooked Penny'),
                            style('color: goldenrod')
                        ),
                        t(' for the copy.')
                    ),

                    li(
                        strong(
                            t('NL collected '),
                            span(
                                t('Eden\'s Blessing'),
                                style('color: MediumTurquoise')
                            ),
                            t(' on the last run and starts with an extra item:')
                        ),
                        br(),
                        t('Choose '),
                        span(
                            t('Eden\'s Blessing'),
                            style('color: MediumTurquoise')
                        ),
                        t(' for the additional starting item instead of the generic "Starting Item" option.')
                    ),

                    li(
                        strong(
                            span(
                                t('GB Bug'),
                                style('color: DarkSeaGreen')
                            ),
                            t(' touched a consumable and rerolled it into an item:')
                        ),
                        br(),
                        t('Choose '),
                        span(
                            t('GB Bug'),
                            style('color: DarkSeaGreen')
                        ),
                        t(', because it created the item.')
                    )
                )
            ),
            dismissModalSection()
        )
    )
}
