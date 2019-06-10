import { Subject } from 'rxjs';
import { GetResourceRequest } from '../interfaces/get-resource-request';
import { getIsaacResources } from '../lib/api-calls';
import { ComponentType } from '../enums/component-type';
import { PrerenderedComponent } from './prerendered-component';
import { IsaacResource } from '../interfaces/isaac-resource';

export class Boxes extends PrerenderedComponent {

    public elementWasSelected = new Subject<string>();

    private container: HTMLDivElement | null = null;;

    constructor(boxContainerId: string) {
        // register box container
        super(ComponentType.Boxes, boxContainerId);
        this.container = super.GetComponent(ComponentType.Boxes, boxContainerId);

        const boxes = this.container.getElementsByClassName('box');
        this.InitializeBoxes(boxes);
    }

    private InitializeBoxes(boxes: HTMLCollectionOf<Element> | Array<HTMLDivElement>) {
        for (let i = 0; i < boxes.length; i++) {
            boxes[i].addEventListener('click', () => {
                const id = boxes[i].getAttribute('data-id');
                if (id) {
                    this.Emit(id);
                }
            });
        }
    }

    private Emit(id: string) {
        this.elementWasSelected.next(id);
    }

    ReplaceBoxes(newIsaacResources: Array<IsaacResource>): void {
        const newBoxes = new Array<HTMLDivElement>();
        for (const r of newIsaacResources) {
            if (r.name.indexOf('Double') !== -1) {
                continue;
            }
            const name = document.createElement('div');
            name.innerText = r.name;
            const image = document.createElement('div');
            image.style.background = `url('/img/isaac.png') -${r.x <= 0 ? 0 : r.x}px -${r.y <= 0 ? 0 : r.y}px transparent`;
            image.style.width = `${r.w < 5 ? 31 : r.w}px`;
            image.style.height = `${r.h < 5 ? 31 : r.h}px`;
            const newBox = document.createElement('div');
            newBox.classList.add('box');
            newBox.setAttribute('data-id', r.id);
            newBox.appendChild(name);
            newBox.appendChild(image);
            newBoxes.push(newBox);
        }

        this.InitializeBoxes(newBoxes);

        if (this.container) {
            this.container.innerHTML = '';
            for (const newBox of newBoxes) {
                this.container.appendChild(newBox);
            }
        }
    }

    RequestAndReplaceBoxes(request: GetResourceRequest): void {
        getIsaacResources(request).then(x => {
            if (!x || x.length === 0) {
                return;
            }
            this.ReplaceBoxes(x);
        });
    }
}

