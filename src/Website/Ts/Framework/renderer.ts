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

const storeComponentPromise = (p: Promise<any>) => {
    if (!(window as any).p) {
        (window as any).p = new Array<Promise<any>>(p);
    } else {
        console.log('storing async component promise', p);
        (window as any).p.push(p);
    }
}

const getComponentPromises = () => {
    if ((window as any).p) {
        return (window as any).p as Array<Promise<any>>;
    } else {
        return new Array<Promise<any>>();
    }
}

const clearComponentPromises = () => {
    (window as any).p = new Array<Promise<any>>();
}

const render = (elementOrComponent: FrameworkElement | Component): HTMLElement | null => {

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
                    }
                }
            });

            storeComponentPromise(promise);
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
    Checked,
    Multiple,
    Size,
    Src,
    FrameBorder,
    Cols,
    Rows,
    DataC,
    DataF,
    DataE,
    DataT
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
        case A.Multiple:
            return 'multiple';
        case A.Size:
            return 'size';
        case A.Src:
            return 'src';
        case A.FrameBorder:
            return 'frameborder';
        case A.Cols:
            return 'cols';
        case A.Rows:
            return 'rows';
        case A.DataC:
            return 'c';
        case A.DataF:
            return 'f';
        case A.DataE:
            return 'e';
        case A.DataT:
            return 't';
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







export {
    FrameworkElement,
    AsyncComponentPart,
    A,
    Component,
    EventType,
    render,
    htmlAttributeNameOf,
    getComponentPromises,
    clearComponentPromises
}

