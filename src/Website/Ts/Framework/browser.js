const removeHashAndQuerystring = () => {
    history.replaceState(null, document.title, window.location.href.split("?")[0]);
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
}

const getHashFromUrl = () => window.location.hash.substr(1);

const getLastCharactersOfUrl = (numberOfCharacters) => {
    return window.location.href.substring(window.location.href.length - numberOfCharacters);
}

const setZIndex = (e, zIndex) => {
    if (e.target && e.target instanceof HTMLElement) {
        e.target.style.zIndex = zIndex ? zIndex.toString(10) : '';
    }
}

/**
 * removes the 'disabled' attribute from a button
 * @param {HTMLElement} button - the HTML Button Element
 */
const enableButton = (button) => {
    if (button.hasAttribute('disabled')) {
        button.removeAttribute('disabled');
    }
}

/**
 * adds the 'disabled'='true' attribute to a button
 * @param {HTMLElement} button - the HTML Button Element
 */
const disableButton = (button) => {
    if (!button.hasAttribute('disabled')) {
        button.setAttribute('disabled', 'true');
    }
}

const loadSciptIfNotExists = (src) => {
    return new Promise(resolve => {
        const scripts = document.head.getElementsByTagName('script');
        const found = false;
        for (const script of scripts) {
            if (script.src.toLowerCase() === src) {
                found = true;
            }
        }

        if (!found) {
            const script = document.createElement('script');
            document.head.appendChild(script);
            script.addEventListener('load', () => resolve());
            script.src = src;
        } else {
            resolve();
        }
    });
}

function getFormValue(e) {
    const target = e.target;
    if (!target || !(target instanceof HTMLFormElement)) {
        return null;
    }
    return new FormData(target);
}

const hide = (...elements) => {
    for (const e of elements) {
        removeClassIfExists(e, 'display-normal');
        addClassIfNotExists(e, 'display-none');
    }
}

const show = (...elements) => {
    for (const e of elements) {
        removeClassIfExists(e, 'display-none');
        addClassIfNotExists(e, 'display-normal');
    }
}

const addClassIfNotExists = (e, className) => {
    if (e && !e.classList.contains(className)) {
        e.classList.add(className);
    }
}

const removeClassIfExists = (e, className) => {
    if (e && e.classList.contains(className)) {
        e.classList.remove(className);
    }
}

function searchParentsForTag(eventOrElement, tagName) {
    if (!eventOrElement || eventOrElement instanceof HTMLBodyElement) {
        return undefined;
    }

    if (eventOrElement instanceof HTMLElement) {
        const element = eventOrElement;
        if (element.tagName === tagName.toUpperCase()) {
            return element;
        }
        const parent = element.parentElement;
        if (parent) {
            return searchParentsForTag(parent, tagName);
        }
    } else {
        const event = eventOrElement;
        const target = event.target;
        if (target) {
            if (target instanceof HTMLElement && target.tagName === tagName.toUpperCase()) {
                return target;
            } else if (target instanceof HTMLElement && target.parentElement) {
                return searchParentsForTag(target.parentElement, tagName);
            }
        }
    }

    return undefined;
}

function getFromLocalStorage(key) {
    const result = localStorage.getItem(key);

    if (!result) {
        return null;
    }

    return JSON.parse(result);
}

function localStorageHasKey(key) {
    const result = localStorage.getItem(key);
    if (result === null) {
        return false;
    }
    return true;
}

const saveToLocalStorage = (key, value) => {
    if (value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export {
    removeHashAndQuerystring,
    getHashFromUrl,
    getLastCharactersOfUrl,
    setZIndex,
    addClassIfNotExists,
    removeClassIfExists,
    getFormValue,
    searchParentsForTag,
    hide,
    show,
    getFromLocalStorage,
    saveToLocalStorage,
    loadSciptIfNotExists,
    localStorageHasKey,
    disableButton,
    enableButton
}

