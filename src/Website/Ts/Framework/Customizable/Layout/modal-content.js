import { Div, h3, t, hr, p, button, hideModal, event } from "../../renderer";
import { biblethump } from "../../../Components/General/modal-contents.js";

export function modalContent(msg) {
    return Div(
        h3(
            t('An error has occurred')
        ),
        biblethump(),
        hr(),
        p(
            t('The error message is:'),
        ),
        p(
            t(msg)
        ),
        hr(),
        button(
            t('Dismiss'),
            event('click', () => hideModal())
        )
    )
}


