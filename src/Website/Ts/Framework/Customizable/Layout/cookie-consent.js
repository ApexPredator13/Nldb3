import { getFromLocalStorage, saveToLocalStorage, addClassIfNotExists } from "../../browser"
import { Html, Div, div, h3, t, p, button, event, attr, style } from "../../renderer";


function renderCookieConsentIfNeeded() {
    const consent = getFromLocalStorage('cookie-consent');
    if (!consent || !consent.agreed) {
        new Html([Div(
            attr({
                id: 'cookie-consent-box',
                class: 'l',
                style: 'color: black; font-size: 0.9rem;'
            }),
            div(
                h3(
                    t('Cookie Consent'),
                    style('margin-bottom: 0')
                ),
                p(
                    style('margin: 0.2rem'),
                    t(
                        'This website will not use cookies to track users in any way. However, if you '
                        + 'choose to interact with parts of this website that are made possible with the help of external software providers '
                        + '(login via google, twitch, steam, twitter or the embedded youtube player), these providers '
                        + 'might set cookies that can track users.'
                    )
                )
            ),
            div(
                style('padding-right: 0.5rem;'),
                button(
                    style('font-size: 1.3rem; padding: 1rem;'),
                    t('Understood!'),
                    event('click', e => {
                        e.preventDefault();
                        saveToLocalStorage('cookie-consent', { agreed: true });
                        addClassIfNotExists(document.getElementById('cookie-consent-box'), 'display-none');
                    })
                )
            )
        )], 'body', true, false);
    }
}


export {
    renderCookieConsentIfNeeded
}