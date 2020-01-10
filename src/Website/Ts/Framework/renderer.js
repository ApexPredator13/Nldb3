import { addClassIfNotExists, removeClassIfExists } from "./browser";

const NEW_ELEMENT = 1;
const EVENT_LISTENER = 99;
const CHILD_START = 3;
const TEXT_NODE = 4;
const CHILD_END = 5;
const ATTRIBUTES = 6;
const POPUP_START = 7;
const POPUP_END = 8;
const ID = 9;
const CLASS = 10;

const DIV = 1;
const SPAN = 2;
const BR = 3;
const MAIN = 4;
const NAV = 5;
const PARAGRAPH = 6;
const A = 7;
const HEADER1 = 8;
const HEADER2 = 9;
const HEADER3 = 10;
const HEADER4 = 11;
const STRONG = 12;
const HR = 13;
const IMG = 14;
const BUTTON = 15;
const INPUT = 16;
const TR = 17;
const CANVAS = 18;
const TD = 19;
const TH = 20;
const TBODY = 21;
const THEAD = 22;
const TABLE = 23;
const SELECT = 24;
const OPTION = 25;
const UL = 26;
const LI = 27;
const IFRAME = 28;
const TEXTAREA = 29;
const FORM = 30;
const LABEL = 31;
const FIELDSET = 32;
const PRE = 33;
const OL = 34;

const do_nothing = function () {
    const doNothing = function () { }
    return doNothing;
};

// infrastructure
function HtmlBuffer() {
    this.buffer = {
        data: [],
        index: 0,
        replace: false,
        id: 'main'
    };
}

const HtmlMaker = function () {
    HtmlBuffer.call(this);
}

HtmlMaker.prototype = Object.create(HtmlBuffer.prototype);

HtmlMaker.prototype.build = function (...args) {
    for (const arg of args) {
        try {
            arg.call(this);
        }
        catch (e) {
            console.warn('failed to render:', arg);
            console.error('error:', e);
        }
    }
}

