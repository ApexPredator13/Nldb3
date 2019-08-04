import { Subject } from 'rxjs';
import { IsaacResource } from '../interfaces/isaac-resource';

let boxesClickEventListener = function (this: Boxes, e: MouseEvent) {
    let selectedId: string | null = null;
    const target = <HTMLDivElement>e.target;

    if (target.className === 'box') {
        selectedId = target.getAttribute('data-id');
    } else if (target.parentElement && target.parentElement.className === 'box') {
        selectedId = target.parentElement.getAttribute('data-id');
    }

    if (selectedId) {
        this.elementWasSelected.next(selectedId);
    }
};

export class Boxes {

    public elementWasSelected = new Subject<string>();

    private wrapper: HTMLDivElement;
    private imagePath: string;
    private futureParent: HTMLElement;
    private slice: number | undefined;
    private withId: Array<string> | undefined;

    private clickEventListener: ((this: Boxes, e: MouseEvent) => void);

    constructor(futureParentElement: HTMLElement, futureElements: Array<IsaacResource> | Promise<Array<IsaacResource>>, replace: boolean, imagePath?: string, slice?: number, withId?: Array<string>) {
        this.imagePath = imagePath ? imagePath : '/img/isaac.png';
        this.futureParent = futureParentElement;
        this.slice = slice;
        this.withId = withId;
        this.clickEventListener = boxesClickEventListener.bind(this);

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'box-container';

        // check if array or promise was given, then continue in method
        if (Array.isArray(futureElements)) {
            this.createBoxes(futureElements, replace);
        } else {
            futureElements.then(resources => this.createBoxes(resources, replace));
        }
    }

    private createBoxes(resources: Array<IsaacResource>, replace: boolean) {

        // create boxes
        const amount = this.slice ? this.slice : resources.length;

        for (let i = 0; i < amount; i++) {
            if (this.withId && this.withId.indexOf(resources[i].id) === -1) {
                continue;
            }

            const box = document.createElement('div');
            box.className = 'box';
            box.setAttribute('data-id', resources[i].id);

            const name = document.createElement('div');
            name.innerText = resources[i].name;

            const image = document.createElement('div');
            const x = resources[i].x <= 0 ? '0px' : `-${resources[i].x.toString(10)}px`;
            const y = resources[i].y <= 0 ? '0px' : `-${resources[i].y.toString(10)}px`;
            image.style.background = `url('${this.imagePath}') ${x} ${y} transparent`;
            image.style.width = `${resources[i].w.toString(10)}px`;
            image.style.height = `${resources[i].h.toString(10)}px`;

            box.appendChild(name);
            box.appendChild(image);

            this.wrapper.appendChild(box);
        }

        // add click event listener, has been cast to any because event listener function signature doesn't match for whatever reason
        this.wrapper.addEventListener('click', <any>this.clickEventListener);

        if (replace) {
            this.futureParent.innerHTML = '';
        }

        this.futureParent.appendChild(this.wrapper);
    }

    public removeEventListeners(): void {
        this.wrapper.removeEventListener('click', <any>this.clickEventListener);
    }
}

