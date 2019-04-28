import { swapClass } from './lib/dom-operations';

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
                    swapClass(initialElement, 'display-normal', 'display-none');
                    swapClass(sibling, 'display-none', 'display-normal');
                });
                cancelButton.addEventListener('click', e => {
                    e.preventDefault();
                    swapClass(initialElement, 'display-none', 'display-normal');
                    swapClass(sibling, 'display-normal', 'display-none');
                });
            }
        }
    })
})();