const removeHashAndQuerystring = () => {
    history.replaceState(null, document.title, window.location.href.split("?")[0]);
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
}

const getHashFromUrl = () => window.location.hash.substr(1);

const getLastCharactersOfUrl = (numberOfCharacters: number) => {
    return window.location.href.substring(window.location.href.length - numberOfCharacters);
}

const setZIndex = (e: Event, zIndex: number | null) => {
    if (e.target && e.target instanceof HTMLElement) {
        e.target.style.zIndex = zIndex ? zIndex.toString(10) : null;
    }
}

function getFormValue(e: Event): FormData | null {
    const target = e.target;
    if (!target || !(target instanceof HTMLFormElement)) {
        return null;
    }
    return new FormData(target);
}

const hide = (...elements: Array<HTMLElement | null>) => {
    for (const e of elements) {
        removeClassIfExists(e, 'display-normal');
        addClassIfNotExists(e, 'display-none');
    }
}

const show = (...elements: Array<HTMLElement | null>) => {
    for (const e of elements) {
        removeClassIfExists(e, 'display-none');
        addClassIfNotExists(e, 'display-normal');
    }
}

const addClassIfNotExists = (e: HTMLElement | null, className: string) => {
    if (e &&!e.classList.contains(className)) {
        e.classList.add(className);
    }
}

const removeClassIfExists = (e: HTMLElement | null, className: string) => {
    if (e &&e.classList.contains(className)) {
        e.classList.remove(className);
    }
}

function searchParentsForTag<T extends HTMLElement>(eventOrElement: HTMLElement | Event, tagName: keyof ElementTagNameMap): T | undefined {
    if (!eventOrElement || eventOrElement instanceof HTMLBodyElement) {
        return undefined;
    }

    if (eventOrElement instanceof HTMLElement) {
        const element = eventOrElement;
        if (element.tagName === tagName.toUpperCase()) {
            return element as T;
        }
        const parent = element.parentElement;
        if (parent) {
            return searchParentsForTag<T>(parent, tagName);
        }
    } else {
        const event = eventOrElement;
        const target = event.target;
        if (target) {
            if (target instanceof HTMLElement && target.tagName === tagName.toUpperCase()) {
                return target as T;
            } else if (target instanceof HTMLElement && target.parentElement) {
                return searchParentsForTag<T>(target.parentElement, tagName);
            }
        }
    }

    return undefined;
}

function getFromLocalStorage<T>(key: string): T | null {
    const result = localStorage.getItem(key);

    if (!result) {
        return null;
    }

    return JSON.parse(result) as T;
}

const saveToLocalStorage = (key: string, value: any) => {
    if (value) {
        const stringified = JSON.stringify(value);
        console.log('saving to local storage:', key, stringified);
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
    saveToLocalStorage
}

