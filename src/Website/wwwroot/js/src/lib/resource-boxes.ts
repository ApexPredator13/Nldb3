import { loadDivElementsByClass } from './dom-operations';
import { callbackFunction, callbackFunctionRegistration, dropdownIdIsRegistered, getCallbackFunction } from './selection-callback-function';
import { getIsaacResources } from './api-calls';
import { GetResourceRequest } from '../interfaces/get-resource-request';

const registeredCallbackFunctions = new Map<callbackFunctionRegistration, callbackFunction>();

const registerBoxCallbackFunction = (callbackFunctionRegistration: callbackFunctionRegistration, callbackFunction: callbackFunction) => {
    registeredCallbackFunctions.set(callbackFunctionRegistration, callbackFunction);
}

const replaceBoxes = (request: GetResourceRequest, container: HTMLDivElement): void => {
    getIsaacResources(request).then(x => {
        if (!x || x.length === 0) {
            return;
        }

        const newBoxes = new Array<HTMLDivElement>();
        for (const r of x) {
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

        container.innerHTML = '';
        for (const newBox of newBoxes) {
            container.appendChild(newBox);
        }
        initializeBoxes(container);
    });
}

const initializeBoxes = (container?: HTMLDivElement | undefined) => {
    const boxContainers = container ? new Array<HTMLDivElement>(container) : loadDivElementsByClass('box-container', null);
    if (!boxContainers || boxContainers.length === 0) {
        return;
    }

    for (const boxContainer of boxContainers) {
        const boxContainerId = boxContainer.getAttribute('data-id');
        if (!boxContainerId) {
            continue;
        }

        const boxes = loadDivElementsByClass('box', boxContainer);
        if (!boxes || boxes.length === 0) {
            continue;
        }

        for (const box of boxes) {
            box.addEventListener('click', () => {
                const id = box.getAttribute('data-id');
                if (!id) {
                    return;
                }

                if (dropdownIdIsRegistered(boxContainerId, registeredCallbackFunctions) && id) {
                    const callbackFunction = getCallbackFunction(boxContainerId, registeredCallbackFunctions);
                    if (callbackFunction) {
                        const eventType = callbackFunction.registration.eventType;
                        const resourceNumber = callbackFunction.registration.resourceNumber;
                        const show = callbackFunction.registration.hideAllExcept;
                        const image = box.children && box.children.length >= 2 ? (box.children[1] as HTMLDivElement).cloneNode(true) as HTMLDivElement : null;
                        if (image && !image.classList.contains('dd-image')) {
                            image.classList.add('dd-image');
                        }
                        callbackFunction.function({ id: id, image: image }, eventType, resourceNumber, show);
                    }
                }
            });
        }
    }
}

export {
    initializeBoxes,
    registerBoxCallbackFunction,
    replaceBoxes
}

