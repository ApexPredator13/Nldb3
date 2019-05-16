import { loadDivElementsByClass } from './dom-operations';

type elementSelectedCallback = (id: string) => any;
const registeredCallbackFunctions = new Map<string, elementSelectedCallback>();

const registerBoxCallbackFunction = (containerId: string, callbackFunction: elementSelectedCallback) => {
    registeredCallbackFunctions.set(containerId, callbackFunction);
}

const initializeBoxes = () => {
    const boxContainers = loadDivElementsByClass('box-container', null);
    if (!boxContainers || boxContainers.length === 0) {
        return;
    }

    for (const boxContainer of boxContainers) {
        const boxContainerId = boxContainer.getAttribute('data-id');
        if (!boxContainerId) {
            console.error(boxContainer);
            throw 'the box container has no ID!'
        }

        const boxes = loadDivElementsByClass('box', boxContainer);
        if (!boxes || boxes.length === 0) {
            continue;
        }

        for (const box of boxes) {
            box.addEventListener('click', () => {
                const resourceId = box.getAttribute('data-id');
                if (!resourceId) {
                    console.error(box);
                    throw 'the resources has no ID!'
                }

                if (registeredCallbackFunctions.has(boxContainerId)) {
                    const callbackFunction = registeredCallbackFunctions.get(boxContainerId);
                    if (callbackFunction) {
                        callbackFunction(resourceId);
                    }
                }
            });
        }
    }
}

export {
    initializeBoxes,
    registerBoxCallbackFunction
}

