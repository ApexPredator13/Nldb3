import { Component, FrameworkElement, Attribute, EventType } from "../../Framework/renderer";
import { popupEventData } from "../../Framework/custom-events";
import { GameplayEvent } from "../../Models/gameplay-event";

type imageComponentInit = {
    event: GameplayEvent,
    resourceToUse: 1 | 2,
    popup?: {
        twoPlayerMode: boolean,
        component: new (event: GameplayEvent, twoPlayerMode: boolean) => Component,
    }
}

class IsaacImageComponent implements Component {
    E: FrameworkElement;

    constructor(init: imageComponentInit, upscale: boolean = true) {
        const { event, popup, resourceToUse } = init;

        const resource = resourceToUse === 1 ? event.r1 : event.r2;
        if (!resource) {
            this.E = { e: ['div'] };
            return;
        }

        const x = resource.x <= 0 ? '0px' : `-${resource.x.toString(10)}px`;
        const y = resource.y <= 0 ? '0px' : `-${resource.y.toString(10)}px`;
        const w = resource.w.toString(10);
        const h = resource.h.toString(10);
        const p = upscale ? ` margin: ${(Math.floor(resource.h / 2) + 2).toString(10)}px ${(Math.floor(resource.w / 2) + 2).toString(10)}px` : '';
        const style = `background: url('/img/isaac.png') ${x} ${y} transparent; width: ${w}px; height: ${h}px;${p}`;

        const mouseEnterEvent = (e: Event) => {
            if (popup && e.target && e.target instanceof HTMLDivElement) {
                const { component, twoPlayerMode } = popup;

                const eventData: popupEventData = {
                    event: e,
                    popup: new component(event, twoPlayerMode)
                };

                const eventInit: CustomEventInit<popupEventData> = {
                    detail: eventData,
                    bubbles: false
                };

                const customEvent = new CustomEvent<popupEventData>('showPopup', eventInit);
                e.target.style.zIndex = "10000";
                window.dispatchEvent(customEvent);
            }
        };

        const mouseLeaveEvent = (e: Event) => {
            if (popup) {
                const target = e.target;
                if (target && e.target instanceof HTMLDivElement) {
                    e.target.style.zIndex = null;
                }
            }
        };

        this.E = {
            e: ['div'],
            a: [[Attribute.Class, 'iri' + (upscale ? ' upscale-no-margin' : '')], [Attribute.Style, style]],
            v: [[EventType.MouseEnter, mouseEnterEvent], [EventType.MouseLeave, mouseLeaveEvent]]
        };
    }
}

export {
    imageComponentInit,
    IsaacImageComponent
}