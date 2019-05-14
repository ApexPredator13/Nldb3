"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dom_operations_1 = require("./lib/dom-operations");
const getDropDownElements = (div) => {
    const result = div.getElementsByClassName('dd-line');
    if (result.length > 0) {
        const data = new Map();
        for (const item of result) {
            data.set(item.getAttribute('title').toLowerCase(), item);
        }
        return data;
    }
    else {
        throw `no dropdown elements were found!`;
    }
};
const filterDropdownElements = (lines, filter) => {
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
        }
        else {
            line[1].classList.remove('display-none');
        }
    }
};
const getClickedElementValue = (e) => {
    if (!e) {
        return null;
    }
    const target = e;
    if (target.classList.contains('dd-text') || target.classList.contains('dd-image')) {
        return target.parentElement.getAttribute('data-id');
    }
    else if (target.classList.contains('dd-line')) {
        return target.getAttribute('data-id');
    }
    return null;
};
(() => {
    const firstContainer = dom_operations_1.loadDivElementByClass('dd-container', null);
    const selection = dom_operations_1.loadDivElementByClass('dd-selection', firstContainer);
    const search = dom_operations_1.loadDivElementByClass('dd-search', firstContainer);
    const input = dom_operations_1.loadDivElementByClass('dd-searchbox', search);
    const dropDown = dom_operations_1.loadDivElementByClass('dd-dropdown', firstContainer);
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
    });
})();
