const elementClosest = () => {
    console.log('applying patch');
    if (!Element.prototype.matches) {
        Element.prototype.matches = (Element.prototype as any).msMatchesSelector ||
            Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s: any) {
            var el = this;

            do {
                if (el.matches(s)) return el;
                el = el.parentElement || <HTMLElement>el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
}


export {
    elementClosest
}


