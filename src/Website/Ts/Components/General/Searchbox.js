import "../../Framework/Customizable/typedefs.js";

/**
 * Renders a searchable itemlist with the provided resources
 * @constructor
 * @param {any} caller - the THIS context of the subscriber
 * @param {function(string):*} sub - the callback function that will be notified after a selection was made
 * @param {number} searchboxId - the ID of the searchbox, if multiple searchboxes are rendered at the same time
 * @param {IsaacResource[]|Promise<IsaacResource[]>} resources - the resources that should be displayed
 * @param {boolean} displayType - adds a suffix to some resources (example: (Enemy) or (Bossfight)) so they can be distinguished from other resources
 * @param {string} containerId - the ID of the container the searchbox will be rendered into
 * @param {boolean=} replaceContent - replace container content? (default: true)
 */
function Searchbox(caller, sub, searchboxId, resources, displayType, containerId, replaceContent = true) {
    this.caller = caller;
    this.sub = sub;
    this.searchboxId = searchboxId;
    this.displayType = displayType;
    this.items = [];
    this.searchInput = null;
    this.listContainer = null;

    const host = document.getElementById(containerId);
    if (!host) {
        return;
    }

    const container = document.createElement('div');
    container.className = 'dd-container';
    container.addEventListener('mouseenter', () => this.tryFocusOnSearchbox());

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'dd-search';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'dd-searchbox';
    searchInput.placeholder = 'filter...';
    searchInput.addEventListener('input', e => this.filter(e));
    searchInput.addEventListener('keydown', e => this.keyboardEvent(e));
    this.searchInput = searchInput;

    searchWrapper.appendChild(searchInput);

    const listContainer = document.createElement('div');
    listContainer.id = `s${searchboxId.toString(10)}`;
    const loadingSpan = document.createElement('span');
    loadingSpan.textContent = 'loading resources...';
    listContainer.appendChild(loadingSpan);
    this.listContainer = listContainer;

    container.appendChild(searchWrapper);
    container.appendChild(listContainer);

    if (replaceContent) {
        host.replaceChildren(container);
    } else {
        host.appendChild(container);
    }

    // renders the searchbox content
    if (Array.isArray(resources)) {
        this.createSearchboxContent(resources);
    } else if (resources && typeof resources.then === 'function') {
        resources.then(resolved => this.createSearchboxContent(resolved));
    }

    // clears the searchbox when it appears
    setTimeout(() => {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
    }, 10);
}


Searchbox.prototype = {

    /**
     * renders the searchbox into a DocumentFragment with a single delegated click handler
     * @param {IsaacResource[]} resources
     */
    createSearchboxContent: function (resources) {
        const listContainer = this.listContainer || document.getElementById(`s${this.searchboxId.toString(10)}`);
        if (!listContainer || !listContainer.isConnected) {
            return;
        }

        if (!resources || resources.length === 0) {
            this.items = [];
            const emptyDiv = document.createElement('div');
            emptyDiv.textContent = 'No resources found';
            listContainer.replaceChildren(emptyDiv);
            this.tryFocusOnSearchbox();
            return;
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'dd-dropdown';
        dropdown.addEventListener('click', e => this.lineClickEvent(e));

        const fragment = document.createDocumentFragment();
        const count = resources.length;
        const items = new Array(count);
        const displayType = this.displayType;

        for (let i = 0; i < count; ++i) {
            const resource = resources[i];
            const name = resource.name || '';
            let displayName = name;

            if (displayType) {
                switch (resource.resource_type) {
                    case 11: displayName += ' (killed by)'; break;
                    case 7: displayName += ' (item source)'; break;
                    case 14: displayName += ' (character reroll)'; break;
                    case 1: displayName += ' (bossfight)'; break;
                }
            }

            const line = document.createElement('div');
            line.className = 'dd-line';
            line.title = name;
            line.setAttribute('di', resource.id);

            const textDiv = document.createElement('div');
            textDiv.className = 'dd-text';
            textDiv.textContent = displayName;

            const imgDiv = document.createElement('div');
            imgDiv.className = 'dd-image';
            const x = resource.x <= 0 ? '0px' : `-${resource.x}px`;
            const y = resource.y <= 0 ? '0px' : `-${resource.y}px`;
            const w = resource.w <= 0 ? '0px' : `${resource.w}px`;
            const h = resource.h <= 0 ? '0px' : `${resource.h}px`;
            imgDiv.style.backgroundPosition = `${x} ${y}`;
            imgDiv.style.width = w;
            imgDiv.style.height = h;

            line.appendChild(textDiv);
            line.appendChild(imgDiv);
            fragment.appendChild(line);

            items[i] = {
                el: line,
                id: resource.id,
                text: name.toLowerCase(),
                hidden: false
            };
        }

        this.items = items;
        dropdown.appendChild(fragment);
        listContainer.replaceChildren(dropdown);

        if (this.searchInput && this.searchInput.value) {
            this.applyFilter(this.searchInput.value.toLowerCase());
        }

        this.tryFocusOnSearchbox();
    },

    /**
     * selects the top visible element in the searchbox on Enter
     * @param {KeyboardEvent} e - the raw keydown event
     */
    keyboardEvent: function (e) {
        if (e.key === 'Enter') {
            const items = this.items;
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                if (!item.hidden) {
                    item.el.style.backgroundColor = 'rgba(255,255,255,0.3)';
                    item.el.style.border = '1px solid white';
                    setTimeout(() => {
                        this.selectId(item.id);
                    }, 100);
                    break;
                }
            }
        }
    },

    /**
     * focuses on this searchbox's input element
     */
    tryFocusOnSearchbox: function () {
        if (this.searchInput && this.searchInput.isConnected) {
            this.searchInput.focus();
        }
    },

    /**
     * notifies the subscriber of a selected resource ID
     * @param {string} id
     */
    selectId: function (id) {
        if (id && this.sub) {
            this.sub.call(this.caller, id);
        }
    },

    /**
     * processes delegated click events on the dropdown
     * @param {MouseEvent} e - the raw click event
     */
    lineClickEvent: function (e) {
        const line = e.target && e.target.closest ? e.target.closest('.dd-line') : null;
        if (line) {
            this.selectId(line.getAttribute('di'));
        }
    },

    /**
     * filters the cached item array in memory, only touching the DOM when visibility changes
     * @param {string} value - lowercased search query
     */
    applyFilter: function (value) {
        const items = this.items;
        const len = items.length;

        if (!value) {
            for (let i = 0; i < len; ++i) {
                const item = items[i];
                if (item.hidden) {
                    item.hidden = false;
                    item.el.classList.remove('display-none');
                }
            }
            return;
        }

        for (let i = 0; i < len; ++i) {
            const item = items[i];
            const shouldHide = item.text.indexOf(value) === -1;
            if (shouldHide !== item.hidden) {
                item.hidden = shouldHide;
                if (shouldHide) {
                    item.el.classList.add('display-none');
                } else {
                    item.el.classList.remove('display-none');
                }
            }
        }
    },

    /**
     * filters the searchbox
     * @param {Event} e - the raw input event
     */
    filter: function (e) {
        this.applyFilter(e.target.value.toLowerCase());
    }
};


export {
    Searchbox
};
