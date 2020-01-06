import { modal, Div, h2, t, hr, h4, p, span, style, br } from "../../Framework/renderer";
import { dismissModalSection } from "../General/modal-contents";

export function helpSelectBoss() {
    modal(true, Div(
        h2(
            t('Help')
        ),
        hr(),
        h4(
            t('The boss is not in the list!')
        ),
        p(
            t('Select '),
            span(
                t('Missing Boss'),
                style('color: orange')
            ),
            t(' from the list.')
        ),
        hr(),
        h4(
            t('What about bosses that appear as regular enemies later in the game?')
        ),
        p(
            t('Those don\'t count. Only bosses in bossrooms should be added!')
        ),
        hr(),
        h4(
            t('What do I do in '),
            span(
                t('Greed Mode'),
                style('color: gold')
            ),
            t('?')
        ),
        p(
            t('Since it\'s just random waves of enemies that happen to include bosses, don\'t add any bossfights to the floors.'),
            br(),
            t('The only bossfight that should be added in Greed Mode is '),
            span(
                t('Ultra Greed'),
                style('color: lightgray')
            ),
            t(' and '),
            span(
                t('Ultra Greedier'),
                style('color: yellow')
            ),
            t('.')
        ),
        hr(),
        h4(
            t('When to select "Double XYZ" or "X and Y"?')
        ),
        p(
            t('For example: "Double Monstro" or "Pin and Mega Fatty". They always appear in '),
            span(
                t('big rooms'),
                style('color: orange')
            ),
            t('. If there is a pair that hasn\'t appeared yet (which is very possible!), just add them as \'Missing Boss\'.')
        ),
        dismissModalSection()
    ));
}


