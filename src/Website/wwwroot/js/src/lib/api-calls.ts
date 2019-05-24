import { GetResourceRequest } from "../interfaces/get-resource-request";
import { IsaacResource } from "../interfaces/isaac-resource";

const getIsaacResources = async (request: GetResourceRequest): Promise<Array<IsaacResource> | null> => {
    let url = `/api/resources/?ResourceType=${request.ResourceType}`;
    url += request.Asc !== undefined ? `&Asc=${request.Asc ? 'true' : 'false'}` : '';
    url += request.IncludeMod !== undefined ? `&IncludeMod=${request.IncludeMod}` : '';
    url += request.OrderBy1 !== undefined ? `&OrderBy1=${request.OrderBy1}` : '';
    url += request.OrderBy2 !== undefined ? `&OrderBy2=${request.OrderBy2}` : '';
    url += request.RequiredTags !== undefined ? request.RequiredTags.map(tag => `&RequiredTags=${tag.toString()}`).join('') : '';

    try {
        const response = await fetch(url);
        return response.ok ? <Promise<Array<IsaacResource>>>response.json() : null;
    } catch {
        return null;
    }
}

const getEffectNumber = async (...names: Array<string>): Promise<Array<number>> => {
    try {
        const response = await fetch('/api/resources/effect' + names.map((name, index) => {
            return index === 0 ? `?name=${name}` : `&name=${name}`
        }));
        const result = await response.json();
        return <Array<number>>result;
    } catch {
        return new Array<number>();
    }
}

export {
    getIsaacResources,
    getEffectNumber
}
