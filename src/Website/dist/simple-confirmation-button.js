"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dom_operations_1 = require("./lib/dom-operations");
(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const confirmElements = document.getElementsByClassName('simple-confirm-element');
        for (let i = 0; i < confirmElements.length; i++) {
            const initialElement = confirmElements[i];
            const initialButtons = initialElement.getElementsByTagName('button');
            const initialButton = initialButtons.length > 0 ? initialButtons[0] : null;
            const sibling = initialElement.nextElementSibling;
            const cancelButtons = sibling ? sibling.getElementsByClassName('cancel') : null;
            const cancelButton = cancelButtons && cancelButtons.length > 0 ? cancelButtons[0] : null;
            if (initialButton && cancelButton && sibling) {
                initialButton.addEventListener('click', () => {
                    dom_operations_1.swapClass(initialElement, 'display-normal', 'display-none');
                    dom_operations_1.swapClass(sibling, 'display-none', 'display-normal');
                });
                cancelButton.addEventListener('click', e => {
                    e.preventDefault();
                    dom_operations_1.swapClass(initialElement, 'display-none', 'display-normal');
                    dom_operations_1.swapClass(sibling, 'display-normal', 'display-none');
                });
            }
        }
    });
})();