function Html(content, id = 'main', displayHtmlAfterRender = true, replaceContent = true) {

    if (!this.buffer) {
        HtmlMaker.call(this);
        this.buffer.id = id;
    }
    if (content && content.length > 0) {
        this.build(...content);
    }

    const renderedElements = [];
    let currentElement;

    while (this.buffer.index < this.buffer.data.length) {

        const currentData = this.buffer.data[this.buffer.index++];

        switch (currentData) {

            case NEW_ELEMENT:
                let elementType;
                let elementNumber = this.buffer.data[this.buffer.index++];

                switch (elementNumber) {
                    case DIV: elementType = 'div'; break;
                    case SPAN: elementType = 'span'; break;
                    case BR: elementType = 'br'; break;
                    case MAIN: elementType = 'main'; break;
                    case NAV: elementType = 'nav'; break;
                    case HEADER1: elementType = 'h1'; break;
                    case HEADER2: elementType = 'h2'; break;
                    case HEADER3: elementType = 'h3'; break;
                    case HEADER4: elementType = 'h4'; break;
                    case HR: elementType = 'hr'; break;
                    case STRONG: elementType = 'strong'; break;
                    case IMG: elementType = 'img'; break;
                    case BUTTON: elementType = 'button'; break;
                    case INPUT: elementType = 'input'; break;
                    case TD: elementType = 'td'; break;
                    case TBODY: elementType = 'tbody'; break;
                    case THEAD: elementType = 'thead'; break;
                    case TABLE: elementType = 'table'; break;
                    case TH: elementType = 'th'; break;
                    case TR: elementType = 'tr'; break;
                    case SELECT: elementType = 'select'; break;
                    case OPTION: elementType = 'option'; break;
                    case CANVAS: elementType = 'canvas'; break;
                    case PARAGRAPH: elementType = 'p'; break;
                    case UL: elementType = 'ul'; break;
                    case LI: elementType = 'li'; break;
                    case A: elementType = 'a'; break;
                    case IFRAME: elementType = 'iframe'; break;
                    case TEXTAREA: elementType = 'textarea'; break;
                    case FORM: elementType = 'form'; break;
                    case LABEL: elementType = 'label'; break;
                    case FIELDSET: elementType = 'fieldset'; break;
                    case PRE: elementType = 'pre'; break;
                    case OL: elementType = 'ol'; break;
                    default:
                        console.warn('unknown element: ' + elementNumber + ', defaulting to DIV!');
                        elementType = 'div';
                        break;
                }

                currentElement = document.createElement(elementType);
                renderedElements.push(currentElement);
                break;

            case CHILD_START:
                const createdChildren = Html.call(this);
                for (const createdChild of createdChildren) {
                    currentElement.appendChild(createdChild);
                }
                
                break;

            case TEXT_NODE:
                const text = document.createTextNode(this.buffer.data[this.buffer.index++]);
                currentElement.appendChild(text);
                break;

            case CHILD_END:
                return renderedElements;

            case ID:
                currentElement.id = this.buffer.data[this.buffer.index++];
                break;

            case CLASS:
                currentElement.classList.add(...(this.buffer.data[this.buffer.index++]));
                break;

            case ATTRIBUTES:
                const attributes = this.buffer.data[this.buffer.index++];
                for (const key of Object.keys(attributes)) {
                    currentElement.setAttribute(key, attributes[key])
                }
                break;

            case EVENT_LISTENER:
                const type = this.buffer.data[this.buffer.index++];
                const event = this.buffer.data[this.buffer.index++];
                const subscribers = this.buffer.data[this.buffer.index++];

                currentElement.addEventListener(type, e => {
                    const result = event(e);
                    if (result && subscribers.length > 0) {
                        for (let i = 0; i < subscribers.length; ++i) {
                            subscribers[i](result);
                        }
                    }
                });

                break;

            case POPUP_START:
                if (renderedElements.length < 1) {
                    continue;
                }

                // extract data
                const top = this.buffer.data[this.buffer.index++];
                const right = this.buffer.data[this.buffer.index++];
                const bottom = this.buffer.data[this.buffer.index++];
                const left = this.buffer.data[this.buffer.index++];

                const parent = renderedElements[renderedElements.length - 1];
                preparePopupParentElement(parent);

                // render popup elements
                const popup = Html.call(this);
                preparePopupElement(popup, top, right, bottom, left);

                // append to container
                parent.appendChild(popup);
                break;

            case POPUP_END:
                return currentElement;

            default:
                throw new TypeError('render event not handled!');
        }
    }

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < renderedElements.length; ++i) {
        fragment.appendChild(renderedElements[i]);
    }


    if (displayHtmlAfterRender) {
        const container = document.getElementById(this.buffer.id || id);
        if (container) {
            if (replaceContent) {
                container.innerHTML = '';
            }
            container.appendChild(fragment);
        }
    } else {
        return fragment;
    }
}

Html.prototype = Object.create(HtmlMaker.prototype);

function preparePopupElement(e, top, right, bottom, left) {
    e.classList.add('popup', 'display-none');
    e.style.position = 'absolute';

    // position element
    if (typeof (top) === 'number') e.style.top = `${top}px`;
    if (typeof (right) === 'number') e.style.right = `${right}px`;
    if (typeof (bottom) === 'number') e.style.bottom = `${bottom}px`;
    if (typeof (left) === 'number') e.style.left = `${left}px`;
}

function preparePopupParentElement(e) {
    e.style.position = 'relative';

    // add mouseover/mouseleave events
    e.addEventListener('mouseenter', e => {
        const popups = e.target.getElementsByClassName('popup');
        if (popups && popups.length > 0) {
            for (let i = 0; i < popups.length; ++i) {
                removeClassIfExists(popups[i], 'display-none');
                addClassIfNotExists(popups[i], 'display-normal');
            }
        }
    });

    e.addEventListener('mouseleave', e => {
        const popups = e.target.getElementsByClassName('popup');
        if (popups && popups.length > 0) {
            for (let i = 0; i < popups.length; ++i) {
                removeClassIfExists(popups[i], 'display-normal');
                addClassIfNotExists(popups[i], 'display-none');
            }
        }
    });
}

// html helper functions
function t(innerText) {
    return function () {
        this.buffer.data.push(TEXT_NODE, innerText);
    }
}

function id(a) {
    return function () {
        this.buffer.data.push(ID, a);
    }
}


