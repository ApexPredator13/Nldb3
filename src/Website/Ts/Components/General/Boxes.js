import { Div, Render, t, cl, div, attr, id, event } from "../../Framework/renderer";
import { isaacImage } from "./isaac-image";
import "../../framework/customizable/typedefs"

/**
 * renders a bunch of clickable boxes from IsaacResource[], HistoryImage[] or GameplayEvent[]
 * @constructor
 * @param {any} caller - the THIS context of the subscriber
 * @param {string} containerId - the container into which the boxes will be rendered into
 * @param {function(string):*} sub - subscribers that will be notified when a box was clicked
 * @param {IsaacResource[]|HistoryImage[]|GameplayEvent[]|Promise<IsaacResource[]>|Promise<HistoryImage[]>|Promise<GameplayEvent[]>} resources - the resources that should be displayed
 * @param {string=} [imagePath] - custom image path can be provided here
 * @param {boolean=} [upscale] - upscales the image
 * @param {number=} [limit] - limits the resources to the provided amount
 * @param {replaceContent=} [replaceContent] - if true, replaces content in the container
 * @param {number} id - the ID of the boxes, if more than one set is displayed at once
 */
function Boxes(caller, containerId, sub, resources, id = 1, upscale = true, imagePath = '/img/isaac.png', limit = null, replaceContent = true) {

    this.caller = caller;
    this.sub = sub;
    this.containerId = containerId;
    this.imagePath = imagePath;
    this.upscale = upscale;
    this.limit = limit;
    this.id = id;
    this.replaceContent = replaceContent;

    if (Array.isArray(resources)) {
        this.createBoxes(resources);
    } else {
        resources.then(r => this.createBoxes(r));
    }
}



Boxes.prototype = {

    /**
     * renders all isaac resources
     * @param {IsaacResource[]|HistoryImage[]|GameplayEvent[]} resources
     */
    createBoxes: function (resources) {
        if (!resources || resources.length === 0) {
            new Render([
                Div(
                    t('No resources found.')
                )
            ], this.containerId, true, false);
            return;
        }

        if (this.limit) {
            resources = resources.slice(0, this.limit);
        }

        new Render([
            Div(
                cl('box-container'),
                id(`box${this.id}`),
                ...resources.map((resource, index) => {

                    const width = resource.w > 65 ? `width: ${resource.w * (this.upscale ? 2 : 1)}px;` : '';
                    const padding = this.upscale ? ` padding: 0 20px 20px 20px` : '';
                    const s = `${width}${padding}`;

                    return div(
                        attr({ i: resource.id, style: s, class: 'box', id: `b${this.id}${index}` }),
                        event('click', e => this.boxClickEvent(e)),

                        div(
                            t(resource.name)
                        ),
                        isaacImage(resource, null, this.upscale, this.imagePath)
                    )
                })
            )
        ], this.containerId, true, this.replaceContent);
    },


    /**
     * notifies all subscribers about what box was clicked
     * @param {Event} e - the raw click event
     */
    boxClickEvent: function (e) {
        const targetWithId = e.target.className === 'box' ? e.target : e.target.parentElement;
        const attributeValue = targetWithId.getAttribute('i');
        if (this.sub) {
            this.sub.call(this.caller, attributeValue);
        }
    }
}



export {
    Boxes
}