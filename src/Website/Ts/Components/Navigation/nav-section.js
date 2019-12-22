import { a, href, cl, div, span, t, event, style } from "../../Framework/renderer";
import { navigate } from "../../Framework/router";

export function navSection(px, url, text) {
    return a(
        href(url),
        cl('nav-point', 'hand'),
        event('click', e => navigate(url, e)),

        div(
            cl('nav-icon'),
            style(`background: url('/img/gameplay_events.png') -${px}px 0 transparent`)
        ),
        span(
            t(text)
        )
    );
}

