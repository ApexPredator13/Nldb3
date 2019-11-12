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

const addClassIfNotExists = (e: HTMLElement, className: string) => {
    if (!e.classList.contains(className)) {
        e.classList.add(className);
    }
}

const removeClassIfExists = (e: HTMLElement, className: string) => {
    if (e.classList.contains(className)) {
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

export {
    removeHashAndQuerystring,
    getHashFromUrl,
    getLastCharactersOfUrl,
    setZIndex,
    addClassIfNotExists,
    removeClassIfExists,
    getFormValue,
    searchParentsForTag
}

