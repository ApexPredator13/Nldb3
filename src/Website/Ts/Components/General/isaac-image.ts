import { FrameworkElement, A, ComponentWithPopup, Component } from "../../Framework/renderer";
import { GameplayEvent } from "../../Models/gameplay-event";
import { IsaacResource } from "../../Models/isaac-resource";

class IsaacImage extends ComponentWithPopup implements Component {
    E: FrameworkElement;

    constructor(gameplayEvent: GameplayEvent | IsaacResource, resourceToUse?: 1 | 2, popupComponent?: Component, upscale: boolean = true) {
        super();

        const isGameplayEvent = (gameplayEvent as GameplayEvent).r1 ? true : false;

        let resource: IsaacResource | null;

        if (isGameplayEvent) {
            resource = resourceToUse === 1 ? (gameplayEvent as GameplayEvent).r1 : (gameplayEvent as GameplayEvent).r2;
        } else {
            resource = gameplayEvent as IsaacResource;
        }

        if (!resource) {
            this.E = {
                e: ['div']
            };
            return;
        }

        const x = resource.x <= 0 ? '0px' : `-${resource.x.toString(10)}px`;
        const y = resource.y <= 0 ? '0px' : `-${resource.y.toString(10)}px`;
        const w = resource.w.toString(10);
        const h = resource.h.toString(10);
        const p = upscale ? ` margin: ${(Math.floor(resource.h / 2) + 2).toString(10)}px ${(Math.floor(resource.w / 2) + 2).toString(10)}px` : '';
        const style = `background: url('/img/isaac.png') ${x} ${y} transparent; width: ${w}px; height: ${h}px;${p}`;

        const imageElement: FrameworkElement = {
            e: ['div'],
            a: [[A.Class, 'iri popup-container' + (upscale ? ' upscale' : '')], [A.Style, style]],
        };

        this.E = imageElement;

        if (popupComponent) {
            super.CreatePopupForElement(imageElement, popupComponent);
        }
    }
}

export {
    IsaacImage
}

