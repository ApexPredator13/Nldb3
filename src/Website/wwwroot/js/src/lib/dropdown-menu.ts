import { loadDivElementByClass, loadDivElementsByClass } from "./dom-operations";

type elementSelectedCallback = (id: string) => any;
const registeredCallbackFunctions = new Map<string, elementSelectedCallback>();

const getDropDownElements = (div: HTMLDivElement): Map<string, HTMLDivElement> => {
    const result = div.getElementsByClassName('dd-line');
    if (result.length > 0) {
        const data = new Map<string, HTMLDivElement>()
        for (const item of result) {
            data.set((<string>item.getAttribute('title')).toLowerCase(), <HTMLDivElement>item)
        }
        return data;
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

const getClickedElementValue = (e: EventTarget | null): string | null => {
    if (!e) {
        return null;
    }

    const target = e as HTMLDivElement;

    if (target.classList.contains('dd-text') || target.classList.contains('dd-image')) {
        return (<HTMLDivElement>target.parentElement).getAttribute('data-id');
    } else if (target.classList.contains('dd-line')) {
        return target.getAttribute('data-id');
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

        const selection = loadDivElementByClass('dd-selection', dropdownContainer);
        const search = loadDivElementByClass('dd-search', dropdownContainer);
        const input = loadDivElementByClass('dd-searchbox', search) as HTMLInputElement;
        const dropDown = loadDivElementByClass('dd-dropdown', dropdownContainer);
        const dropDownElements = getDropDownElements(dropDown);

        dropdownContainer.addEventListener('mouseover', e => {
            e.stopPropagation();
            if (!e.target) {
                return;
            }
            if (e.target === selection) {
                input.value = '';
                input.focus();
                filterDropdownElements(dropDownElements, null);
            }
        });

        input.addEventListener('input', () => {
            const value = input.value;
            filterDropdownElements(dropDownElements, value);
        });

        dropDown.addEventListener('click', e => {
            e.stopPropagation();
            if (registeredCallbackFunctions.has(dropdownId)) {
                const id = getClickedElementValue(e.target);
                if (id) {
                    const callbackFunction = registeredCallbackFunctions.get(dropdownId);
                    if (callbackFunction) {
                        callbackFunction(id);
                    }
                }
            }
        });
    }
}

const registerDropdownMenuCallbackFunction = (containerId: string, callback: elementSelectedCallback) => {
    registeredCallbackFunctions.set(containerId, callback);
}

export {
    initializeDropdownContainers,
    registerDropdownMenuCallbackFunction
}

