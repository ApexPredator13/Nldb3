import { Subject } from "rxjs";
import { addClassIfNotExists, removeClassIfExists } from "../lib/dom-operations";
import { IsaacResource } from "../interfaces/isaac-resource";

let click = function(this: SearchBox, e: MouseEvent) {
    const target = <HTMLDivElement>e.target;
    let selectedId: string | null = null;

    if (target.className === 'dd-line') {
        selectedId = target.getAttribute('data-id');
    } else if (target.className === 'dd-text' || target.className === 'dd-image') {
        const parent = <HTMLDivElement>target.parentElement;
        selectedId = parent.getAttribute('data-id');
    }

    if (selectedId) {
        this.elementWasSelected.next(selectedId);
    }
}

let filterOnInput = function (this: SearchBox) {
    if (!this.searchBoxInputElement.value) {
        return;
    }

    const searchLower = this.searchBoxInputElement.value.toLowerCase();

    for (let line of this.lines) {
        if (line[0].indexOf(searchLower) === -1) {
            addClassIfNotExists(line[1], 'display-none');
        } else {
            removeClassIfExists(line[1], 'display-none');
        }
    }
}

let focusOnHover = function (this: SearchBox) {
    this.searchBoxInputElement.focus();
}

export class SearchBox {

    public elementWasSelected = new Subject<string>();

    private futureParent: HTMLElement;
    private container: HTMLDivElement;
    private dropdown: HTMLDivElement;
    private searchContainer: HTMLDivElement;
    public searchBoxInputElement: HTMLInputElement;

    public lines: Map<string, HTMLDivElement> = new Map<string, HTMLDivElement>();
    
    private clickEventListener: (this: SearchBox, e: MouseEvent) => void;
    private filterOnInputEventListener: (this: SearchBox) => void;
    private focusOnHoverEventListener: (this: SearchBox) => void;

    constructor(futureParentElement: HTMLElement, elements: Array<IsaacResource> | Promise<Array<IsaacResource>>, replace: boolean) {
        this.futureParent = futureParentElement;

        this.clickEventListener = click.bind(this);
        this.filterOnInputEventListener = filterOnInput.bind(this);
        this.focusOnHoverEventListener = focusOnHover.bind(this);

        // create wrapper
        this.container = document.createElement('div');
        this.container.className = 'dd-container';

        // create search box
        this.searchContainer = document.createElement('div');
        this.searchContainer.className = 'dd-search';

        this.searchBoxInputElement = document.createElement('input');
        this.searchBoxInputElement.setAttribute('type', 'text');
        this.searchBoxInputElement.className = 'dd-searchbox';
        this.searchContainer.appendChild(this.searchBoxInputElement);

        // create dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'dd-dropdown';

        // check if array or promise was given, then continue in method
        if (Array.isArray(elements)) {
            this.createSearchboxElements(elements, replace);
        } else {
            elements.then(elements => this.createSearchboxElements(elements, replace));
        }
    }

    private createSearchboxElements(elements: Array<IsaacResource>, replace: boolean) {

        for (let i = 0; i < elements.length; i++) {
            const line = document.createElement('div');
            line.className = 'dd-line';
            line.className = 'dd-line';
            line.setAttribute('data-id', elements[i].id);
            line.title = elements[i].name;

            const image = document.createElement('div');
            image.className = 'dd-image';
            const x = elements[i].x <= 0 ? '0px' : `-${elements[i].x.toString(10)}px`;
            const y = elements[i].y <= 0 ? '0px' : `-${elements[i].y.toString(10)}px`;
            image.style.background = `url('/img/isaac.png') ${x} ${y} transparent`;
            image.style.width = `${elements[i].w.toString(10)}px`;
            image.style.height = `${elements[i].h.toString(10)}px`;

            const text = document.createElement('div');
            text.className = 'dd-text';
            text.innerText = elements[i].name;

            line.appendChild(image);
            line.appendChild(text);

            this.lines.set(elements[i].name.toLowerCase(), line);
            this.dropdown.appendChild(line);
        }

        // add everything to wrapper
        this.container.appendChild(this.searchContainer);
        this.container.appendChild(this.dropdown);

        // add click event
        this.dropdown.addEventListener('click', <any>this.clickEventListener);

        // add filter on input event
        this.searchBoxInputElement.addEventListener('input', this.filterOnInputEventListener);

        // add 'on hover, focus on search element' event
        this.container.addEventListener('mouseover', this.focusOnHoverEventListener);

        // append finished component to parent
        if (replace) {
            this.futureParent.innerHTML = '';
        }
        this.futureParent.appendChild(this.container);
    }

    public focus(): void {
        if (this.searchBoxInputElement) {
            this.searchBoxInputElement.focus();
        }
    }

    public resetSearch(): void {
        if (this.searchBoxInputElement) {
            this.searchBoxInputElement.value = '';
        }
    }

    public removeEventListeners(): void {
        this.dropdown.removeEventListener('click', <any>this.clickEventListener);
        this.searchBoxInputElement.removeEventListener('input', <any>this.filterOnInputEventListener);
        this.container.removeEventListener('mouseover', <any>this.focusOnHoverEventListener);
    }
}

