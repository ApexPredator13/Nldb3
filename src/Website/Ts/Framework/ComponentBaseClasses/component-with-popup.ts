import { FrameworkElement, Component, EventType, render } from "../renderer";
import { setZIndex, addClassIfNotExists } from "../browser";

type popupEventData = {
    popup: Component,
    event: Event;
}

const registerPopupEvent = () => {
    if (!(window as any).popupEventSet) {
        window.addEventListener("showPopup", ((e: CustomEvent<popupEventData>) => {
            const data = e.detail;
            const target = data.event.target;
            if (!target || !(target instanceof HTMLElement)) {
                return;
            }

            addClassIfNotExists(target, 'popup-container');

            // skip if popup exists already
            const existingPopupElements = target.getElementsByClassName('popup');
            if (existingPopupElements && existingPopupElements.length > 0) {
                return;
            }

            // render popup
            const html = render(data.popup);

            if (html) {
                if (!html.classList.contains('popup')) {
                    html.classList.add('popup');
                }

                target.appendChild(html);
            }
        }) as EventListener);
    }

    (window as any).popupEventSet = true;
}

class ComponentWithPopup {
    CreatePopupForElement(element: FrameworkElement, component: Component) {
        if (!element.v) {
            element.v = new Array<[EventType, EventListener]>();
        }

        const mouseEnter = (e: Event) => {
            const eventData: popupEventData = {
                event: e,
                popup: component
            };

            setZIndex(e, 10000);
            const event: CustomEvent<popupEventData> = new CustomEvent('showPopup', { detail: eventData });
            window.dispatchEvent(event);
        };

        const mouseLeave = (e: Event) => {
            setZIndex(e, null);
        }

        element.v.push([EventType.MouseEnter, mouseEnter], [EventType.MouseLeave, mouseLeave]);
    }
}

export {
    ComponentWithPopup,
    registerPopupEvent,
    popupEventData
}