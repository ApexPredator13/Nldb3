var swapClass = function (e, from, to) {
    if (e.classList.contains(from)) {
        e.classList.remove(from);
    }
    if (!e.classList.contains(to)) {
        e.classList.add(to);
    }
};
export { swapClass };
