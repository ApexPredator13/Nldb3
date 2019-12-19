import { div, attr, cl, h3 } from "../../Framework/renderer";
import { navigate } from "../../Framework/router";

function statImage(xOffset, yOffset, link, pageType) {
    return div(
        attr({ class: 'fp-right hand', style: `background: url('/img/frontpage.png') ${xOffset}px ${yOffset}px transparent; width: 50px; height: 50px` }),
        event('click', e => navigate(link, e, pageType))
    );
}

function statText(text) {
    return div(
        t(text),
        cl('fp-left', 'l')
    );
}

function statHeader(text) {
    return div(
        cl('fp-stats-header'),
        h3(
            t(text)
        )
    );
}

export {
    statImage,
    statText,
    statHeader
}

