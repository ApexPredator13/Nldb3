import { setZIndex, getFormValue, addClassIfNotExists, searchParentsForTag } from "./browser";
import { popupEventData } from "./popup";
import { navigate } from "./router";
import { postResponse } from "./http";
import { removeClassIfExists } from "../../wwwroot/js/src/lib/dom-operations";
import { ValidationPopup } from "../Components/General/validation-popup";

type renderFunction = (element: FrameworkElement | Component) => HTMLElement | null;

interface FrameworkElement {
    /** tag name */
    e: [keyof HTMLElementTagNameMap, string?],

    /** child elements */
    c?: Array<FrameworkElement | Component>

    /** attributes */
    a?: Array<[A, string] | null>

    /** event listeners */
    v?: Array<[EventType, EventListener]>
};

interface Component {
    /** Element */
    E: FrameworkElement

    /** Async Elements */
    A?: Array<AsyncComponentPart>
}

class ComponentWithPopup {
    CreatePopupForElement(element: FrameworkElement, component: Component) {
        if (!element.v) {
            element.v = new Array<[EventType, EventListener]>();
        }

        const mouseEnter = (e: Event) => {
            const eventData: popupEventData = {
                event: e,
                popup: component
            };

            setZIndex(e, 10000);
            const event: CustomEvent<popupEventData> = new CustomEvent('showPopup', { detail: eventData });
            window.dispatchEvent(event);
        };

        const mouseLeave = (e: Event) => {
            setZIndex(e, null);
        }

        element.v.push([EventType.MouseEnter, mouseEnter], [EventType.MouseLeave, mouseLeave]);
    }
}

class ComponentWithForm {
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
                    .then(() => {
                        console.log('navigating after success: ', successUrl);
                        navigate(successUrl, undefined, undefined, pushState, false, scrollToTop);
                    })
                    .catch((e: Response) => {
                        // todo: show error in fullscreen modal
                        e.text().then(message => console.error(message));
                    })
                    .finally(() => {
                        for (let i = 0; i < formButtons.length; ++i) {
                            formButtons[i].disabled = false;
                        }
                    });
            }
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
            testResults.push(
                this.TestRequired(element),
                this.TestMinlength(element),
                this.TestMaxLength(element)
            );
        }

        if (testResults.some(result => result === false)) {
            this.DisableSubmitButton(form);
            return false;
        } else {
            this.EnableSubmitButton(form);
            return true;
        }
    }

    private DisableSubmitButton(form: HTMLFormElement) {
        console.warn('disabling submit buttons');
        const buttons = form.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; ++i) {
            buttons[i].disabled = true;
        }
    }

    private EnableSubmitButton(form: HTMLFormElement) {
        console.warn('enabling submit buttons');
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
            console.warn('required');
            return false;
        }

        this.RemoveError(element);
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
                console.warn('too short');
                return false;
            }
        }

        this.RemoveError(element);
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
                console.warn('too long');
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
                    addClassIfNotExists(e, 'invalid');
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

interface AsyncComponentPart {
    /** Async Element */
    P: Promise<FrameworkElement | Component>

    /** Element ID the element will be rendered into after it's created */
    I: string

    /** Append to element or replace content? */
    A?: boolean
}

enum A {
    Id = 1,
    Class,
    DataId,
    Style,
    Href,
    Target,
    Title,
    Type,
    Value,
    DataLowercaseName,
    Selected,
    Placeholder,
    Colspan,
    Width,
    Height,
    Method,
    Name,
    Disabled,
    Required,
    RequiredErrorMessage,
    MinLength,
    MinLengthErrorMessage,
    MaxLength,
    MaxLengthErrorMessage,
    Enctype,
    Checked
}

enum EventType {
    Click = 1,
    MouseEnter,
    MouseLeave,
    Input,
    Change,
    Custom_ShowPopup,
    Submit
}

const htmlAttributeNameOf = (attribute: A) => {
    switch (attribute) {
        case A.Style:
            return 'style';
        case A.Class:
            return 'class';
        case A.Id:
            return 'id';
        case A.Href:
            return 'href';
        case A.Target:
            return 'target';
        case A.Title:
            return 'title';
        case A.Type:
            return 'type';
        case A.DataId:
            return 'data-id';
        case A.DataLowercaseName:
            return 'data-n';
        case A.Value:
            return 'value';
        case A.Selected:
            return 'selected';
        case A.Placeholder:
            return 'placeholder';
        case A.Colspan:
            return 'colspan';
        case A.Width:
            return 'width';
        case A.Height:
            return 'height';
        case A.Method:
            return 'method';
        case A.Name:
            return 'name';
        case A.Disabled:
            return 'disabled';
        case A.Required:
            return 'required';
        case A.RequiredErrorMessage:
            return 'required-error';
        case A.MinLength:
            return 'minlength';
        case A.MinLengthErrorMessage:
            return 'minlength-error';
        case A.Enctype:
            return 'enctype';
        case A.MaxLength:
            return 'maxlength';
        case A.MaxLengthErrorMessage:
            return 'maxlength-error';
        case A.Checked:
            return 'checked';
        default:
            return '';
    }
}

const translateEventType = (eventType: EventType) => {
    switch (eventType) {
        case EventType.Click:
            return 'click';
        case EventType.MouseEnter:
            return 'mouseenter';
        case EventType.Input:
            return 'input';
        case EventType.Change:
            return 'change';
        case EventType.Custom_ShowPopup:
            return 'showPopup';
        case EventType.MouseLeave:
            return 'mouseleave';
        case EventType.Submit:
            return 'submit';
        default:
            return '';
    }
}



const render: renderFunction = elementOrComponent => {

    // queue up the async parts of the component if it has any
    const component = elementOrComponent as Component;
    if (component.A) {
        for (let i = 0; i < component.A.length; ++i) {
            const promise = component.A[i].P;
            const parentId = component.A[i].I;
            const append = component.A[i].A;

            promise.then(e => {
                const html = render(e);
                if (html) {
                    const parentElement = document.getElementById(parentId);
                    if (parentElement) {
                        if (!append) {
                            parentElement.innerHTML = '';
                        }
                        parentElement.appendChild(html);
                    } else {
                        console.error('parent with id not found: ', parentId);
                    }
                }
            });
        }
    }

    // if it's a component, just use it's frameworkElement
    if ((elementOrComponent as Component).E) {
        elementOrComponent = (elementOrComponent as Component).E;
    }

    // at this point it's always a framework element
    const element = elementOrComponent as FrameworkElement;

    const finishedElement = document.createElement(element.e[0]);
    if (element.e[1]) {
        finishedElement.innerText = element.e[1];
    }
    if (element.a) {
        for (let i = 0; i < element.a.length; ++i) {
            const attribute = element.a[i];
            if (attribute) {
                const key = attribute[0];
                const value = attribute[1];
                if (key && value) {
                    finishedElement.setAttribute(htmlAttributeNameOf(key), value);
                }
            }
        }
    }
    if (element.v) {
        for (let i = 0; i < element.v.length; ++i) {
            const eventType = translateEventType(element.v[i][0]);
            finishedElement.addEventListener(eventType, element.v[i][1]);
        }
    }
    if (element.c) {
        for (let i = 0; i < element.c.length; ++i) {
            const html = render(element.c[i]);
            if (html) {
                finishedElement.appendChild(html);
            }
        }
    }
    return finishedElement;
};



export {
    FrameworkElement,
    AsyncComponentPart,
    A,
    Component,
    ComponentWithPopup,
    ComponentWithForm,
    EventType,
    render,
    htmlAttributeNameOf
}

