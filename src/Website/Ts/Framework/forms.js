import { searchParentsForTag, removeClassIfExists, addClassIfNotExists, getFormValue, disableButton, enableButton } from "./browser";
import { Html, preparePopupParentElement, preparePopupElement, modal, Div, t, style } from "./renderer";
import { postResponse } from "./http";
import { navigate } from "./router";
import { modalContent } from "./Customizable/Layout/modal-content";

const ATTR_ERROR_REQUIRED = 'required_error';
const ATTR_ERROR_MINLENGTH = 'minlength_error';
const ATTR_ERROR_MAXLENGTH = 'maxlength_error';

/**
 * @constructor
 */
function FormHelper() {

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
        console.log(e);
        const parent = e.parentElement;
        if (parent) {
            const popups = parent.getElementsByClassName('popup');
            for (let i = 0; i < popups.length; ++i) {
                console.log('removing ', popups[i], parent);
                parent.removeChild(popups[i]);
            }
        }
    }

    this.showError = function (e, message) {
        if (e.hasAttribute('touched')) {
            const parent = e.parentElement;
            if (parent && message) {
                addClassIfNotExists(parent, 'popup-container');
                this.removeError(e);

                /** @type {DocumentFragment} */
                const popup = new Html([
                    Div(
                        style('bottom: 0; left: 0;'),
                        t(message || 'Invalid Input')
                    )
                ], '', false);

                preparePopupParentElement(parent);
                preparePopupElement(popup.firstElementChild, 0, null, null, 0);
                parent.appendChild(popup);
            }
        }
    }

    this.testRequired = function (e) {
        if (e.required && !e.value) {
            const error = e.getAttribute(ATTR_ERROR_REQUIRED);
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
                this.showError(e, error);
                return false;
            }
        }

        return true;
    }

    this.testMaxLength = function (e) {
        if (e instanceof HTMLTextAreaElement || e instanceof HTMLInputElement) {
            const maxLength = Number(e.getAttribute('maxlength'));
            if (maxLength && e.value.length > maxLength) {
                const error = e.getAttribute(ATTR_ERROR_MAXLENGTH);
                this.showError(e, error);
                return false;
            }
        }

        return true;
    }

    this.disableSubmitButton = function (form) {
        const buttons = form.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; ++i) {
            if (buttons[i].getAttribute('type') === 'submit') {
                disableButton(buttons[i]);
            }
        }
    }

    this.enableSubmitButton = function (form) {
        const buttons = form.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; ++i) {
            if (buttons[i].getAttribute('type') === 'submit') {
                enableButton(buttons[i]);
            }
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
            if (element.hasAttribute('type') && element.getAttribute('type') === 'hidden') {
                continue;
            }

            const results = [
                this.testRequired(element),
                this.testMinLength(element),
                this.testMaxLength(element)
            ];
            console.log(results);

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

    this.handleSubmit = function (e, postUrl, authorized, successUrl = null, pushState = true, scrollToTop = true, forceRender = false) {
        e.preventDefault();
        const formIsValid = this.validateForm(e);

        const formElement = e.target;
        if (formIsValid && formElement && formElement instanceof HTMLFormElement) {
            const buttonsBeforeSubmit = formElement.getElementsByTagName('button');
            for (let i = 0; i < buttonsBeforeSubmit.length; ++i) {
                disableButton(buttonsBeforeSubmit[i]);
            }

            const formData = getFormValue(e);

            if (formData) {
                postResponse(postUrl, formData, authorized)
                    .then(response => {
                        if (response.ok && successUrl) {
                            navigate(successUrl, undefined, undefined, pushState, forceRender, scrollToTop);
                        } else {
                            this.getErrorMessage(response).then(msg => {
                                modal(false,
                                    modalContent(msg)
                                )
                            });
                        }
                    }).catch(e => console.error(e)).finally(() => {
                        if (formElement) {
                            const buttonsAfterSubmit = formElement.getElementsByTagName('button');
                            for (let i = 0; i < buttonsAfterSubmit.length; ++i) {
                                disableButton(buttonsAfterSubmit[i]);
                            }
                            for (let i = 0; i < buttonsAfterSubmit.length; ++i) {
                                enableButton(buttonsAfterSubmit[i]);
                            }
                        }
                    });
            }
        }
    }
}






export {
    FormHelper,
    ATTR_ERROR_REQUIRED,
    ATTR_ERROR_MINLENGTH,
    ATTR_ERROR_MAXLENGTH
}

