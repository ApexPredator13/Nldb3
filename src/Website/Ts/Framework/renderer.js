import { addClassIfNotExists, removeClassIfExists } from "../../dist/browser";

const NEW_ELEMENT = 1;
const EVENT_LISTENER = 2;
const CHILD_START = 3;
const TEXT_NODE = 4;
const CHILD_END = 5;
const ATTRIBUTES = 6;
const POPUP_START = 7;
const POPUP_END = 8;
const ID = 9;
const CLASS = 10;
const TD = 11;
const TH = 12;
const TBODY = 13;
const THEAD = 14;
const TABLE = 15;
const SELECT = 16;
const OPTION = 17;

const DIV = 1;
const SPAN = 2;
const BR = 3;
const MAIN = 4;
const NAV = 5;
const P = 6;
const A = 7;
const H1 = 8;
const H2 = 9;
const H3 = 10;
const H4 = 11;
const STRONG = 12;
const HR = 13;
const IMG = 14;
const BUTTON = 15;
const INPUT = 16;
const TR = 17;
const CANVAS = 18;

const do_nothing = function () { };

// infrastructure
function HtmlBuffer() {
    this.buffer = {
        data: [],
        index: 0,
        replace: false,
        id: 'main'
    };
}

HtmlBuffer.prototype.print = function () {
    console.log('sync: ', this.buffer, ' | async:', this.async);
}

const HtmlMaker = function () {
    HtmlBuffer.call(this);
}

HtmlMaker.prototype = Object.create(HtmlBuffer.prototype);

HtmlMaker.prototype.build = function (...args) {
    for (const arg of args) {
        arg.call(this);
    }
}

function Render(content, id = 'main', displayHtmlAfterRender = true, replaceContent = true) {

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
        switch (this.buffer.data[this.buffer.index++]) {

            case NEW_ELEMENT:
                let elementType;
                switch (this.buffer.data[this.buffer.index++]) {
                    case DIV: elementType = 'div'; break;
                    case SPAN: elementType = 'span'; break;
                    case BR: elementType = 'br'; break;
                    case MAIN: elementType = 'main'; break;
                    case NAV: elementType = 'nav'; break;
                    case H1: elementType = 'h1'; break;
                    case H2: elementType = 'h2'; break;
                    case H3: elementType = 'h3'; break;
                    case H4: elementType = 'h4'; break;
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
                    default: elementType = 'div'; break;
                }
                currentElement = document.createElement(elementType);
                renderedElements.push(currentElement);
                break;

            case CHILD_START:
                const children = Render.call(this);
                for (const child of children) {
                    currentElement.appendChild(child);
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
                currentElement.classList.add(...this.buffer.data[this.buffer.index++]);
                break;

            case ATTRIBUTES:
                const attributes = this.buffer.data[this.buffer.index++];
                for (const key of Object.keys(attributes)) {
                    currentElement.setAttribute(key, attributes[key])
                }

            case EVENT_LISTENER:
                const functionIndex = this.buffer.index.valueOf();
                const type = this.buffer.data[functionIndex];
                const event = this.buffer.data[functionIndex + 1];
                const subscribers = this.buffer.data[functionIndex + 2];

                currentElement.addEventListener(type, e => {
                    const result = event(e);
                    if (result && subscribers.length > 0) {
                        for (let i = 0; i < subscribers.length; ++i) {
                            subscribers[i](result);
                        }
                    }
                });

                this.buffer.index += 3;
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
                const popup = Render.call(this);
                preparePopupElement(popup, top, right, bottom, left);

                // append to container
                parent.appendChild(popup);
                break;

            case POPUP_END:
                return currentElement;
        }
    }

    console.log('rendered elements', renderedElements);

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < renderedElements.length; ++i) {
        fragment.appendChild(renderedElements[i]);
    }

    console.log('rendered fragment', fragment);


    if (displayHtmlAfterRender) {
        const container = document.getElementById(this.buffer.id || id);
        console.log('container', container);
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

Render.prototype = Object.create(HtmlMaker.prototype);

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
        this.buffer.data.push(CLASS, classNames);
    }
}

function input(...contents) {
    return this.Child(INPUT, contents);
}

function canvas(...contents) {
    return this.Child(CANVAS, contents);
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
    let modalContainer = document.getElementById('modal') || createAndGetModalContainer();
    modalContainer.innerHTML = '';
    new Render(content, 'modal');
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
        for (const c of contents) {
            c.call(this);
        }
    }
}

function Child(type, ...contents) {
    return function () {
        this.buffer.data.push(CHILD_START, NEW_ELEMENT, type);
        for (let i = 0; i < contents.length; ++i) {
            contents[i].call(this);
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
    return Child.call(this, P, ...contents);
}

function P(...contents) {
    return Parent.call(this, P, ...contents);
}

function a(...contents) {
    return Child.call(this, A, ...contents);
}

function div(...contents) {
    return Child.call(this, DIV, ...contents);
}

function span(...contents) {
    return Child.call(this, SPAN, ...contents);
}

function strong(...contents) {
    return Child.call(this, STRONG, ...contents);
}

function br(...contents) {
    return Child.call(this, BR, ...contents);
}

function h1(...contents) {
    return Child.call(this, H1, ...contents);
}

function H1(...contents) {
    return Parent.call(this, H1, ...contents);
}

function h2(...contents) {
    return Child.call(this, H2, ...contents);
}

function h3(...contents) {
    return Child.call(this, H3, ...contents);
}

function h4(...contents) {
    return Child.call(this, H4, ...contents);
}

function hr(...contents) {
    return Child.call(this, HR, ...contents);
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

function th(...contents) {
    return Child.call(this, TH, ...contents);
}

function Tbody(...contents) {
    return Parent.call(this, TBODY, ...contents);
}

function thead(...contents) {
    return Parent.call(this, THEAD, ...contents);
}

function tbody(...contents) {
    return Child.call(this, TBODY, ...contents);
}

function Table(...contents) {
    return Parent.call(this, TABLE, ...contents);
}

function select(...contents) {
    return Child.call(this, SELECT, ...contents);
}

function option(text, value, selected, ...contents) {
    return function () {
        const attributes = selected ? { value: value, selected: selected ? 'true' } : { value: value };
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
    modalContainer.addEventListener('click', () => hideModal());
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
    Render,
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
    canvas
}
