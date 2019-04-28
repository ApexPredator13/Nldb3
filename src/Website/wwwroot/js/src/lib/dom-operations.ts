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
            console.log('content was undefined!');
        }
    });
}

export {
    swapClass,
    fillTableCells
}