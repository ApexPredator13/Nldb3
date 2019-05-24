import { loadDivElementByClass, loadDivElementsByClass } from "./dom-operations";
import { callbackFunction, callbackFunctionRegistration, dropdownIdIsRegistered, getCallbackFunction } from './selection-callback-function';

const registeredCallbackFunctions = new Map<callbackFunctionRegistration, callbackFunction>();

const getDropDownElements = (div: HTMLDivElement): Map<string, HTMLDivElement> => {
    const lines = div.getElementsByClassName('dd-line');
    if (lines.length > 0) {
        const savedLines = new Map<string, HTMLDivElement>()
        for (const line of lines) {
            savedLines.set((<string>line.getAttribute('title')).toLowerCase(), <HTMLDivElement>line)
        }
        return savedLines;
    } else {
        throw `no dropdown elements were found!`;
    }
}

const filterDropdownElements = (lines: Map<string, HTMLDivElement>, filter: string | null): void => {
    if (!filter) {
        for (const line of lines) {
            line[1].classList.remove('display-none');
        }
        return;
    }

    const lowercaseFilter = filter.toLowerCase();
    for (const line of lines) {
        if (line[0].indexOf(lowercaseFilter) === -1) {
            line[1].classList.add('display-none');
        } else {
            line[1].classList.remove('display-none');
        }
    }
}

const getClickedElementValue = (e: EventTarget | null): { id: string, image: HTMLDivElement } | null => {
    if (!e) {
        return null;
    }

    const target = e as HTMLDivElement;

    if (target.classList.contains('dd-text')) {
        if (target.parentElement && target.parentElement.hasAttribute('data-id')) {
            return {
                id: <string>target.parentElement.getAttribute('data-id'),
                image: (<HTMLDivElement>target.previousElementSibling).cloneNode(true) as HTMLDivElement
            };
        }
    } else if (target.classList.contains('dd-image')) {
        if (target.parentElement && target.parentElement.hasAttribute('data-id')) {
            return {
                id: <string>target.parentElement.getAttribute('data-id'),
                image: target.cloneNode(true) as HTMLDivElement
            };
        }
    } else if (target.classList.contains('dd-line')) {
        return {
            id: <string>target.getAttribute('data-id'),
            image: (<HTMLDivElement>target.firstElementChild).cloneNode(true) as HTMLDivElement
        }
    }

    return null;
}


const initializeDropdownContainers = () => {
    const dropdownContainers = loadDivElementsByClass('dd-container', null);

    for (const dropdownContainer of dropdownContainers) {
        const dropdownId = dropdownContainer.getAttribute('data-dropdown-id');
        if (!dropdownId) {
            console.log('no id "data-dropdown-id" on element: ', dropdownContainer)
            throw "the dropdown element has no ID!";
        }

        const search = loadDivElementByClass('dd-search', dropdownContainer);
        const input = loadDivElementByClass('dd-searchbox', search) as HTMLInputElement;
        const dropDown = loadDivElementByClass('dd-dropdown', dropdownContainer);
        const dropDownElements = getDropDownElements(dropDown);

        dropdownContainer.addEventListener('mouseover', e => {
            e.stopPropagation();
            input.focus();
        });

        input.addEventListener('input', () => {
            const value = input.value;
            filterDropdownElements(dropDownElements, value);
        });

        input.addEventListener('keydown', e => {
            if (e.keyCode === 13) {
                input.value = '';
                for (const e of dropDownElements) {
                    if (!e[1].classList.contains('display-none'))  {
                        const id = e[1].getAttribute('data-id');
                        if (id) {
                            const callbackFunction = getCallbackFunction(dropdownId, registeredCallbackFunctions);
                            if (callbackFunction) {
                                const eventType = callbackFunction.registration.eventType;
                                const resourceNumber = callbackFunction.registration.resourceNumber;
                                const show = callbackFunction.registration.hideAllExcept;
                                const image = e[1].firstChild ? <HTMLDivElement>(e[1].firstChild as HTMLDivElement).cloneNode(true) : null;
                                if (image && !image.classList.contains('dd-image')) {
                                    image.classList.add('dd-image');
                                }
                                callbackFunction.function({ id: id, image: image }, eventType, resourceNumber, show);
                                return;
                            }
                        }
                    }
                }
            }
        });

        dropDown.addEventListener('click', e => {
            e.stopPropagation();
            const idAndImage = getClickedElementValue(e.target);
            if (dropdownIdIsRegistered(dropdownId, registeredCallbackFunctions) && idAndImage) {
                const callbackFunction = getCallbackFunction(dropdownId, registeredCallbackFunctions);
                if (callbackFunction) {
                    const eventType = callbackFunction.registration.eventType;
                    const resourceNumber = callbackFunction.registration.resourceNumber;
                    const show = callbackFunction.registration.hideAllExcept;
                    callbackFunction.function(idAndImage, eventType, resourceNumber, show);
                }
            }
        });
    }
}

const registerDropdownMenuCallbackFunction = (registrationData: callbackFunctionRegistration, callbackFunction: callbackFunction) => {
    registeredCallbackFunctions.set(registrationData, callbackFunction);
}

export {
    initializeDropdownContainers,
    registerDropdownMenuCallbackFunction
}

