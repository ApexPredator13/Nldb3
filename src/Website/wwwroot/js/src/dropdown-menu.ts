﻿import { loadDivElementByClass } from "./lib/dom-operations";

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

(() => {
    const firstContainer = loadDivElementByClass('dd-container', null);
    const selection = loadDivElementByClass('dd-selection', firstContainer);
    const search = loadDivElementByClass('dd-search', firstContainer);
    const input = loadDivElementByClass('dd-searchbox', search) as HTMLInputElement;
    const dropDown = loadDivElementByClass('dd-dropdown', firstContainer);
    const dropDownElements = getDropDownElements(dropDown);

    firstContainer.addEventListener('mouseover', e => {
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
        const id = getClickedElementValue(e.target);
        console.log(id);
    })
})();

