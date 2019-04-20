﻿import { elementClosest } from './polyfills';
elementClosest();

const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const inputElementTypeWhitelist: Array<string | null> = ["text", "password"];

const applyErrormessage = (inputElement: HTMLInputElement, message: string | null): void => {
    const errorMessageContainer = inputElement.nextElementSibling;
    if (errorMessageContainer) {
        errorMessageContainer.textContent = message;
    }
}

const applyFormValidState = (form: HTMLFormElement, isValid: boolean): void => {
    const submitButton = form.getElementsByTagName("button");
    for (let i = 0; i < submitButton.length; i++) {
        if (submitButton[i].getAttribute("type") === "submit") {
            (<HTMLButtonElement>submitButton[i]).disabled = !isValid;
        }
    }
}

const inputElementIsValid = (element: HTMLInputElement, target: HTMLInputElement, markAsTouched: boolean): boolean => {
    let isValid = true;
    let errorMessage: string | null = null;
    const isSameNode = element === target;

    // validation rules
    if (element.hasAttribute("data-val-required") && !element.value) {
        isValid = false;
        errorMessage = errorMessage ? errorMessage : (element.getAttribute("data-val-required") ? element.getAttribute("data-val-required") as string : null);
    }
    if(element.hasAttribute("data-val-email") && !emailRegex.test(element.value)) {
        isValid = false;
        errorMessage = errorMessage ? errorMessage : (element.getAttribute("data-val-email") ? element.getAttribute("data-val-email") as string : null);
    }
    if (element.hasAttribute("data-val-length-max") && element.value.length > parseInt(element.getAttribute("data-val-length-max") as string, 10)) {
        isValid = false;
        errorMessage = errorMessage ? errorMessage : (element.getAttribute("data-val-length") ? element.getAttribute("data-val-length") as string : null);
    }
    if (element.hasAttribute("data-val-length-min") && element.value.length < parseInt(element.getAttribute("data-val-length-min") as string, 10)) {
        isValid = false;
        errorMessage = errorMessage ? errorMessage : (element.getAttribute("data-val-length") ? element.getAttribute("data-val-length") as string : null);
    }

    if (markAsTouched && isSameNode) {
        element.setAttribute("touched", "true");
    }

    if (element.getAttribute("touched") === "true" && isSameNode) {
        applyErrormessage(element, errorMessage);
    }
    return isValid;
}

const evaluateForm = (target: HTMLInputElement, markAsTouched: boolean): void => {
    const form = target.closest("form");
    if (!form) {
        return;
    }

    let formIsValid = true;
    const inputElements = form.getElementsByTagName("input");
    for (let i = 0; i < inputElements.length; i++) {
        const element = inputElements[i];
        const type = element.getAttribute("type");
        if (element.getAttribute("data-val") === "true" && inputElementTypeWhitelist.indexOf(type) !== -1) {
            if (!inputElementIsValid(element, target, markAsTouched)) {
                formIsValid = false;
            }
        }
    }

    applyFormValidState(form, formIsValid);
}

(() => {
    const inputElements = document.getElementsByTagName("input");
    for (let i = 0; i < inputElements.length; i++) {
        evaluateForm(inputElements[i], false);
        (inputElements[i] as HTMLInputElement).addEventListener("input", e => evaluateForm(e.target as HTMLInputElement, true));
        (inputElements[i] as HTMLInputElement).addEventListener("blur", e => evaluateForm(e.target as HTMLInputElement, true));
        (inputElements[i] as HTMLInputElement).addEventListener("click", e => evaluateForm(e.target as HTMLInputElement, false));
    }
})();
