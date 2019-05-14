const swapClass = (e: Element, from: string, to: string): void => {
    if (e.classList.contains(from)) {
        e.classList.remove(from);
    }
    if (!e.classList.contains(to)) {
        e.classList.add(to);
    }
}

const fillTableCells = (tr: HTMLTableRowElement, ...contents: Array<string | number | Element | null | undefined>): void => {
    if (contents.length === 0) {
        return;
    }

    contents.map(content => {
        if (content !== undefined) {
            let td = document.createElement('td');
            if (content) {
                if (content instanceof HTMLElement) {
                    td.appendChild(content);
                } else if (typeof (content) === 'string') {
                    td.innerText = content;
                } else if (typeof (content) === 'number') {
                    td.innerText = content.toString(10);
                }
            }
            tr.appendChild(td);
        } else {
            console.log('content was undefined! tr so far: ', tr);
        }
    });
}

const loadDivElementByClass = (className: string, div: HTMLElement | null | undefined): HTMLDivElement => {
    const result = div ? div.getElementsByClassName(className) : document.getElementsByClassName(className);
    if (result.length > 0) {
        return <HTMLDivElement>result[0];
    } else {
        throw `no element with class '${className}' was found`;
    }
}

const loadDivElementsByClass = (className: string, div: HTMLElement | null | undefined): HTMLCollectionOf<HTMLDivElement> => {
    return div
        ? <HTMLCollectionOf<HTMLDivElement>>div.getElementsByClassName(className)
        : <HTMLCollectionOf<HTMLDivElement>>document.getElementsByClassName(className);
}

const loadDivElementById = (idName: string, div: HTMLElement | null | undefined): HTMLDivElement => {
    const result = div ? div.querySelector(`#${idName}`) : document.getElementById(idName);
    if (result) {
        return <HTMLDivElement>result;
    } else {
        throw `no element with class '${idName}' was found`;
    }
}

const loadElementsByTagName = (tagName: string, div: HTMLDivElement | null | undefined): HTMLCollectionOf<Element> => {
    return div ? div.getElementsByTagName(tagName) : document.getElementsByTagName(tagName);
}

const removeClassIfExists = (e: Element, className: string) => {
    if (e.classList.contains(className)) {
        e.classList.remove(className);
    }
}

const addClassIfNotExists = (e: Element, className: string) => {
    if (!e.classList.contains(className)) {
        e.classList.add(className);
    }
}

export {
    swapClass,
    fillTableCells,
    loadDivElementByClass,
    loadDivElementById,
    loadDivElementsByClass,
    removeClassIfExists,
    addClassIfNotExists,
    loadElementsByTagName
}

