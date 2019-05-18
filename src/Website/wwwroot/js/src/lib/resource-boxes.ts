import { loadDivElementsByClass } from './dom-operations';
import { callbackFunction, callbackFunctionRegistration, dropdownIdIsRegistered, getCallbackFunction } from './selection-callback-function';

const registeredCallbackFunctions = new Map<callbackFunctionRegistration, callbackFunction>();

const registerBoxCallbackFunction = (callbackFunctionRegistration: callbackFunctionRegistration, callbackFunction: callbackFunction) => {
    registeredCallbackFunctions.set(callbackFunctionRegistration, callbackFunction);
}

const initializeBoxes = () => {
    const boxContainers = loadDivElementsByClass('box-container', null);
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
                        callbackFunction.function(id, eventType, resourceNumber, show);
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

