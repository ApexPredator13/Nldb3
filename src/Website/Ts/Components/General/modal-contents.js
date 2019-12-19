import { img, src, Div, cl, h1, t, hr, p, span, a, button, hideModal, event } from "../../Framework/renderer";
import { signin } from "../../Framework/Customizable/authentication";

function biblethump() {
    return img(
        src('/img/biblethump.png')
    );
}

function notLoggedIn() {
    return Div(
        cl('modal-container'),

        h1(
            t('Not logged in!')
        ),
        biblethump(),
        hr(),
        p(
            span(
                t('Please ')
            ),
            a(
                t('log yourself in'),
                cl('orange', 'u', 'hand'),
                event('click', e => { e.preventDefault(); signin(); })
            ),
            span(
                t(' or ')
            ),
            a(
                t('create an account'),
                cl('orange', 'u', 'hand'),
                event('click', e => { e.preventDefault(); signin(); })
            ),
            span(
                t('before proceeding.')
            )
        ),
        hr(),
        button(
            t('Dismiss'),
            event('click', () => hideModal())
        )
    )
}

export {
    biblethump,
    notLoggedIn
}


