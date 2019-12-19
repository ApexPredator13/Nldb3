import { searchParentsForTag, removeClassIfExists, addClassIfNotExists, getFormValue } from "./browser";
import { Render, preparePopupParentElement, preparePopupElement, modal, cl, div, h3, hr, p, span, br } from "./renderer";
import { postResponse } from "./http";
import { navigate } from "./router";
import { modalContent } from "./Customizable/Layout/modal-content";

const ATTR_ERROR_REQUIRED = 'error-required';
const ATTR_ERROR_MINLENGTH = 'error-minlength';
const ATTR_ERROR_MAXLENGTH = 'error-maxlength';

export function FormHelper() {

    this.form = null;

    this.getFormTag = function (e) {
        if (this.form) {
            return this.form;
        }

        this.form = searchParentsForTag(e, 'form');
        return this.form;
    }

    this.markAsTouched = function (e) {
        const target = e.target;
        if (target && (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) && !target.hasAttribute('touched')) {
            target.setAttribute('touched', 'true');
        }
    }

    this.removeError = function (e) {
        removeClassIfExists(e, 'invalid');
        const parent = e.parentElement;
        if (parent) {
            const popups = parent.getElementsByClassName('popup');
            for (let i = 0; i < popups.length; ++i) {
                parent.removeChild(popups[i]);
            }
        }
    }

    this.showError = function (e, message) {
        if (e.hasAttribute('touched')) {
            const parent = e.parentElement;
            if (parent && message) {
                addClassIfNotExists(parent, 'popup-container');
                this.RemoveError(e);

                const popup = new Render([
                    Div(
                        t(message || 'Invalid Input')
                    )
                ], '', false);

                preparePopupParentElement(parent);
                preparePopupElement(popup, 0, null, null, 0);
                parent.appendChild(popup);
            }
        }
    }

    this.testRequired = function (e) {
        if (e.required && !e.value) {
            const error = element.getAttribute(ATTR_ERROR_REQUIRED);
            this.showError(e, error);
            return false;
        }

        return true;
    }

    this.testMinLength = function (e) {
        if (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) {
            const minLength = Number(e.getAttribute('minlength'));
            if (minLength && e.value.length < minLength) {
                const error = e.getAttribute(ATTR_ERROR_MINLENGTH);
                this.ShowError(e, error);
                return false;
            }
        }

        return true;
    }

    this.testMaxLength = function (e) {
        if (e instanceof HTMLTextAreaElement || e instanceof HTMLInputElement) {
            const maxLength = Number(element.getAttribute('maxlength'));
            if (maxLength && e.value.length > maxLength) {
                const error = e.getAttribute(ATTR_ERROR_MAXLENGTH);
                this.ShowError(e, error);
                return false;
            }
        }

        return true;
    }

    this.disableSubmitButton = function (form) {
        const buttons = form.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; ++i) {
            buttons[i].disabled = true;
        }
    }

    this.enableSubmitButton = function (form) {
        const buttons = form.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; ++i) {
            buttons[i].disabled = false;
        }
    }

    this.validateForm = function (e) {
        this.markAsTouched(e);
        const form = this.getFormTag(e);

        if (!form) {
            return false;
        }

        const inputElements = form.getElementsByTagName('input');
        const selectElements = form.getElementsByTagName('select');
        const textareaElements = form.getElementsByTagName('textarea');
        const allElements = [...Array.from(inputElements), ...Array.from(selectElements), ...Array.from(textareaElements)];

        const testResults = [];

        for (const element of allElements) {
            const results = [
                this.testRequired(element),
                this.testMinlength(element),
                this.testMaxLength(element)
            ];

            if (!results.some(r => r === false)) {
                this.removeError(element);
            }

            testResults.push(...results);
        }

        if (testResults.some(result => result === false)) {
            this.disableSubmitButton(form);
            return false;
        } else {
            this.enableSubmitButton(form);
            return true;
        }
    }

    this.getErrorMessage = async function (response) {
        try {
            const body = await response.json();
            if (body && body.errors) {
                const keys = Object.keys(body.errors);
                const errorMessage = body.errors[keys[0]];
                return errorMessage;
            }
            const bodyText = await response.text();
            return bodyText;
        } catch {
            return 'An error has occurred!';
        }
    }

    this.handleSubmit = function (e, postUrl, authorized, successUrl, pushState = true, scrollToTop = true, forceRender = false) {
        const formIsValid = this.validateForm(e);

        const target = e.target;
        if (formIsValid && target && target instanceof HTMLFormElement) {
            const formButtons = target.getElementsByTagName('button');
            for (let i = 0; i < formButtons.length; ++i) {
                formButtons[i].disabled = true;
            }

            const formData = getFormValue(e);

            if (formData) {
                postResponse(postUrl, formData, authorized)
                    .then(response => {
                        if (response.ok) {
                            navigate(successUrl, undefined, undefined, pushState, forceRender, scrollToTop);
                        } else {
                            this.getErrorMessage(response).then(msg => {
                                modal(false,
                                    modalContent(msg)
                                )
                            });
                        }
                    }).finally(() => {
                        for (let i = 0; i < formButtons.length; ++i) {
                            formButtons[i].disabled = false;
                        }
                    });
            }
        }
    }
}




