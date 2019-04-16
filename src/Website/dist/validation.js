import { elementClosest } from './polyfills';
elementClosest();
var emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
var validatableInputElements = ["text", "password"];
var ValidationResult;
(function (ValidationResult) {
    ValidationResult[ValidationResult["OK"] = 1] = "OK";
    ValidationResult[ValidationResult["Required"] = 2] = "Required";
    ValidationResult[ValidationResult["InvalidEmail"] = 3] = "InvalidEmail";
})(ValidationResult || (ValidationResult = {}));
var validationRules = new Array(function (e) { return e.hasAttribute("data-required") && !e.value ? ValidationResult.Required : ValidationResult.OK; }, function (e) { return e.hasAttribute("data-email") && !emailRegex.test(e.value) ? ValidationResult.InvalidEmail : ValidationResult.OK; });
// finds all input elements that should be validated
var findInputElements = function (someElement) {
    var inputElements = someElement.getElementsByTagName("input");
    var result = new Array();
    if (inputElements && inputElements.length) {
        for (var i = 0; i < inputElements.length; i++) {
            var inputType = inputElements[i].getAttribute("type");
            if (validatableInputElements.indexOf(inputType ? inputType : '') === -1) {
                continue;
            }
            result.push(inputElements[i]);
        }
    }
    return result;
};
// takes an input element, validates the form it's part of, and displays the error message next to the form field
var validateForm = function (element, errorClassname) {
    var validationResult = checkInputElementRules(element);
    var formValid = true;
    var parentForm = element.closest("form");
    if (!parentForm) {
        return;
    }
    // 
    findInputElements(parentForm).map(function (element) {
        var valid = checkInputElementRules(element);
        if (valid !== ValidationResult.OK) {
            formValid = false;
        }
    });
    if (formValid) {
        disableSubmitButton(parentForm, false);
    }
    else {
        disableSubmitButton(parentForm, true);
    }
    var sibling = element.nextElementSibling;
    // if OK, remove error message from input element
    if (validationResult === ValidationResult.OK) {
        if (sibling && sibling.classList.contains("error-message")) {
            sibling.textContent = '';
        }
        if (element.classList.contains(errorClassname)) {
            element.classList.remove(errorClassname);
        }
        // otherwise display error message
    }
    else {
        if (element.hasAttribute("touched")) {
            // error message
            if (sibling && sibling.classList.contains("error-message")) {
                switch (validationResult) {
                    case ValidationResult.Required:
                        if (element.hasAttribute("data-val-required")) {
                            var errorMessage = element.getAttribute("data-val-required");
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
};
var checkInputElementRules = function (element) {
    var elementValid = ValidationResult.OK;
    validationRules.map(function (test) {
        var result = test(element);
        if (result !== ValidationResult.OK) {
            elementValid = result;
        }
    });
    return elementValid;
};
// disables or enables the submit button of a form
var disableSubmitButton = function (form, disabled) {
    var buttons = form.getElementsByTagName("button");
    if (buttons && buttons.length) {
        for (var i = 0; i < buttons.length; i++) {
            var buttonType = buttons[i].getAttribute("type");
            if (buttonType && buttonType.toLowerCase() === "submit") {
                buttons[i].disabled = disabled;
                break;
            }
        }
    }
};
// event that fires for input elements
var inputEvent = function (event) {
    if (event.target) {
        console.log('checking input...');
        var target = event.target;
        if (!target.hasAttribute("touched")) {
            target.setAttribute("touched", "true");
        }
        validateForm(target, "input-error");
    }
};
var startValidating = function () {
    document.addEventListener("DOMContentLoaded", function () {
        var inputElements = findInputElements(document.body);
        inputElements.map(function (e) { return e.addEventListener("input", inputEvent); });
        inputElements.map(function (e) { return e.addEventListener("change", inputEvent); });
        inputElements.map(function (e) { return validateForm(e, "input-error"); });
    });
};
console.log("staring validation!");
startValidating();
