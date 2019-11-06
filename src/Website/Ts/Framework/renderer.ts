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

    /** Async Element */
    AE?: Promise<FrameworkElement>

    /** Container ID for async element */
    AEI?: string
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
    DataLowercaseName
}

enum EventType {
    Click = 1,
    MouseEnter,
    Input
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
            return 'data-n'
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
            return 'input'
        default:
            return '';
    }
}



const render: renderFunction = elementOrComponent => {

    // queue up the async part of the component if it has one
    if ((elementOrComponent as Component).AE) {
        const component = elementOrComponent as Component;
        if (component.AE) {
            component.AE.then(e => {
                const html = render(e);
                if (html && component.AEI) {
                    const elementContainer = document.getElementById(component.AEI);
                    if (elementContainer) {
                        elementContainer.innerHTML = '';
                        elementContainer.appendChild(html);
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
    Attribute,
    Component,
    EventType,
    render
}

