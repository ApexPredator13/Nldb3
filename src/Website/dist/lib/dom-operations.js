"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swapClass = (e, from, to) => {
    if (e.classList.contains(from)) {
        e.classList.remove(from);
    }
    if (!e.classList.contains(to)) {
        e.classList.add(to);
    }
};
exports.swapClass = swapClass;
const fillTableCells = (tr, ...contents) => {
    if (contents.length === 0) {
        return;
    }
    contents.map(content => {
        if (content !== undefined) {
            let td = document.createElement('td');
            if (content) {
                if (content instanceof HTMLElement) {
                    td.appendChild(content);
                }
                else if (typeof (content) === 'string') {
                    td.innerText = content;
                }
                else if (typeof (content) === 'number') {
                    td.innerText = content.toString(10);
                }
            }
            tr.appendChild(td);
        }
        else {
            console.log('content was undefined! tr so far: ', tr);
        }
    });
};
exports.fillTableCells = fillTableCells;
const loadDivElementByClass = (className, div) => {
    const result = div ? div.getElementsByClassName(className) : document.getElementsByClassName(className);
    if (result.length > 0) {
        return result[0];
    }
    else {
        throw `no element with class '${className}' was found`;
    }
};
exports.loadDivElementByClass = loadDivElementByClass;
const loadDivElementsByClass = (className, div) => {
    return div
        ? div.getElementsByClassName(className)
        : document.getElementsByClassName(className);
};
exports.loadDivElementsByClass = loadDivElementsByClass;
const loadDivElementById = (idName, div) => {
    const result = div ? div.querySelector(`#${idName}`) : document.getElementById(idName);
    if (result) {
        return result;
    }
    else {
        throw `no element with class '${idName}' was found`;
    }
};
exports.loadDivElementById = loadDivElementById;
const loadElementsByTagName = (tagName, div) => {
    return div ? div.getElementsByTagName(tagName) : document.getElementsByTagName(tagName);
};
exports.loadElementsByTagName = loadElementsByTagName;
const removeClassIfExists = (e, className) => {
    if (e.classList.contains(className)) {
        e.classList.remove(className);
    }
};
exports.removeClassIfExists = removeClassIfExists;
const addClassIfNotExists = (e, className) => {
    if (!e.classList.contains(className)) {
        e.classList.add(className);
    }
};
exports.addClassIfNotExists = addClassIfNotExists;
