import { Component, FrameworkElement, A, AsyncComponentPart, htmlAttributeNameOf, EventType } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { IsaacImage } from "./isaac-image";
import { ComponentWithSubscribers } from "../../Framework/ComponentBaseClasses/component-with-subscribers";

export class Boxes<TSubscriber extends Object> extends ComponentWithSubscribers<TSubscriber, string> implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    constructor(
        subscriber: TSubscriber,
        private id: number,
        resourcesToDisplay: Array<IsaacResource> | Promise<Array<IsaacResource> | null>,
        imagePath?: string | null,
        upscale?: boolean,
        private limit?: number
    ) {
        super(subscriber);

        this.E = {
            e: ['div'],
            a: [[A.Id, id.toString(10)]]
        }

        if (Array.isArray(resourcesToDisplay)) {
            this.A = this.CreateBoxes(Promise.resolve(resourcesToDisplay), imagePath ? imagePath : '/img/isaac.png', upscale);
        } else {
            this.A = this.CreateBoxes(resourcesToDisplay, imagePath ? imagePath : '/img/isaac.png', upscale);
        }
    }

    private CreateBoxes(resources: Promise<Array<IsaacResource> | null>, imagePath?: string, upscale?: boolean): Array<AsyncComponentPart> {
        const part: AsyncComponentPart = {
            I: this.id.toString(),
            P: resources.then(resources => {

                if (!resources) {
                    const noResources: FrameworkElement = {
                        e: ['div', 'no resources available'],
                        a: [[A.Class, 'box']]
                    }
                    return noResources;
                }

                if (typeof (this.limit) === 'number') {
                    resources = resources.slice(0, this.limit > resources.length ? resources.length : this.limit);
                }

                const boxes: FrameworkElement = {
                    e: ['div'],
                    a: [[A.Class, 'box-container']],
                    c: resources.map(resource => {
                        const width = resource.w > 65 ? `width: ${resource.w * (upscale ? 2 : 1)};` : '';
                        const padding = upscale ? ` padding: 0 20px 20px 20px` : ''
                        const box: FrameworkElement = {
                            e: ['div'],
                            a: [[A.Class, 'box'], [A.DataId, resource.id], [A.Style, `${width}${padding}`]],
                            v: [[EventType.Click, e => this.BoxClickEvent(e)]],
                            c: [
                                {
                                    e: ['div', resource.name]
                                },
                                new IsaacImage(resource, undefined, undefined, upscale, imagePath)
                            ]
                        };
                        return box;
                    })
                }
                return boxes;
            })
        };

        return [part];
    }

    private BoxClickEvent(e: Event) {
        const target = e.target;
        if (target instanceof HTMLDivElement) {
            const parent = target.parentElement;
            if (parent) {
                const targetWithId = target.className === 'box' ? target : parent;
                const dataIdAttributeName = htmlAttributeNameOf(A.DataId);
                const attributeValue = targetWithId.getAttribute(dataIdAttributeName);
                if (attributeValue) {
                    super.Emit(attributeValue);
                }
            }
        }
    }
}

