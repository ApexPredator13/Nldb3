import { Div, h3, t, hr, p, button, hideModal } from "../../renderer";
import { biblethump } from "../../../Components/General/modal-contents.js";

export function modalContent(msg) {
    return Div(
        h3(
            t('An error has occurred')
        ),
        biblethump(),
        hr(),
        p('The error message is:'),
        p(msg),
        hr(),
        button(
            t('Dismiss'),
            event('click', () => hideModal())
        )
    )
}


