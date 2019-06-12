import { Subject } from "rxjs";
import { SelectedIsaacObject } from "../interfaces/selected-isaac-object";
import { ComponentType } from "../enums/component-type";
import { addClassIfNotExists, removeClassIfExists } from "../lib/dom-operations";
import { PrerenderedComponent } from "./prerendered-component";

export class SearchBox extends PrerenderedComponent {

    public elementWasSelected = new Subject<string>();

    private static highlightClassname = 'highlight';

    private lines = new Array<SelectedIsaacObject>();
    private selected = 0;
    private selectedLine: SelectedIsaacObject | null = null;
    private lastSelectedLine: SelectedIsaacObject | null = null;
    private searchBoxInputElement: HTMLInputElement | null = null;

    constructor(prerenderedSearchBoxElementId: string) {
        // register component
        super(ComponentType.SearchBox, prerenderedSearchBoxElementId);
        const searchBoxComponent = super.GetComponent(ComponentType.SearchBox, prerenderedSearchBoxElementId);

        // initialize search events
        const searchElements = searchBoxComponent.getElementsByClassName('dd-searchbox');
        if (searchElements.length > 0) {
            this.searchBoxInputElement = searchElements[0] as HTMLInputElement;

            // filter on input
            this.searchBoxInputElement.addEventListener('input', e => {
                if (e.target && e.target instanceof HTMLInputElement) {
                    this.Filter(e.target.value);
                    this.HighlightElement(0);
                }
            });

            // emit highlighted element on [Enter] keypress
            this.searchBoxInputElement.addEventListener('keydown', e => {
                if (e.keyCode === 13) {
                    this.Emit();
                }
            });

            // searchbox focus on hover
            searchBoxComponent.addEventListener('mouseover', () => {
                if (this.searchBoxInputElement) {
                    this.searchBoxInputElement.focus();
                }
            });

            // navigate via up and down arrows
            searchBoxComponent.addEventListener('keydown', e => {
                if (e.keyCode === 40) {
                    if (this.selected < this.lines.length) {
                        this.HighlightElement(this.selected + 1, true);
                    }
                } else if (e.keyCode === 38) {
                    if (this.selected > 0) {
                        this.HighlightElement(this.selected - 1, false);
                    }
                }
            });
        }

        const searchBoxLines = searchBoxComponent.getElementsByClassName('dd-line');

        for (let i = 0; i < searchBoxLines.length; i++) {
            // save all lines via name (= lowercased title) in a map for quick searching
            const title = searchBoxLines[i].getAttribute('title');
            if (title) {
                this.lines.push({ element: <HTMLDivElement>searchBoxLines[i], visible: true, name: title.toLowerCase() });
            }

            // add click event to each item
            (searchBoxLines[i] as HTMLDivElement).addEventListener('click', e => {
                e.stopPropagation();
                if (e.target) {
                    let target = e.target as HTMLDivElement;

                    // text or image was clicked - redirect to parent
                    if (target.classList.contains('dd-text') || target.classList.contains('dd-image')) {
                        target = <HTMLDivElement>target.parentElement;
                    }

                    // emit element
                    const id = target.getAttribute('data-id');
                    if (id) {
                        this.Emit(id);
                    }

                    // reset searchbox
                    this.Reset();
                }
            });
        }

        this.HighlightElement();
    }

    Focus(): void {
        if (this.searchBoxInputElement) {
            this.searchBoxInputElement.focus();
        }
    }

    Reset(): void {
        if (this.searchBoxInputElement) {
            this.searchBoxInputElement.value = '';
        }
        this.Filter('');
        this.selected = 0;
        this.selectedLine = null;
        this.HighlightElement();
    }

    private HighlightElement(elementNumber?: number | undefined, direction: boolean = true): void {
        this.lastSelectedLine = this.selectedLine !== null ? Object.assign({}, this.selectedLine) : null;
        this.selectedLine = null;

        if (elementNumber !== undefined) {
            this.selected = elementNumber;
        } else {
            elementNumber = this.selected;
        }

        const nearestElements = this.SelectNearestElements(elementNumber);
        console.log('nearest elements are ', nearestElements);
        let nearestElement = direction ? nearestElements.ahead : nearestElements.behind;
        if (nearestElement === null) {
            nearestElement = direction ? nearestElements.behind : nearestElements.ahead;
        }
        console.log('nearest element is: ', nearestElement);
        this.selected = nearestElement === null ? 0 : nearestElement;

        if (this.lastSelectedLine !== null) {
            removeClassIfExists(this.lastSelectedLine.element, SearchBox.highlightClassname);
        }

        if (nearestElement !== null) {
            addClassIfNotExists(this.lines[nearestElement].element, SearchBox.highlightClassname);
            this.selectedLine = this.lines[nearestElement];
        }
    }


    private Filter(searchString: string): void {
        if (!searchString) {
            this.selected = 0;
            for (const line of this.lines) {
                removeClassIfExists(line.element, 'display-none');
                line.visible = true;
            }
        } else {
            const searchStringLower = searchString.toLowerCase();

            for (const line of this.lines) {
                if (line.name.indexOf(searchStringLower) !== -1) {
                    removeClassIfExists(line.element, 'display-none');
                    line.visible = true;
                } else {
                    addClassIfNotExists(line.element, 'display-none');
                    line.visible = false;
                }
            }
        }
    }


    private Emit(id?: string | undefined): void {
        if (id !== undefined && id) {
            console.log('emitting ', id);
            this.elementWasSelected.next(id);
            return;
        } else if (this.selectedLine) {
            const id = this.selectedLine.element.getAttribute('data-id');
            if (id) {
                console.log('emitting ', id);
                this.elementWasSelected.next(id);
            }
        }
    }

    private SelectNearestElements(elementNumber: number): { ahead: number | null, behind: number | null } {
        if (this.lines[elementNumber].visible) {
            return { ahead: elementNumber, behind: elementNumber };
        }

        let result: { ahead: number | null, behind: number | null } = {
            ahead: null,
            behind: null
        };

        if (elementNumber !== this.lines.length - 1) {
            for (let i = elementNumber + 1; i < this.lines.length; i++) {
                if (this.lines[i].visible) {
                    result.ahead = i;
                    break;
                }
            }
        }
        if (elementNumber !== 0) {
            for (let i = elementNumber - 1; i >= 0; i--) {
                if (this.lines[i].visible) {
                    result.behind = i;
                    break;
                }
            }
        }

        return result;
    }
}

