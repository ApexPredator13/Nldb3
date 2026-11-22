import "../../Framework/Customizable/typedefs";

/**
 * renders a bunch of clickable boxes from IsaacResource[], HistoryImage[] or GameplayEvent[]
 * @constructor
 * @param {any} caller - the THIS context of the subscriber
 * @param {string} containerId - the container into which the boxes will be rendered into
 * @param {function(string):*} sub - subscribers that will be notified when a box was clicked
 * @param {IsaacResource[]|HistoryImage[]|GameplayEvent[]|Promise<IsaacResource[]>|Promise<HistoryImage[]>|Promise<GameplayEvent[]>} resources - the resources that should be displayed
 * @param {number=} id - the ID of the boxes, if more than one set is displayed at once
 * @param {boolean=} [upscale] - upscales the image
 * @param {string=} [imagePath] - custom image path can be provided here
 * @param {number=} [limit] - limits the resources to the provided amount
 * @param {boolean=} [replaceContent] - if true, replaces content in the container
 */
function Boxes(caller, containerId, sub, resources, id = 1, upscale = true, imagePath = '/img/isaac.png', limit = null, replaceContent = true) {
    this.caller = caller;
    this.sub = sub;
    this.containerId = containerId;
    this.imagePath = imagePath || '/img/isaac.png';
    this.upscale = upscale;
    this.limit = limit;
    this.id = id;
    this.replaceContent = replaceContent;

    if (Array.isArray(resources)) {
        this.createBoxes(resources);
    } else if (resources && typeof resources.then === 'function') {
        resources.then(r => this.createBoxes(r));
    }
}


Boxes.prototype = {

    /**
     * renders all isaac resources directly into a DocumentFragment with delegated click/keydown handlers
     * @param {IsaacResource[]|HistoryImage[]|GameplayEvent[]} resources
     */
    createBoxes: function (resources) {
        const host = document.getElementById(this.containerId);
        if (!host) {
            return;
        }

        if (!resources || resources.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.textContent = 'No resources found.';
            host.appendChild(emptyDiv);
            return;
        }

        const count = this.limit ? Math.min(this.limit, resources.length) : resources.length;

        const boxContainer = document.createElement('div');
        boxContainer.className = 'box-container';
        boxContainer.id = `box${this.id}`;
        boxContainer.addEventListener('click', e => this.boxClickEvent(e));
        boxContainer.addEventListener('keydown', e => this.boxKeydownEvent(e));

        const fragment = document.createDocumentFragment();
        const upscale = this.upscale;
        const boxPrefix = `b${this.id}`;
        const imgClass = upscale ? 'iri upscale' : 'iri';
        const backgroundUrl = `url('${this.imagePath}')`;


        for (let i = 0; i < count; ++i) {
            const resource = resources[i];

            const box = document.createElement('div');
            box.className = 'box';
            box.id = `${boxPrefix}${i}`;
            box.tabIndex = 0;
            box.setAttribute('i', resource.id);

            if (resource.w > 65) {
                box.style.width = `${resource.w * (upscale ? 2 : 1)}px`;
            }
            if (upscale) {
                box.style.padding = '0 20px 20px 20px';
            }

            const label = document.createElement('div');
            label.textContent = resource.name || '';

            const imgDiv = document.createElement('div');
            imgDiv.className = imgClass;
            const x = resource.x > 0 ? `-${resource.x}px` : `${resource.x}px`;
            const y = resource.y > 0 ? `-${resource.y}px` : `${resource.y}px`;
            imgDiv.style.backgroundImage = backgroundUrl;
            imgDiv.style.backgroundPosition = `${x} ${y}`;
            imgDiv.style.backgroundColor = 'transparent';
            imgDiv.style.width = `${resource.w}px`;
            imgDiv.style.height = `${resource.h}px`;
            if (upscale) {
                imgDiv.style.margin = `${Math.floor(resource.h / 2) + 2}px ${Math.floor(resource.w / 2) + 2}px`;
            }

            box.appendChild(label);
            box.appendChild(imgDiv);
            fragment.appendChild(box);
        }

        boxContainer.appendChild(fragment);

        if (this.replaceContent) {
            host.replaceChildren(boxContainer);
        } else {
            host.appendChild(boxContainer);
        }
    },

    /**
     * notifies subscribers about what box was clicked via event delegation
     * @param {MouseEvent} e - the raw click event
     */
    boxClickEvent: function (e) {
        const box = e.target && e.target.closest ? e.target.closest('.box') : null;
        if (!box) {
            return;
        }

        const attributeValue = box.getAttribute('i');
        if (this.sub) {
            this.sub.call(this.caller, attributeValue);
        }
    },

    /**
     * activates the focused box when pressing ENTER
     * @param {KeyboardEvent} e - the raw keydown event
     */
    boxKeydownEvent: function (e) {
        if (e.key === 'Enter') {
            const box = e.target && e.target.closest ? e.target.closest('.box') : null;
            if (!box) {
                return;
            }

            box.style.border = '3px solid white';
            setTimeout(() => {
                box.click();
            }, 100);
        }
    }
};


export {
    Boxes
};
