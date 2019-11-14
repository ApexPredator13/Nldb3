import { render, Component } from "./renderer";
import { addClassIfNotExists } from "./browser";

type popupEventData = {
    popup: Component,
    event: Event;
}

const registerPopupEvent = () => {
    if (!(window as any).popupEventSet) {
        console.log('registering popup event...');
        window.addEventListener("showPopup", ((e: CustomEvent<popupEventData>) => {
            const data = e.detail;
            const target = data.event.target;
            if (!target || !(target instanceof HTMLElement)) {
                return;
            }

            addClassIfNotExists(target, 'popup-container');

            // skip if popup exists already
            if (target.innerHTML) {
                return;
            }

            // render popup
            const html = render(data.popup);

            if (html) {
                if (!html.classList.contains('popup')) {
                    html.classList.add('popup');
                }

                target.appendChild(html);
            } else {
                console.warn('popup component was not rendered', html);
            }
        }) as EventListener);
    }

    (window as any).popupEventSet = true;
}

export {
    registerPopupEvent,
    popupEventData
}
