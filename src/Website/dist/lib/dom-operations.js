"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var swapClass = function (e, from, to) {
    if (e.classList.contains(from)) {
        e.classList.remove(from);
    }
    if (!e.classList.contains(to)) {
        e.classList.add(to);
    }
};
exports.swapClass = swapClass;
var fillTableCells = function (tr) {
    var contents = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        contents[_i - 1] = arguments[_i];
    }
    if (contents.length === 0) {
        return;
    }
    contents.map(function (content) {
        if (content !== undefined) {
            var td = document.createElement('td');
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
