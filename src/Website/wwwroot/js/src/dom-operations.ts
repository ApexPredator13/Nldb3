const swapClass = (e: Element, from: string, to: string) => {
    if (e.classList.contains(from)) {
        e.classList.remove(from);
    }
    if (!e.classList.contains(to)) {
        e.classList.add(to);
    }
}

export {
    swapClass
}