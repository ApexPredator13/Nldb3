import { elementClosest } from './polyfills'
elementClosest();

const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const validatableInputElements = ["text", "password"];

enum ValidationResult {
    OK = 1,
    Required,
    InvalidEmail
}

const validationRules = new Array<(element: HTMLInputElement) => ValidationResult>(
    e => e.hasAttribute("data-required") && !e.value ? ValidationResult.Required : ValidationResult.OK,
    e => e.hasAttribute("data-email") && !emailRegex.test(e.value) ? ValidationResult.InvalidEmail : ValidationResult.OK
)

// finds all input elements that should be validated
const findInputElements = (someElement: HTMLElement): Array<HTMLInputElement> => {
    const inputElements = someElement.getElementsByTagName("input");
    const result = new Array<HTMLInputElement>();
    if (inputElements && inputElements.length) {
        for (let i = 0; i < inputElements.length; i++) {
            const inputType = inputElements[i].getAttribute("type");
            if (validatableInputElements.indexOf(inputType ? inputType : '') === -1) {
                continue;
            }
            result.push(inputElements[i]);
        }
    }
    
    return result;
}

// takes an input element, validates the form it's part of, and displays the error message next to the form field
const validateForm = (element: HTMLInputElement, errorClassname: string): void => {
    let validationResult = checkInputElementRules(element);
    let formValid = true;

    const parentForm = element.closest("form");
    if (!parentForm) {
        return;
    }

    // 
    findInputElements(parentForm).map(element => {
        const valid = checkInputElementRules(element);
        if (valid !== ValidationResult.OK) {
            formValid = false;
        }
    });

    if (formValid) {
        disableSubmitButton(parentForm, false);
    } else {
        disableSubmitButton(parentForm, true);
    }

    const sibling = element.nextElementSibling;

    // if OK, remove error message from input element
    if (validationResult === ValidationResult.OK) {
        if (sibling && sibling.classList.contains("error-message")) {
            sibling.textContent = '';
        }
        if (element.classList.contains(errorClassname)) {
            element.classList.remove(errorClassname);
        }

    // otherwise display error message
    } else {
        if (element.hasAttribute("touched")) {
            // error message
            if (sibling && sibling.classList.contains("error-message")) {
                switch (validationResult) {
                    case ValidationResult.Required:
                        if (element.hasAttribute("data-val-required")) {
                            const errorMessage = element.getAttribute("data-val-required");
                            sibling.textContent = errorMessage ? errorMessage : 'This field is required';
                        }
                        break;
                }
            }
            // error class
            if (!element.classList.contains(errorClassname)) {
                element.classList.add(errorClassname);
            }
        }
    }
}

let checkInputElementRules = (element: HTMLInputElement): ValidationResult => {
    let elementValid = ValidationResult.OK;
    validationRules.map(test => {
        const result = test(element)
        if (result !== ValidationResult.OK) {
            elementValid = result;
        }
    });

    return elementValid;
}

// disables or enables the submit button of a form
let disableSubmitButton = (form: HTMLFormElement, disabled: boolean): void => {
    const buttons = form.getElementsByTagName("button");
    if (buttons && buttons.length) {
        for (let i = 0; i < buttons.length; i++) {
            let buttonType = buttons[i].getAttribute("type");
            if (buttonType && buttonType.toLowerCase() === "submit") {
                buttons[i].disabled = disabled;
                break;
            }
        }
    }
}

// event that fires for input elements
const inputEvent = (event: Event): void => {
    if (event.target) {
        console.log('checking input...')
        const target = <HTMLInputElement>event.target;
        if (!target.hasAttribute("touched")) {
            target.setAttribute("touched", "true");
        }
        validateForm(target, "input-error");
    }
}

const startValidating = () => {
    document.addEventListener("DOMContentLoaded", () => {
        const inputElements = findInputElements(document.body);
        inputElements.map(e => e.addEventListener("input", inputEvent))
        inputElements.map(e => e.addEventListener("change", inputEvent))
        inputElements.map(e => validateForm(e, "input-error"));
    });
}

console.log("staring validation!");
startValidating();