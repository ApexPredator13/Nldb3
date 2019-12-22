import { Render, Div, cl, div, input, attr, event, span, t, style } from "../../Framework/renderer";
import { removeClassIfExists, addClassIfNotExists } from "../../Framework/browser";

export function renderSearchbox(subs, searchboxId, resources, displayType) {
    new Render([
        Div(
            event('mouseover', e => focusOnMouseover(e)),
            cl('dd-container'),

            div(
                cl('dd-search'),
                input(
                    attr({ type: 'text', class: 'dd-searchbox', placeholder: 'filter...' }),
                    event('input', e => filter(e))
                )
            ),
            div(
                id(`s${searchboxId.toString(10)}`),
                span(
                    t('loading resources...')
                )
            )
        )
    ]);

    if (Array.isArray(resources)) {
        createLines(resources, displayType, searchboxId, subs);
    } else {
        resources.then(r => createLines(r, displayType, searchboxId, subs));
    }
}

function createLines(resources, displayType, id, subs) {
    if (!resources || resources.length === 0) {
        new Render([
            Div(
                t('No resources found')
            )
        ]);
    } else {
        new Render([
            Div(
                cl('dd-dropdown'),
                ...(resources.map(resource => {

                    const x = resource.x <= 0 ? '0px' : `-${resource.x.toString(10)}px`;
                    const y = resource.y <= 0 ? '0px' : `-${resource.y.toString(10)}px`;
                    const w = resource.w <= 0 ? '0px' : `${resource.w.toString(10)}px`;
                    const h = resource.h <= 0 ? '0px' : `${resource.h.toString(10)}px`;
                    const s = `background: url('/img/isaac.png') ${x} ${y} transparent; width: ${w}; height: ${h}`;

                    let displayName = resource.name;

                    if (displayType) {
                        switch (resource.resource_type) {
                            case 11: displayName += ' (killed by)'; break;
                            case 7: displayName += ' (item source)'; break;
                            case 14: displayName += ' (character reroll)'; break;
                            case 1: displayName += ' (bossfight)'; break;
                        }
                    }

                    return div(
                        attr({ class: 'dd-line', title: resource.name, di: resource.id, dl: resource.id.toLowerCase() }),
                        event('click', e => lineClickEvent(e, subs))

                        div(
                            t(displayName),
                            cl('dd-text')
                        ),
                        div(
                            cl('dd-image'),
                            style(s)
                        )
                    )
                }))
            )
        ], `s${id.toString(10)}`);
    }
}

function filter(e) {
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

function lineClickEvent(e, subs) {
    const target = e.target;
    let id = null;

    if (target.className === 'dd-line') {
        id = target.getAttribute('data-id');
    } else if ((target.className === 'dd-text' || target.className === 'dd-image')) {
        id = target.parentElement.getAttribute('di');
    }

    if (id) {
        for (const sub of subs) {
            sub(id);
        }
    }
}

function focusOnMouseover(e) {
    e.stopPropagation();
    const searchBoxes = e.target.getElementsByClassName('dd-searchbox');
    if (searchBoxes && searchBoxes.length > 0) {
        const firstSearchBox = searchBoxes[0];
        firstSearchBox.focus();
    }
}

