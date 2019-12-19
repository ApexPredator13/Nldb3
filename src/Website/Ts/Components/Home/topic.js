import { div, t, style, p, event } from "../../Framework/renderer";
import { navigate } from "../../Framework/router";

export function topic(title, yOffset, url) {
    return div(
        event(e => navigate(url, e)),
        cl('topic'),
        div(
            style(`background: url('/img/frontpage.png') 0px ${yOffset}px transparent`)
        ),
        p(
            t(title)
        )
    );
}

