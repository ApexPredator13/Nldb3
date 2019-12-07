import { Component, FrameworkElement, A, EventType, AsyncComponentPart, htmlAttributeNameOf } from "../../Framework/renderer";
import { IsaacResource } from "../../Models/isaac-resource";
import { ComponentWithSubscribers } from "../../Framework/ComponentBaseClasses/component-with-subscribers";
import { ResourceType } from "../../Enums/resource-type";
import { removeClassIfExists, addClassIfNotExists } from "../../Framework/browser";

export class SearchboxComponent<TSubscriber extends Object> extends ComponentWithSubscribers<TSubscriber, string> implements Component {

    E: FrameworkElement;
    A: Array<AsyncComponentPart> | undefined;

    constructor(subscriber: TSubscriber, private someSearchboxId: number, private data: Array<IsaacResource> | Promise<Array<IsaacResource> | null>, private displayResourceType: boolean) {
        super(subscriber);

        this.E = {
            e: ['div'],
            a: [[A.Class, 'dd-container']],
            c: [
                {
                    e: ['div'],
                    a: [[A.Class, 'dd-search']],
                    c: [
                        {
                            e: ['input'],
                            a: [[A.Type, 'text'], [A.Class, 'dd-searchbox'], [A.Placeholder, 'filter...']],
                            v: [[EventType.Input, e => this.Filter(e)]]
                        }
                    ]
                },
                {
                    e: ['div'],
                    a: [[A.Id, someSearchboxId.toString(10)]],
                    c: [
                        {
                            e: ['span', 'loading resources...']
                        }
                    ]
                }
            ],
            v: [[EventType.MouseEnter, e => this.FocusOnMouseover(e)]]
        }

        this.A = this.CreateSearchbox();
    }

    private LineClickEvent(e: Event): void {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target;
        if (target && target instanceof HTMLDivElement) {
            let id: string | null = null;

            if (target.className === 'dd-line') {
                id = target.getAttribute('data-id');
            } else if ((target.className === 'dd-text' || target.className === 'dd-image') && target.parentElement) {
                id = target.parentElement.getAttribute('data-id');
            }

            if (id) {
                super.Emit(id);
            }
        }
    }

    private CreateSearchbox(): Array<AsyncComponentPart> {

        const part: AsyncComponentPart = {
            I: this.someSearchboxId.toString(10),
            P: (Array.isArray(this.data) ? Promise.resolve(this.data) : this.data).then(resources => {
                if (resources) {
                    return this.CreateResourceLines(resources);
                } else {
                    const noResources: FrameworkElement = {
                        e: ['span', 'No resources were found']
                    };
                    return noResources;
                }
            })
        };

        return [part];
    }

    private FocusOnMouseover(e: Event) {
        const target = e.target;
        if (target && target instanceof HTMLDivElement) {
            e.stopPropagation();
            const searchBoxes = target.getElementsByClassName('dd-searchbox');
            if (searchBoxes && searchBoxes.length > 0) {
                const firstSearchBox = searchBoxes[0];
                if (firstSearchBox instanceof HTMLInputElement) {
                    firstSearchBox.focus();
                }
            }
        }
    }

    private Filter(e: Event) {
        const target = e.target;
        if (target && target instanceof HTMLInputElement) {
            const value = target.value;
            const parent = target.parentElement;
            if (parent) {
                const linesContainer = parent.nextElementSibling;
                if (linesContainer) {
                    const lines = linesContainer.getElementsByClassName('dd-line');
                    if (!value) {
                        for (let i = 0; i < lines.length; ++i) {
                            removeClassIfExists(lines[i], 'display-none');
                        }
                    } else {
                        const dataLowercaseName = htmlAttributeNameOf(A.DataLowercaseName);
                        for (let i = 0; i < lines.length; ++i) {
                            const text = lines[i].getAttribute(dataLowercaseName);
                            if (text && text.indexOf(value) === -1) {
                                addClassIfNotExists(lines[i], 'display-none');
                            } else {
                                removeClassIfExists(lines[i], 'display-none');
                            }
                        }
                    }
                }
            }
        }
    }

    private CreateResourceLines(data: Array<IsaacResource>): FrameworkElement {
        const lines: Array<FrameworkElement> = new Array<FrameworkElement>();

        if (!data) {
            lines.push({
                e: ['div', 'no data available']
            });
        } else {
            for (let i = 0; i < data.length; ++i) {

                const x = data[i].x <= 0 ? '0px' : `-${data[i].x.toString(10)}px`;
                const y = data[i].y <= 0 ? '0px' : `-${data[i].y.toString(10)}px`;
                const w = data[i].w <= 0 ? '0px' : `${data[i].w.toString(10)}px`;
                const h = data[i].h <= 0 ? '0px' : `${data[i].h.toString(10)}px`;
                const style = `background: url('/img/isaac.png') ${x} ${y} transparent; width: ${w}; height: ${h}`;

                let displayName = data[i].name;
                if (this.displayResourceType) {
                    switch (data[i].resource_type) {
                        case ResourceType.Enemy: displayName += ' (killed by)'; break;
                        case ResourceType.ItemSource: displayName += ' (item source)'; break;
                        case ResourceType.CharacterReroll: displayName += ' (character reroll)'; break;
                        case ResourceType.Boss: displayName += ' (bossfight)'; break;
                    }
                }

                lines.push({
                    e: ['div'],
                    a: [[A.Class, 'dd-line'], [A.DataId, data[i].id], [A.Title, data[i].name], [A.DataLowercaseName, data[i].name.toLowerCase()]],
                    c: [
                        {
                            e: ['div', displayName],
                            a: [[A.Class, 'dd-text']]
                        },
                        {
                            e: ['div'],
                            a: [[A.Class, 'dd-image'], [A.Style, style]]
                        }
                    ],
                    v: [[EventType.Click, e => this.LineClickEvent(e)]]
                });
            }
        }

        const searchboxLinesContainer: FrameworkElement = {
            e: ['div'],
            a: [[A.Class, 'dd-dropdown']],
            c: lines
        }

        return searchboxLinesContainer;
    }
}


