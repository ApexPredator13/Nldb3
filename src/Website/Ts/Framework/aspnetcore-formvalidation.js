﻿const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const inputElementTypeWhitelist = ["text", "password", "color", "number"];

const applyErrormessage = (inputElement, message) => {
    const errorMessageDiv = inputElement.nextElementSibling;
    if (!errorMessageDiv) {
        return;
    }

    if (errorMessageDiv && errorMessageDiv instanceof HTMLDivElement) {
        errorMessageDiv.innerText = message ? message : '';
    }
}

const applyFormValidState = (form, isValid) => {
    const submitButton = form.getElementsByTagName("button");
    for (let i = 0; i < submitButton.length; i++) {
        if (submitButton[i].getAttribute("type") === "submit") {
            (submitButton[i]).disabled = !isValid;
        }
    }
}

const inputElementIsValid = (element, target, markAsTouched) => {
    let isValid = true;
    let errorMessage = null;
    const isSameNode = element === target;

    // validation rules
    if (element.hasAttribute("data-val-required") && !element.value) {
        isValid = false;
        errorMessage = errorMessage ? errorMessage : (element.getAttribute("data-val-required") ? element.getAttribute("data-val-required") : null);
    }
    if (element.hasAttribute("data-val-email") && !emailRegex.test(element.value)) {
        isValid = false;
        errorMessage = errorMessage ? errorMessage : (element.getAttribute("data-val-email") ? element.getAttribute("data-val-email") : null);
    }
    if (element.hasAttribute("data-val-length-max") && element.value.length > parseInt(element.getAttribute("data-val-length-max"), 10)) {
        isValid = false;
        errorMessage = errorMessage ? errorMessage : (element.getAttribute("data-val-length") ? element.getAttribute("data-val-length") : null);
    }
    if (element.hasAttribute("data-val-length-min") && element.value.length < parseInt(element.getAttribute("data-val-length-min"), 10)) {
        isValid = false;
        errorMessage = errorMessage ? errorMessage : (element.getAttribute("data-val-length") ? element.getAttribute("data-val-length") : null);
    }
    if (element.hasAttribute("data-val-minlength-min") && element.value.length < parseInt(element.getAttribute("data-val-minlength-min"), 10)) {
        isValid = false;
        errorMessage = errorMessage ? errorMessage : (element.getAttribute("data-val-minlength") ? element.getAttribute("data-val-minlength") : null)
    }

    if (markAsTouched && isSameNode) {
        element.setAttribute("touched", "true");
    }

    if (element.getAttribute("touched") === "true" && isSameNode) {
        applyErrormessage(element, errorMessage);
    }
    return isValid;
}

const evaluateForm = (target, markAsTouched) => {
    const form = target.closest("form");
    if (!form) {
        return;
    }

    if (!form.hasAttribute('data-event-set')) {
        form.setAttribute('data-event-set', 'true');
        form.addEventListener('submit', () => {
            const buttons = form.getElementsByTagName('button');
            if (buttons && buttons.length > 0) {
                for (let i = 0; i < buttons.length; ++i) {
                    buttons[i].disabled = true;
                }
            }
        });
    }

    let formIsValid = true;
    const inputElements = form.getElementsByTagName("input");
    const textAreaElements = form.getElementsByTagName("textarea");
    for (let i = 0; i < inputElements.length; i++) {
        const element = inputElements[i];
        const type = element.getAttribute("type");
        if (element.getAttribute("data-val") === "true" && inputElementTypeWhitelist.indexOf(type) !== -1) {
            if (!inputElementIsValid(element, target, markAsTouched)) {
                formIsValid = false;
            }
        }
    }
    for (let i = 0; i < textAreaElements.length; i++) {
        const element = textAreaElements[i];
        if (element.getAttribute("data-val") === "true") {
            if (!inputElementIsValid(element, target, markAsTouched)) {
                formIsValid = false;
            }
        }
    }

    applyFormValidState(form, formIsValid);
}

const applyElementClosestPolyfill = () => {
    if (!Element.prototype.matches) {
        Element.prototype.matches = (Element.prototype).msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s) {
            var el = this;

            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
}

(() => {
    applyElementClosestPolyfill();

    // quick hack: remove 'display: flex' from body
    document.body.style.display = 'block';

    // init formValidation
    const inputElements = document.getElementsByTagName("input");
    const textareaElements = document.getElementsByTagName("textarea");

    for (let i = 0; i < inputElements.length; i++) {
        evaluateForm(inputElements[i], false);
        (inputElements[i]).addEventListener("input", e => evaluateForm(e.target, true));
        (inputElements[i]).addEventListener("blur", e => evaluateForm(e.target, true));
        (inputElements[i]).addEventListener("click", e => evaluateForm(e.target, false));
    }
    for (let i = 0; i < textareaElements.length; i++) {
        evaluateForm(textareaElements[i], false);
        (textareaElements[i]).addEventListener("input", e => evaluateForm(e.target, true));
        (textareaElements[i]).addEventListener("blur", e => evaluateForm(e.target, true));
        (textareaElements[i]).addEventListener("click", e => evaluateForm(e.target, false));
    }
})();

