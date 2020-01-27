import { p, div, h2, h3, t, a, href, event, br, attr, id } from '../../Framework/renderer';
import { navigate } from '../../Framework/router';
import { Link } from '../../Pages/_link-creator';

function overhaulWarning() {
    const link = new Link();

    return div (
        id('overhaul-warning'),
        p(
            t('Note: This website just recieved a major overhaul!'),
            br(),
            t('If you run into any issues (or if you have any suggestions), '),
            a(
                t('submitting a quick bug report'),
                href(link.reportProblem()),
                event('click', e => navigate(link.reportProblem(), e))
            ),
            t(' or '),
            a(
                attr({
                    target: '_blank',
                    href: 'https://github.com/ApexPredator13/Nldb3'
                }),
                t('submitting an issue on github')
            ),
            t(' is very much appreciated! Thank you!')
        )
    );
}


export {
    overhaulWarning
}

