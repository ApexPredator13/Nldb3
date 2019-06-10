import { IsaacResource } from './interfaces/isaac-resource';
import { fillTableCells } from './lib/dom-operations';
import { convertGameModeToString, convertExistsInToString } from './lib/enum-converters';

declare const admin_mode: boolean;

(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const selector = <HTMLSelectElement>document.getElementById('resource-selector');
        const displayer = <HTMLTableSectionElement>document.getElementById('resource-displayer');

        if (!selector || !displayer) {
            return;
        }

        selector.addEventListener("change", () => {
            const newValue = selector.value

            if (!newValue) {
                return;
            }

            // create new table body
            const tableBody = document.createElement('tbody');

            fetch(`/api/resources?ResourceType=${newValue}&IncludeMod=true&IncludeTags=true&OrderBy1=1&Asc=true`).then(response => response.json()).then((response: Array<IsaacResource>) => {
                response.map(r => {
                    // fill it with table rows
                    const tr = document.createElement('tr');

                    // create admin edit link if admin flag is set
                    let adminLink: HTMLAnchorElement | undefined = undefined;
                    if (admin_mode) {
                        adminLink = document.createElement('a');
                        adminLink.innerText = 'Edit';
                        adminLink.href = `/Admin/Isaac/Details/${r.id}`;
                    }

                    fillTableCells(
                        tr,
                        r.name,
                        r.id,
                        convertGameModeToString(r.game_mode),
                        convertExistsInToString(r.exists_in),
                        `x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h}`,
                        r.color,
                        r.mod ? r.mod.name : null,
                        r.display_order ? r.display_order : null,
                        r.difficulty ? r.difficulty : null,
                        r.level,
                        adminLink
                    );
                    tableBody.appendChild(tr);
                });
            }).then(() => {
                // clear old table and append new
                if (displayer.lastElementChild && displayer.lastElementChild.tagName === 'TBODY') {
                    displayer.removeChild(displayer.lastElementChild);
                }
                displayer.appendChild(tableBody);
            }).catch(e => console.error(e));
        })
    });
})();


