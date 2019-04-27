import { swapClass } from './dom-operations';
(function () {
    document.addEventListener("DOMContentLoaded", function () {
        var confirmElements = document.getElementsByClassName('simple-confirm-element');
        var _loop_1 = function (i) {
            var initialElement = confirmElements[i];
            var initialButtons = initialElement.getElementsByTagName('button');
            var initialButton = initialButtons.length > 0 ? initialButtons[0] : null;
            var sibling = initialElement.nextElementSibling;
            var cancelButtons = sibling ? sibling.getElementsByClassName('cancel') : null;
            var cancelButton = cancelButtons && cancelButtons.length > 0 ? cancelButtons[0] : null;
            if (initialButton && cancelButton && sibling) {
                initialButton.addEventListener('click', function () {
                    swapClass(initialElement, 'display-normal', 'display-none');
                    swapClass(sibling, 'display-none', 'display-normal');
                });
                cancelButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    swapClass(initialElement, 'display-none', 'display-normal');
                    swapClass(sibling, 'display-normal', 'display-none');
                });
            }
        };
        for (var i = 0; i < confirmElements.length; i++) {
            _loop_1(i);
        }
    });
})();
