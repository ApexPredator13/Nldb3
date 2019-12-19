import { div, style, cl } from "../../Framework/renderer";

export function isaacImage(resource, resourceToUse, upscale = true, pathToImage = '/img/isaac.png') {
    let r = resource.r1 ? resource[`r${resourceToUse}`] : resource;

    const x = r.x > 0 ? `-${r.x.toString(10)}px` : `${r.x.toString(10)}px`;
    const y = r.y > 0 ? `-${r.y.toString(10)}px` : `${r.y.toString(10)}px`;
    const w = r.w.toString(10);
    const h = r.h.toString(10);
    const p = upscale ? ` margin: ${(Math.floor(r.h / 2) + 2).toString(10)}px ${(Math.floor(r.w / 2) + 2).toString(10)}px` : '';
    const s = `background: url('${pathToImage}') ${x} ${y} transparent; width: ${w}px; height: ${h}px;${p}`;

    const classes = upscale ? ['iri', 'upscale']  : ['iri']

    return div(
        style(s),
        cl(...classes)
    );
}

