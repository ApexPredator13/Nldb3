type renderFunction = (element: FrameworkElement | Component) => HTMLElement | null;

interface FrameworkElement {
    /** tag name */
    e: [keyof HTMLElementTagNameMap, string?],

    /** child elements */
    c?: Array<FrameworkElement | Component>

    /** attributes */
    a?: Array<[Attribute, string] | null>

    /** event listeners */
    v?: Array<[EventType, EventListener]>
};

interface Component {
    /** Element */
    E: FrameworkElement

    /** Async Elements */
    A?: Array<AsyncComponentPart>
}

interface AsyncComponentPart {
    /** Async Element */
    P: Promise<FrameworkElement | Component>

    /** Element ID the element will be rendered into after it's created */
    I: string

    /** Append to element or replace content? */
    A?: boolean
}

enum Attribute {
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
    Colspan
}

enum EventType {
    Click = 1,
    MouseEnter,
    MouseLeave,
    Input,
    Change,
    Custom_ShowPopup
}

const translateAttribute = (attribute: Attribute) => {
    switch (attribute) {
        case Attribute.Style:
            return 'style';
        case Attribute.Class:
            return 'class';
        case Attribute.Id:
            return 'id';
        case Attribute.Href:
            return 'href';
        case Attribute.Target:
            return 'target';
        case Attribute.Title:
            return 'title';
        case Attribute.Type:
            return 'type';
        case Attribute.DataId:
            return 'data-id';
        case Attribute.DataLowercaseName:
            return 'data-n';
        case Attribute.Value:
            return 'value';
        case Attribute.Selected:
            return 'selected';
        case Attribute.Placeholder:
            return 'placeholder';
        case Attribute.Colspan:
            return 'colspan';
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
                    finishedElement.setAttribute(translateAttribute(key), value);
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
    Attribute,
    Component,
    EventType,
    render
}

