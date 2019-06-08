import { Subject } from "rxjs";
import { SelectedIsaacObject } from "../interfaces/selected-isaac-object";
import { ComponentType } from "../enums/component-type";
import { addClassIfNotExists, removeClassIfExists } from "../lib/dom-operations";
import { PrerenderedComponent } from "./prerendered-component";

export class SearchBox extends PrerenderedComponent {

    public elementWasSelected = new Subject<string>();

    private static highlightClassname = 'highlight';

    private lines = new Map<string, SelectedIsaacObject>();
    private selected = 0;
    private selectedLine: [string, SelectedIsaacObject] | null = null;

    constructor(prerenderedSearchBoxElementId: string) {
        // register component
        super(ComponentType.SearchBox, prerenderedSearchBoxElementId);
        const searchBoxComponent = super.GetComponent(ComponentType.SearchBox, prerenderedSearchBoxElementId);

        // initialize search events
        const searchElements = searchBoxComponent.getElementsByClassName('dd-search');
        if (searchElements.length > 0) {
            const searchElement = searchElements[0] as HTMLInputElement;

            // filter on input
            searchElement.addEventListener('input', e => {
                if (e.target && e.target instanceof HTMLInputElement) {
                    this.selected = 0;
                    this.Filter(e.target.value);
                }
            });

            // emit highlighted element on [Enter] keypress
            searchElement.addEventListener('keydown', e => {
                if (e.keyCode === 13) {
                    this.Emit();
                }
            });

            // initialize searchbox focus on hover
            searchBoxComponent.addEventListener('mouseover', e => {
                e.stopPropagation();
                if (!searchElement.value) {
                    searchElement.focus();
                }
            });

            // navigate via up and down arrows
            searchBoxComponent.addEventListener('keydown', e => {
                if (e.keyCode === 38) {
                    this.HighlightElement(this.selected + 1);
                } else if (e.keyCode === 40) {
                    this.HighlightElement(this.selected - 1);
                }
            });
        }

        const searchBoxLines = searchBoxComponent.getElementsByClassName('dd-line');

        for (let i = 0; i < searchBoxLines.length; i++) {
            // save all lines via name (= lowercased title) in a map for quick searching
            const title = searchBoxLines[i].getAttribute('title');
            if (title) {
                this.lines.set(title.toLowerCase(), { element: <HTMLDivElement>searchBoxLines[i], visible: true });
                this.HighlightElement();
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
                    this.ResetSelection();
                }
            });
        }
    }


    ResetSelection(): void {
        this.selected = 0;
        this.selectedLine = null;
        this.HighlightElement();
    }


    HighlightElement(elementNumber?: number | undefined): void {
        if (elementNumber !== undefined) {
            this.selected = elementNumber;
        }

        this.selectedLine = null;
        let i = 0;

        for (const line of this.lines) {

            // skip invisible items, select next one if current selection is invisible
            if (!line[1].visible) {
                this.selected++;
                continue;
            }

            // highlight selected item
            if (i === this.selected) {
                this.selectedLine = line;
                addClassIfNotExists(line[1].element, SearchBox.highlightClassname);
            } else {
                removeClassIfExists(line[1].element, SearchBox.highlightClassname);
            }
            i++;
        }
    }


    Filter(searchString: string): void {
        if (!searchString) {
            return;
        }

        const searchStringLower = searchString.toLowerCase();

        for (const line of this.lines) {
            if (line[0].indexOf(searchStringLower) !== -1) {
                removeClassIfExists(line[1].element, 'display-none');
            } else {
                addClassIfNotExists(line[1].element, 'display-none');
            }
        }

        this.HighlightElement();
    }


    Emit(id?: string | undefined): void {
        if (id !== undefined && id) {
            this.elementWasSelected.next(id);
            return;
        } else if (this.selectedLine) {
            const id = this.selectedLine[1].element.getAttribute('data-id');
            if (id) {
                this.elementWasSelected.next(id);
            }
        }
    }
}