function style(s) {
    return function () {
        this.buffer.data.push(ATTRIBUTES, { 'style': s });
    }
}

function src(s) {
    return function () {
        this.buffer.data.push(ATTRIBUTES, { 'src': s });
    }
}

function attr(a) {
    return function () {
        this.buffer.data.push(ATTRIBUTES, a);
    }
}

function cl(...classNames) {
    return function () {

        const classesToAdd = classNames.filter(classname => {
            if (classname) {
                return true;
            }
            return false;
        });

        if (classesToAdd && classesToAdd.length > 0) {
            this.buffer.data.push(CLASS, classesToAdd);
        }
    }
}

function href(link) {
    return function () {
        this.buffer.data.push(ATTRIBUTES, { 'href': link })
    }
}

function popup(distances, popupCreator) {
    return function () {
        this.buffer.data.push(POPUP_START, distances.top, distances.right, distances.bottom, distances.left);
        popupCreator.call(this);
        this.buffer.data.push(POPUP_END);
    }
}

function modal(hideOnClickAnywhere, ...content) {
    const modalContainer = document.getElementById('modal') || createAndGetModalContainer();
    modalContainer.innerHTML = '';
    new Html([...content], 'modal');
    const modalContentDiv = modalContainer.firstElementChild;
    addClassIfNotExists(modalContentDiv, 'modal-container');
    showModal(hideOnClickAnywhere);
}

function event(type, fn, ...subscribers) {
    return function () {
        this.buffer.data.push(EVENT_LISTENER, type, fn, subscribers);
    }
}

function Parent(type, ...contents) {
    return function () {
        this.buffer.data.push(NEW_ELEMENT, type);
        for (let i = 0; i < contents.length; ++i) {
            try {
                contents[i].call(this);
            } catch (e) {
                console.warn('error! cannot call', contents[i], contents);
                console.error(e)
            }
            //contents[i].call(this);
        }
    }
}

function Child(type, ...contents) {
    return function () {
        this.buffer.data.push(CHILD_START, NEW_ELEMENT, type);
        for (let i = 0; i < contents.length; ++i) {
            try {
                contents[i].call(this);
            } catch (e) {
                console.warn('error! cannot call', contents[i], contents);
                console.error(e)
            }
            //contents[i].call(this);
        }
        this.buffer.data.push(CHILD_END);
    }
}

function formButton(...contents) {
    return function () {
        this.buffer.data.push(CHILD_START, NEW_ELEMENT, BUTTON, ATTRIBUTES, { type: 'submit', disabled: 'true' });
        for (let i = 0; i < contents.length; ++i) {
            contents[i].call(this);
        }
        this.buffer.data.push(CHILD_END);
    }
}

function Main(...contents) {
    return Parent.call(this, MAIN, ...contents);
}

function Nav(...contents) {
    return Parent.call(this, NAV, ...contents);
}

function img(...contents) {
    return Child.call(this, IMG, ...contents);
}

function Div(...contents) {
    return Parent.call(this, DIV, ...contents);
}

function p(...contents) {
    return Child.call(this, PARAGRAPH, ...contents);
}

function form(...contents) {
    return Child.call(this, FORM, ...contents);
}

function fieldset(...contents) {
    return Child.call(this, FIELDSET, ...contents);
}

function ul(...contents) {
    return Child.call(this, UL, ...contents);
}

function ol(...contents) {
    return Child.call(this, OL, ...contents);
}

function li(...contents) {
    return Child.call(this, LI, ...contents);
}

function P(...contents) {
    return Parent.call(this, PARAGRAPH, ...contents);
}

function a(...contents) {
    return Child.call(this, A, ...contents);
}

function div(...contents) {
    return Child.call(this, DIV, ...contents);
}

function textarea(...contents) {
    return Child.call(this, TEXTAREA, ...contents);
}

function label(...contents) {
    return Child.call(this, LABEL, ...contents);
}

function pre(...contents) {
    return Child.call(this, PRE, ...contents);
}

function iframe(...contents) {
    return Child.call(this, IFRAME, ...contents);
}

function span(...contents) {
    return Child.call(this, SPAN, ...contents);
}

function strong(...contents) {
    return Child.call(this, STRONG, ...contents);
}

function input(...contents) {
    return Child.call(this, INPUT, ...contents);
}

