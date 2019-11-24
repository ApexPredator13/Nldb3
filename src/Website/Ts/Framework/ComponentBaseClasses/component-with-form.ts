import { htmlAttributeNameOf, render, A } from "../renderer";
import { removeClassIfExists, addClassIfNotExists, searchParentsForTag, getFormValue } from "../browser";
import { ValidationPopup } from "../../Components/General/validation-popup";
import { GenericError } from "../../Components/Modal/generic-error";
import { navigate } from "../router";
import { ComponentWithModal } from "./component-with-modal";
import { postResponse } from "../http";

export class ComponentWithForm {
    private form: HTMLFormElement | undefined;

    HandleSubmit(e: Event, postUrl: string, authorized: boolean, successUrl: string, pushState = true, scrollToTop = true) {
        e.preventDefault();

        const formIsValid = this.ValidateForm(e);

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
                            navigate(successUrl, undefined, undefined, pushState, false, scrollToTop);
                        } else {
                            this.GetErrorMessage(response).then(msg => {
                                new ComponentWithModal().ShowModal(new GenericError(msg))
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

    async GetErrorMessage(response: Response): Promise<string> {
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

    // gets all form elements and validates them
    // will be called at every 'input' event and returns if the form is valid or not
    ValidateForm(e: Event): boolean {
        this.MarkAsTouched(e);
        const form = this.GetFormTag(e);

        if (!form) {
            return false;
        }

        const inputElements = form.getElementsByTagName('input');
        const selectElements = form.getElementsByTagName('select');
        const textareaElements = form.getElementsByTagName('textarea');

        const allElements = [...Array.from(inputElements), ...Array.from(selectElements), ...Array.from(textareaElements)];

        const testResults = new Array<boolean>();

        for (const element of allElements) {
            const results = [
                this.TestRequired(element),
                this.TestMinlength(element),
                this.TestMaxLength(element)
            ];

            if (!results.some(r => r === false)) {
                this.RemoveError(element);
            }

            testResults.push(...results);
        }

        if (testResults.some(result => result === false)) {
            this.DisableSubmitButton(form);
            return false;
        } else {
            this.EnableSubmitButton(form);
            return true;
        }
    }

    GetFormValue(id: string): string {
        const element = document.getElementById(id);
        if (element) {
            if (element instanceof HTMLSelectElement || element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                return element.value;
            }
        }
        return '';
    }

    private DisableSubmitButton(form: HTMLFormElement) {
        const buttons = form.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; ++i) {
            buttons[i].disabled = true;
        }
    }

    private EnableSubmitButton(form: HTMLFormElement) {
        const buttons = form.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; ++i) {
            buttons[i].disabled = false;
        }
    }

    private MarkAsTouched(e: Event) {
        const target = e.target;
        if (target && (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) && !target.hasAttribute('touched')) {
            target.setAttribute('touched', 'true');
        }
    }

    private TestRequired(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
        if (element.required && !element.value) {
            const errorAttributeName = htmlAttributeNameOf(A.RequiredErrorMessage);
            const error = element.getAttribute(errorAttributeName);
            this.ShowError(element, error);
            return false;
        }

        return true;
    }

    private TestMinlength(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            const minlengthAttributeName = htmlAttributeNameOf(A.MinLength);
            const minLength = Number(element.getAttribute(minlengthAttributeName));
            if (minLength && element.value.length < minLength) {
                const errorAttributeName = htmlAttributeNameOf(A.MinLengthErrorMessage);
                const error = element.getAttribute(errorAttributeName);
                this.ShowError(element, error);
                return false;
            }
        }

        return true;
    }

    private TestMaxLength(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
        if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
            const maxlengthAttributeName = htmlAttributeNameOf(A.MaxLength);
            const maxLength = Number(element.getAttribute(maxlengthAttributeName));
            if (maxLength && element.value.length > maxLength) {
                const errorAttributeName = htmlAttributeNameOf(A.MaxLengthErrorMessage);
                const error = element.getAttribute(errorAttributeName);
                this.ShowError(element, error);
                return false;
            }
        }

        return true;
    }

    // takes an event or form element and recursively scans upwards until a form element is found
    private GetFormTag(eventOrElement?: HTMLElement | Event): HTMLFormElement | undefined {
        if (this.form) {
            return this.form;
        }
        if (!eventOrElement) {
            return undefined;
        }

        const tag = searchParentsForTag<HTMLFormElement>(eventOrElement, 'form');

        if (tag) {
            this.form = tag;
        }

        return tag;
    }

    private ShowError(e: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, message: string | null) {
        if (e.hasAttribute('touched')) {
            const parent = e.parentElement;
            if (parent && message) {
                addClassIfNotExists(parent, 'popup-container');
                this.RemoveError(e);
                const popup = new ValidationPopup(message, e);
                const popupHtml = render(popup);
                if (popupHtml) {
                    parent.appendChild(popupHtml);
                }
            }
        }
    }

    private RemoveError(e: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
        removeClassIfExists(e, 'invalid');
        const parent = e.parentElement;
        if (parent) {
            const popups = parent.getElementsByClassName('popup');
            for (let i = 0; i < popups.length; ++i) {
                parent.removeChild(popups[i]);
            }
        }
    }
}