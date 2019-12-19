import { div, style, cl, p, t, strong, id, span } from "../../Framework/renderer";

function rankImage(xOffset, yOffset) {
    return div(
        style(`background: url('/img/frontpage.png') ${xOffset}px ${yOffset}px transparent; width: 50px; height: 50px;`),
        cl('fp-right')
    );
}

function rankName(user, rank) {
    return p(
        t(`Rank ${rank.toString(10)}: `),
        cl('fp-left'),

        span(
            strong(
                t(user.name),
                id('number-one')
            ),
        ),
        span(
            t(` (${user.contributions.toString(10)} contributions)`)
        )

    );
}

export {
    rankImage,
    rankName
}