function canvas(...contents) {
    return Child.call(this, CANVAS, ...contents);
}

function br(...contents) {
    return Child.call(this, BR, ...contents);
}

function h1(...contents) {
    return Child.call(this, HEADER1, ...contents);
}

function H1(...contents) {
    return Parent.call(this, HEADER1, ...contents);
}

function h2(...contents) {
    return Child.call(this, HEADER2, ...contents);
}

function H2(...contents) {
    return Parent.call(this, HEADER2, ...contents);
}

function h3(...contents) {
    return Child.call(this, HEADER3, ...contents);
}

function h4(...contents) {
    return Child.call(this, HEADER4, ...contents);
}

function hr(...contents) {
    return Child.call(this, HR, ...contents);
}

function Hr(...contents) {
    return Parent.call(this, HR, ...contents);
}

function button(...contents) {
    return Child.call(this, BUTTON, ...contents);
}

function td(...contents) {
    return Child.call(this, TD, ...contents);
}

function tr(...contents) {
    return Child.call(this, TR, ...contents);
}

function Tr(...contents) {
    return Parent.call(this, TR, ...contents);
}

function th(...contents) {
    return Child.call(this, TH, ...contents);
}

function Tbody(...contents) {
    return Parent.call(this, TBODY, ...contents);
}

function thead(...contents) {
    return Child.call(this, THEAD, ...contents);
}

function tbody(...contents) {
    return Child.call(this, TBODY, ...contents);
}

function Table(...contents) {
    return Parent.call(this, TABLE, ...contents);
}

function table(...contents) {
    return Child.call(this, TABLE, ...contents);
}

function select(...contents) {
    return Child.call(this, SELECT, ...contents);
}

function option(text, value, selected, ...contents) {
    return function () {
        const attributes = { value: value };
        if (selected) {
            attributes.selected = 'true';
        }

        this.buffer.data.push(CHILD_START, NEW_ELEMENT, OPTION, ATTRIBUTES, attributes, TEXT_NODE, text);
        for (let i = 0; i < contents.length; ++i) {
            contents[i].call(this);
        }
        this.buffer.data.push(CHILD_END);
    }
}


function createAndGetModalContainer() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal';
    modalContainer.classList.add('display-none');
    modalContainer.style.width = '100%';
    modalContainer.style.minHeight = '100%';
    modalContainer.style.zIndex = '100000';
    modalContainer.style.backgroundColor = 'rgba(0,0,0,0.3)';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.addEventListener('click', hideModal);
    document.body.appendChild(modalContainer);
    return modalContainer;
}

function removeModalEventListeners(modalContainer) {
    modalContainer.removeEventListener('click', hideModal);
}

function addModalCloseOnClickAnywhereEventListener() {
    const modalContainer = document.getElementById('modal');
    modalContainer.addEventListener('click', hideModal);
}

function showModal(hideOnClickAnywhere) {
    const modalContainer = document.getElementById('modal');
    removeModalEventListeners(modalContainer);
    if (hideOnClickAnywhere) {
        addModalCloseOnClickAnywhereEventListener();
    }
    removeClassIfExists(modalContainer, 'display-none');
    addClassIfNotExists(modalContainer, 'display-normal');
}

function hideModal() {
    const modalContainer = document.getElementById('modal');
    removeModalEventListeners(modalContainer);
    removeClassIfExists(modalContainer, 'display-normal');
    addClassIfNotExists(modalContainer, 'display-none');
}

export {
    Html,
    popup,
    preparePopupParentElement,
    preparePopupElement,
    modal,
    event,
    Div,
    Main,
    Nav,
    div,
    span,
    br,
    t,
    id,
    cl,
    p,
    P,
    select,
    option,
    a,
    href,
    style,
    h1,
    H1,
    h2,
    h3,
    h4,
    hr,
    strong,
    do_nothing,
    img,
    input,
    src,
    attr,
    button,
    formButton,
    hideModal,
    td,
    tr,
    th,
    Tbody,
    tbody,
    thead,
    Table,
    canvas,
    table,
    Hr,
    ul,
    li,
    iframe,
    textarea,
    form,
    H2,
    label,
    fieldset,
    Tr,
    pre,
    ol
}
