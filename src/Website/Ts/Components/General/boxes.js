import { Div, Render, t, cl, div, attr } from "../../Framework/renderer";
import { isaacImage } from "./isaac-image";

export function boxes(subs, id, resources, imagePath = '/img/isaac.png', upscale = true, limit = null) {

    new Render([
        Div(id(`box${id}`))
    ]);

    if (Array.isArray(resources)) {
        createBoxes(subs, id, resources, imagePath, upscale, limit);
    } else {
        resources.then(r => createBoxes(subs, id, r, imagePath, upscale, limit));
    }
}

function createBoxes(subs, id, resources, imagePath, upscale, limit) {
    if (!resources || resources.length === 0) {
        new Render([
            Div(
                t('No resources found.')
            )
        ]);
        return;
    }

    if (limit) {
        resources = resources.slice(0, limit);
    }

    new Render([
        Div(
            cl('box-container'),
            ...(resources.map((resource, index) => {

                const width = resource.w > 65 ? `width: ${resource.w * (upscale ? 2 : 1)}px;` : '';
                const padding = upscale ? ` padding: 0 20px 20px 20px` : '';
                const s = `${width}${padding}`;

                return div(
                    attr({ i: resource.id, style: s, class: 'box', id: `b${id}${index}` }),
                    event('click', e => boxClickEvent(e, ...subs)),

                    div(
                        t(resource.name)
                    ),
                    isaacImage(resource, null, upscale, imagePath)
                )
            }))
        )
    ], `box${id}`);
}

const boxClickEvent = (e, ...subs) => {
    const targetWithId = e.target.className === 'box' ? e.target : e.target.parentElement;
    const attributeValue = targetWithId.getAttribute('i');
    if (attributeValue) {
        for (const sub of subs) {
            sub(attributeValue);
        }
    }
}

