import { p, span, t, a, cl, event } from "../../Framework/renderer";

export function backToMainSelection(sub) {
    return p(
        span(
            t('← ')
        ),
        a(
            t('Back to Selection'),
            cl('hand', 'u'),
            event('click', () => emitEmpty(sub))
        )
    )
}

function emitEmpty(sub) {
    if (sub) {
        sub('');
    }
}

