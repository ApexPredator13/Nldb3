import { Frontpage } from "./interfaces/frontpage";
import { FrontpageTopUser } from "./interfaces/frontpage-top-user";

const setNavigation = (elementId: string, url: string) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener('click', () => window.location.assign(url));
    }
}

const display = (elementId: string, n: number | string, digits?: number) => {
    const element = document.getElementById(elementId);
    if (element) {
        if (typeof n === 'number') {
            if (digits) {
                element.innerText = n.toFixed(digits).toString();
            } else {
                element.innerText = n.toString();
            }
        } else {
            element.innerText = n;
        }
    }
}

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        setNavigation('episodes', '/Videos');
        setNavigation('items', '/Items');
        setNavigation('quotes', '/Quotes');
        setNavigation('sources', '/ItemSources');
        setNavigation('bosses', '/Bosses');
        setNavigation('characters', '/Characters');
        setNavigation('floors', '/Floors');
        setNavigation('rng', '/RandomEpisodeGenerator');
        setNavigation('transformations', '/Transformations');

        fetch('/api/frontpage').then(response => response.json()).then((x: Frontpage) => {
            display('number-of-videos', x.video_count);
            display('num-items', x.items_collected);
            display('num-bosses', x.bosses_fought);
            display('num-floors', x.floors_visited);
            display('days', x.total_playtime_days);
            display('hours', x.total_playtime_hours);
            display('minutes', x.total_playtime_minutes);
            display('seconds', x.total_playtime_seconds);
            display('num-chars', x.characters_played);
            display('num-deaths', x.characters_killed);
            display('avg-items', x.average_items_total, 2);
            display('avg-bosses', x.average_bossfights, 2);
            display('avg-shop', x.average_items_shop, 2);
            display('avg-floors', x.average_floors_visited, 2);
            display('avg-deaths', x.average_deaths, 2);
            display('avg-chest', x.average_chest_items, 2);
            display('avg-transformations', x.average_transformations, 2);
            display('avg-win', x.average_win_percentage, 2);
        });

        fetch('/api/frontpage/top-users').then(response => response.json()).then((result: Array<FrontpageTopUser>) => {
            if (result.length < 4) {
                return;
            }

            display('number-one', result[0].name);
            display('number-one-amount', result[0].contributions);
            display('number-two', result[1].name);
            display('number-two-amount', result[1].contributions);
            display('number-three', result[2].name);
            display('number-three-amount', result[2].contributions);

            const majorContributorsParagraph = document.getElementById('major-contributors');
            if (majorContributorsParagraph) {
                for (let i = 3; i < result.length; i++) {
                    const text = i == result.length - 1 ? result[i].name : `${result[i].name}, `;
                    const span = document.createElement('span');
                    span.innerText = text;
                    majorContributorsParagraph.appendChild(span);
                }
            }
        });
    });
})();


