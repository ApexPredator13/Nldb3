import { VideoRequest } from './interfaces/video-request';
import { CreateGetVideosUri } from './lib/uri-creator';
import { fillTableCells } from './lib/dom-operations';
import { VideoResult } from './interfaces/video-result';

const createDefaultVideoRequest = (): VideoRequest => {
    return {
        Asc: false,
        OrderBy: 2,
        Search: null,
        Page: 1,
        Amount: 50,
        From: null,
        Until: null
    }
}

let searchTimeOut: number | null = null;

let request: VideoRequest = createDefaultVideoRequest();
let currentPage = request.Page;

const initializeTableHeaderClickEvents = () => {
    const tableHeader = document.getElementById('video-table-head');
    if (!tableHeader) {
        return;
    }

    const tableHeaderFields = tableHeader.getElementsByTagName('th');
    if (!tableHeaderFields || tableHeaderFields.length === 0) {
        return;
    }

    for (let i = 0; i < tableHeaderFields.length; i++) {
        if (tableHeaderFields[i].hasAttribute("data-sort-by")) {
            tableHeaderFields[i].addEventListener('click', () => {
                const sortAttributeValue = tableHeaderFields[i].getAttribute("data-sort-by");
                if (!sortAttributeValue) {
                    return;
                }

                const sortAttributeEnumValue = parseInt(sortAttributeValue, 10);

                if (request.OrderBy === sortAttributeEnumValue) {
                    request.Asc = !request.Asc;
                } else {
                    request.OrderBy = sortAttributeEnumValue;
                    request.Page = 1;
                    request.Asc = false;
                }

                loadVideos();
            });
        }
    }
}

const applyPageClickEvents = () => {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) {
        return;
    }

    const links = paginationContainer.getElementsByTagName('a');

    if (!links || links.length === 0) {
        return;
    }

    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('click', e => {
            e.preventDefault();
            const pageText = links[i].innerText;
            request.Page = parseInt(pageText, 10);
            loadVideos();
        });
    }
};

const initializeItemsPerPageSelectEvent = (): void => {
    const selectElement = <HTMLSelectElement>document.getElementById('items-per-page');
    if (!selectElement) {
        return;
    }

    selectElement.addEventListener('change', () => {
        request.Amount = parseInt(selectElement.value, 10);
        request.Page = 1;
        loadVideos();
    });
};

const initializeSearchEvent = (): void => {
    const searchBox = <HTMLInputElement>document.getElementById('search');
    if (!searchBox) {
        return;
    }

    searchBox.addEventListener('input', () => {
        if (searchTimeOut !== null) {
            clearTimeout(searchTimeOut);
        }

        searchTimeOut = setTimeout(() => {
            request.Search = searchBox.value;
            loadVideos();
        }, 300);
    });
};

const loadVideos = () => {
    currentPage = request.Page;
    const table = document.getElementById('video-table');
    if (!table) {
        return;
    }

    const oldTBody = table.lastElementChild;
    if (!oldTBody || oldTBody.tagName !== 'TBODY') {
        return;
    }

    fetch(CreateGetVideosUri(request)).then(x => x.json()).then((x: VideoResult) => {
        // videos
        const newTBody = document.createElement('tbody');
        x.videos.map(v => {
            const tr = document.createElement('tr');
            const button = document.createElement('button');
            let linkOrTitle: HTMLSpanElement | HTMLAnchorElement;

            if (v.submission_count > 0) {
                linkOrTitle = document.createElement('a');
                linkOrTitle.innerText = v.title;
                (linkOrTitle as HTMLAnchorElement).href = `/Video/${v.id}`;
            } else {
                linkOrTitle = document.createElement('span');
                linkOrTitle.innerText = v.title;
                linkOrTitle.classList.add('gray');
            }

            button.innerText = 'Submit';
            fillTableCells(tr, linkOrTitle, v.duration, v.published, button, v.likes, v.dislikes, v.ratio, v.view_count, v.favorite_count, v.comment_count, v.is_hd ? 'true' : 'false');
            newTBody.appendChild(tr);
        });
        table.removeChild(oldTBody);
        table.appendChild(newTBody);

        // pagination
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) {
            return;
        }
        paginationContainer.innerHTML = '';
        let pageCounter = 1;
        for (let i = 0; i < x.video_count; i += x.amount_per_page) {
            const a = document.createElement('a');
            a.innerText = pageCounter.toString(10);
            if (currentPage === pageCounter) {
                a.classList.add('active-page');
            }
            paginationContainer.appendChild(a);
            pageCounter++;
        }
        applyPageClickEvents();
    });
};


(() => {
    initializeTableHeaderClickEvents();
    applyPageClickEvents();
    initializeItemsPerPageSelectEvent();
    initializeSearchEvent();
})();