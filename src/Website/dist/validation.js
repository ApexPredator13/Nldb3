"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var polyfills_1 = require("./lib/polyfills");
polyfills_1.elementClosest();
var emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
var inputElementTypeWhitelist = ["text", "password", "color", "number"];
var applyErrormessage = function (inputElement, message) {
    var errorMessageContainer = inputElement.nextElementSibling;
    if (errorMessageContainer) {
        errorMessageContainer.textContent = message;
    }
};
var applyFormValidState = function (form, isValid) {
    var submitButton = form.getElementsByTagName("button");
    for (var i = 0; i < submitButton.length; i++) {
        if (submitButton[i].getAttribute("type") === "submit") {
            submitButton[i].disabled = !isValid;
        }
    }
};
var inputElementIsValid = function (element, target, markAsTouched) {
    var isValid = true;
    var errorMessage = null;
    var isSameNode = element === target;
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
        errorMessage = errorMessage ? errorMessage : (element.getAttribute("data-val-minlength") ? element.getAttribute("data-val-minlength") : null);
    }
    if (markAsTouched && isSameNode) {
        element.setAttribute("touched", "true");
    }
    if (element.getAttribute("touched") === "true" && isSameNode) {
        applyErrormessage(element, errorMessage);
    }
    return isValid;
};
var evaluateForm = function (target, markAsTouched) {
    var form = target.closest("form");
    if (!form) {
        return;
    }
    var formIsValid = true;
    var inputElements = form.getElementsByTagName("input");
    var textAreaElements = form.getElementsByTagName("textarea");
    for (var i = 0; i < inputElements.length; i++) {
        var element = inputElements[i];
        var type = element.getAttribute("type");
        if (element.getAttribute("data-val") === "true" && inputElementTypeWhitelist.indexOf(type) !== -1) {
            if (!inputElementIsValid(element, target, markAsTouched)) {
                formIsValid = false;
            }
        }
    }
    for (var i = 0; i < textAreaElements.length; i++) {
        var element = textAreaElements[i];
        if (element.getAttribute("data-val") === "true") {
            if (!inputElementIsValid(element, target, markAsTouched)) {
                formIsValid = false;
            }
        }
    }
    applyFormValidState(form, formIsValid);
};
(function () {
    var inputElements = document.getElementsByTagName("input");
    var textareaElements = document.getElementsByTagName("textarea");
    for (var i = 0; i < inputElements.length; i++) {
        evaluateForm(inputElements[i], false);
        inputElements[i].addEventListener("input", function (e) { return evaluateForm(e.target, true); });
        inputElements[i].addEventListener("blur", function (e) { return evaluateForm(e.target, true); });
        inputElements[i].addEventListener("click", function (e) { return evaluateForm(e.target, false); });
    }
    for (var i = 0; i < textareaElements.length; i++) {
        evaluateForm(textareaElements[i], false);
        textareaElements[i].addEventListener("input", function (e) { return evaluateForm(e.target, true); });
        textareaElements[i].addEventListener("blur", function (e) { return evaluateForm(e.target, true); });
        textareaElements[i].addEventListener("click", function (e) { return evaluateForm(e.target, false); });
    }
})();
