import { render, Component } from "./renderer";

type popupEventData = {
    event: Event,
    popup: Component,
}

const registerPopupEvent = () => {
    console.log('registering popup event...');

    window.addEventListener("showPopup", ((e: CustomEvent<popupEventData>) => {
        const data = e.detail;
        const target = data.event.target;
        console.log('showPopup event!', data);
        if (!target || !(target instanceof HTMLDivElement)) {
            console.warn('target is null pr not HTMLDivElement', target);
            return;
        }
        if (target.innerHTML) {
            console.warn('target is not empty', target.innerHTML);
            return;
        }

        const html = render(data.popup);

        if (html) {
            if (!html.classList.contains('popup')) {
                html.classList.add('popup');
            }

            target.appendChild(html);
        } else {
            console.warn('component was not rendered', html);
        }
    }) as EventListener);
}

export {
    registerPopupEvent,
    popupEventData
}