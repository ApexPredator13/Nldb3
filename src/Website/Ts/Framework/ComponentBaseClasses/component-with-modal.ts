import { Component, render } from "../renderer";
import { addClassIfNotExists, removeClassIfExists } from "../browser";

const addDisplayNoneOnClick = (e: Event) => {
    console.log('addDisplayNoneOnClick', e);
    const target = e.target;
    if (target && target instanceof HTMLDivElement && target.id === 'modal') {
        addClassIfNotExists(target, 'display-none');
        removeClassIfExists(target, 'display-nomral');
        target.innerHTML = '';
    }
}

export class ComponentWithModal {

    ShowModal(component: Component, closeModalOnClickOutside: boolean = true) {
        // modal might still be open
        this.DismissModal();

        const modal = document.getElementById('modal');
        if (!modal) {
            return;
        }

        // remove potential leftover click event
        modal.removeEventListener('click', addDisplayNoneOnClick);
        if (closeModalOnClickOutside) {
            modal.addEventListener('click', addDisplayNoneOnClick)
        }

        const html = render(component);
        if (!html) {
            return;
        }

        modal.appendChild(html);
        removeClassIfExists(modal, 'display-none');
        addClassIfNotExists(modal, 'display-normal');
    }

    DismissModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            addClassIfNotExists(modal, 'display-none');
            removeClassIfExists(modal, 'display-normal');
            modal.innerHTML = '';
        }
    }
}

