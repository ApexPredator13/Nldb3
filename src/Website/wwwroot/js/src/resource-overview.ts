import { Boxes } from './components/boxes';
import { IsaacResource } from './interfaces/isaac-resource';

(() => {
    document.addEventListener("DOMContentLoaded", () => {

        // create map and 'Other' entry to make sure it's always at the top
        const resourceSets = new Map<string, Array<IsaacResource>>();
        resourceSets.set('Other', new Array<IsaacResource>());

        // get resource type from URL, set it to 'item' by default
        const splitUrl = window.location.href.split('/');
        const resourceId = splitUrl[splitUrl.length - 1];
        const startsWithLetterRegex = /[a-z]/i;
        let resourceType;
        
        switch (resourceId.toLowerCase()) {
            case 'bosses': resourceType = 1; break;
            case 'characters': resourceType = 2; break;
            case 'itemsources': resourceType = 7; break;
            case 'floors': resourceType = 5; break;
            case 'transformations': resourceType = 12; break;
            case 'characterrerolls': resourceType = 14; break;
            case 'curses': resourceType = 3; break;
            case 'pills': resourceType = 8; break;
            case 'runes': resourceType = 9; break;
            case 'tarotcards': resourceType = 10; break;
            case 'trinkets': resourceType = 13; break;
            case 'otherconsumables': resourceType = 15; break;
            default: resourceType = 6; break;
        }

        // get resources, ordered by name
        fetch(`/api/resources/?ResourceType=${resourceType}&OrderBy1=Name`)
            .then(response => response.json())
            .then((resources: Array<IsaacResource>) => {
                const wrapperElementId = 'resources';
                const wrapper = document.getElementById(wrapperElementId);

                if (!wrapper || !(wrapper instanceof HTMLDivElement)) {
                    throw `expected to find wrapper with ID ${wrapperElementId}`;
                }

                if (!resources || resources.length === 0) {
                    wrapper.innerText = 'no data was returned';
                    return;
                }
                

                // sort resources by alphabet and 'other'
                for (const resource of resources) {
                    let key = startsWithLetterRegex.test(resource.name[0]) ? resource.name[0].toUpperCase() : 'Other';
                    const resources = resourceSets.get(key);
                    if (resources) {
                        resources.push(resource);
                    } else {
                        resourceSets.set(key, new Array<IsaacResource>(resource));
                    }
                }

                // remove 'other' if it's empty
                const other = resourceSets.get('Other');
                if (other && other.length === 0) {
                    resourceSets.delete('Other');
                }

                wrapper.innerText = '';

                // create a box-set for each set
                for (const [key, resources] of resourceSets) {
                    const boxWrapper = document.createElement('div');

                    const header = document.createElement('h4');
                    header.innerText = key;

                    boxWrapper.appendChild(header);

                    const boxes = new Boxes(boxWrapper, resources, false);
                    boxes.elementWasSelected.subscribe(clickedElement => {
                        window.location.assign(`/${clickedElement}`);
                    });

                    const hr = document.createElement('hr');
                    boxWrapper.appendChild(hr);
                    wrapper.appendChild(boxWrapper);
                }
        });
    });
})();

