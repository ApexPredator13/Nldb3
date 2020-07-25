import { Html, Div, cl, div, input, attr, event, span, t, style, id } from "../../Framework/renderer";
import { removeClassIfExists, addClassIfNotExists } from "../../Framework/browser";
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

    // renders the initial HTML
    new Html([
        Div(
            event('mouseover', this.focusOnMouseover),
            cl('dd-container'),

            div(
                cl('dd-search'),
                input(
                    attr({ type: 'text', class: 'dd-searchbox', placeholder: 'filter...' }),
                    event('input', this.filter)
                )
            ),
            div(
                id(`s${searchboxId.toString(10)}`),
                span(
                    t('loading resources...')
                )
            )
        )
    ], containerId, true, replaceContent);

    // renders the searchbox content
    if (Array.isArray(resources)) {
        this.createSearchboxContent(resources);
    } else {
        resources.then(resources => this.createSearchboxContent(resources));
    }
}



Searchbox.prototype = {

    /**
     * renders the searchbox
     * @param {IsaacResource[]} resources
     */
    createSearchboxContent: function (resources) {
        if (!resources || resources.length === 0) {
            new Html([
                Div(
                    t('No resources found')
                )
            ], `s${this.searchboxId.toString(10)}`, true, true);
        } else {
            new Html([
                Div(
                    cl('dd-dropdown'),
                    ...resources.map(resource => {

                        const x = resource.x <= 0 ? '0px' : `-${resource.x.toString(10)}px`;
                        const y = resource.y <= 0 ? '0px' : `-${resource.y.toString(10)}px`;
                        const w = resource.w <= 0 ? '0px' : `${resource.w.toString(10)}px`;
                        const h = resource.h <= 0 ? '0px' : `${resource.h.toString(10)}px`;
                        const s = `background: url('/img/isaac.png') ${x} ${y} transparent; width: ${w}; height: ${h}`;

                        let displayName = resource.name;

                        if (this.displayType) {
                            switch (resource.resource_type) {
                                case 11: displayName += ' (killed by)'; break;
                                case 7: displayName += ' (item source)'; break;
                                case 14: displayName += ' (character reroll)'; break;
                                case 1: displayName += ' (bossfight)'; break;
                            }
                        }

                        return div(
                            attr({ class: 'dd-line', title: resource.name, di: resource.id, dl: resource.name.toLowerCase() }),
                            event('click', e => this.lineClickEvent(e)),
                            div(
                                t(displayName),
                                cl('dd-text')
                            ),
                            div(
                                cl('dd-image'),
                                style(s)
                            )
                        );
                    })
                )
            ], `s${this.searchboxId.toString(10)}`, true, true);
        }

        this.tryFocusOnSearchbox();
    },


    /**
     * focuses on the input element when the user hovers over the searchbox
     * @param {Event} e - the raw hover event
     */
    focusOnMouseover: function(e) {
        e.stopPropagation();
        const searchBoxes = e.target.getElementsByClassName('dd-searchbox');
        if (searchBoxes && searchBoxes.length > 0) {
            const firstSearchBox = searchBoxes[0];
            firstSearchBox.focus();
        }
    },

    /**
     * focuses on the first searchbox input element on the page
     */
    tryFocusOnSearchbox: function() {
        const searchboxes = document.getElementsByClassName('dd-searchbox');
        if (searchboxes && searchboxes.length > 0 && searchboxes[0].focus) {
            searchboxes[0].focus();
        }
    },


    /**
     * processes the click event after the user selected something and notifies the subscriber
     * @param {Event} e - the raw click event
     */
    lineClickEvent: function (e) {
        const target = e.target;
        let id = null;

        if (target.className === 'dd-line') {
            id = target.getAttribute('di');
        } else if ((target.className === 'dd-text' || target.className === 'dd-image')) {
            id = target.parentElement.getAttribute('di');
        }

        if (id) {
            this.sub.call(this.caller, id);
        }
    },


    /**
     * filters the searchbox
     * @param {Event} e - the raw input event
     */
    filter: function(e) {
        const value = e.target.value.toLowerCase();
        const parent = e.target.parentElement;
        const linesContainer = parent.nextElementSibling;
        const lines = linesContainer.getElementsByClassName('dd-line');

        if (!value) {
            for (let i = 0; i < lines.length; ++i) {
                removeClassIfExists(lines[i], 'display-none');
            }
        } else {
            for (let i = 0; i < lines.length; ++i) {
                const text = lines[i].getAttribute('dl');
                if (text && text.indexOf(value) === -1) {
                    addClassIfNotExists(lines[i], 'display-none');
                } else {
                    removeClassIfExists(lines[i], 'display-none');
                }
            }
        }
    }
};



export {
    Searchbox
}

