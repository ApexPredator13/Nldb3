import { Component, FrameworkElement, A, EventType, AsyncComponentPart } from "../../Framework/renderer";
import { get } from "../../Framework/http";
import { IsaacResource } from "../../Models/isaac-resource";

export class SearchboxComponent implements Component {

    E: FrameworkElement;
    A: Array<AsyncComponentPart> | undefined;

    private subscribers: Array<(id: string) => any>;
    private displayResourceType: boolean

    constructor(data: string | Array<IsaacResource>, someSearchboxId: number, displayResourceType: boolean) {
        this.E = this.CreateFrameworkElement(data, someSearchboxId);
        this.subscribers = new Array<(id: string) => any>();
        this.displayResourceType = displayResourceType;
    }

    Subscribe(fn: (id: string) => any) {
        this.subscribers.push(fn);
    }

    private Emit(e: Event): void {
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
                console.log('emitting', id);
                for (let i = 0; i < this.subscribers.length; ++i) {
                    this.subscribers[i](id);
                }
            }
        }
    }

    private CreateFrameworkElement(data: string | Array<IsaacResource>, id: number): FrameworkElement {
        const isAsync = typeof data === 'string';
        const initialSearchboxContent: FrameworkElement = isAsync ? { e: ['span', 'loading resources...'] } : this.CreateResourceLines(data as Array<IsaacResource>);

        const e: FrameworkElement = {
            e: ['div'],
            a: [[A.Class, 'dd-container']],
            c: [
                {
                    e: ['div'],
                    a: [[A.Class, 'dd-search']],
                    c: [
                        {
                            e: ['input'],
                            a: [[A.Type, 'text'], [A.Class, 'dd-searchbox']],
                            v: [[EventType.Input, e => this.Filter(e)]]
                        }
                    ]
                },
                {
                    e: ['div'],
                    a: [[A.Id, id.toString(10)]],
                    c: [initialSearchboxContent]
                }
            ],
            v: [[EventType.MouseEnter, e => this.FocusOnMouseover(e)]]
        };

        if (isAsync) {
            const asyncComponent = get<Array<IsaacResource>>(data as string).then(resources => {
                const lines = this.CreateResourceLines(resources);
                return lines;
            });
            this.A = [{
                P: asyncComponent,
                I: id.toString(10)
            }];
        }

        return e;
    }

    private FocusOnMouseover(e: Event) {
        const target = e.target;
        if (target && target instanceof HTMLDivElement) {
            e.stopPropagation();
            const searchBoxes = target.getElementsByClassName('dd-search');
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
            if (value) {
                const parent = target.parentElement;
                if (parent) {
                    const linesContainer = parent.nextElementSibling;
                    if (linesContainer) {
                        const lines = linesContainer.getElementsByClassName('dd-line');
                        for (let i = 0; i < lines.length; ++i) {
                            const text = lines[i].getAttribute('data-n');
                            if (text && text.indexOf(value) === -1) {
                                lines[i].classList.add('display-none');
                            } else {
                                lines[i].classList.remove('display-none');
                            }
                        }
                    }
                }
            }
        }
    }

    private CreateResourceLines(data: Array<IsaacResource>) {
        const lines: Array<FrameworkElement> = new Array<FrameworkElement>();

        for (let i = 0; i < data.length; ++i) {
            const x = data[i].x <= 0 ? '0px' : `-${data[i].x.toString(10)}px`;
            const y = data[i].y <= 0 ? '0px' : `-${data[i].y.toString(10)}px`;
            const w = data[i].w <= 0 ? '0px' : `${data[i].w.toString(10)}px`;
            const h = data[i].h <= 0 ? '0px' : `${data[i].h.toString(10)}px`;
            const style = `background: url('/img/isaac.png') ${x} ${y} transparent; width: ${w}; height: ${h}`;

            let displayName = data[i].name;
            if (this.displayResourceType) {
                switch (data[i].resource_type) {
                    case 11: displayName += ' (killed by)'; break;
                    case 7: displayName += ' (item source)'; break;
                    case 14: displayName += ' (character reroll)'; break;
                    case 1: displayName += ' (bossfight)'; break;
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
                v: [[EventType.Click, e => this.Emit(e)]]
            });
        }

        const searchboxLinesContainer: FrameworkElement = {
            e: ['div'],
            a: [[A.Class, 'dd-dropdown']],
            c: lines
        }

        return searchboxLinesContainer;
    }
}


