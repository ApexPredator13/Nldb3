import { VideoRequest } from '../interfaces/video-request';
import { VideoResult } from '../interfaces/video-result';
import { ResourceType } from '../enums/resource-type';
import { Video } from '../interfaces/video';
import { VideoOrderBy } from '../enums/video-order-by';

interface VideosComponentCellCreator {
    cellHeader: string,
    cellCreator: (video: Video) => HTMLTableCellElement
    sortByOnClick?: VideoOrderBy
}

class VideosComponent {
    private tableId: string;
    private isaacResource: string | undefined = undefined;
    private currentPage = 1;
    private amount = 50;
    private searchTimeout: number | null = null;
    private searchTerm: string | null = null;
    private lastClickedOn: HTMLTableHeaderCellElement | undefined;
    private orderBy = 2;
    private asc = false;
    private cellCreators: Array<VideosComponentCellCreator>;

    constructor(tableId: string, ...cellCreators: Array<VideosComponentCellCreator>) {
        this.cellCreators = cellCreators;
        this.tableId = tableId;
        this.isaacResource = (window as any).isaac_resource as string | undefined;

        this.CreateTableHead();
        this.LoadVideos();

        this.InitializeItemsPerPageSelectEvent();
        this.InitializeSearchEvent();
        this.InitializeTableHeaderClickEvents();
    }

    // gets the type of the isaac resource, if one is specified. Otherwise just call the normal 'get videos' endpoint
    private CreateVideoRequest(): Promise<VideoRequest> {
        var resourceTypePromise = this.isaacResource
            ? fetch(`/api/resources/${this.isaacResource}/Type`).then(type => type.json()).then((type: ResourceType) => Promise.resolve(type))
            : Promise.resolve(ResourceType.Unspecified);

        return resourceTypePromise.then(type => Promise.resolve({
            Asc: this.asc,
            OrderBy: this.orderBy,
            Search: this.searchTerm,
            Page: this.currentPage,
            Amount: this.amount,
            From: null,
            Until: null,
            ResourceId: this.isaacResource ? this.isaacResource : null,
            ResourceType: type
        }));
    }

    private LoadVideos(): void {
        this.CreateVideoRequest().then(requestObject => {
            this.currentPage = requestObject.Page;

            const table = document.getElementById(this.tableId);
            if (!table) {
                return;
            }

            const uri = this.CreateGetVideosUri(requestObject);

            fetch(uri).then(response => response.json()).then((videoResult: VideoResult) => {
                const newTBody = document.createElement('tbody');

                // create video rows
                videoResult.videos.map(video => {
                    const tr = document.createElement('tr');
                    const submitLink = document.createElement('a');
                    let linkOrTitle: HTMLSpanElement | HTMLAnchorElement;

                    if (video.submission_count > 0) {
                        linkOrTitle = document.createElement('a');
                        linkOrTitle.innerText = video.title;
                        (linkOrTitle as HTMLAnchorElement).href = `/Video/${video.id}`;
                    } else {
                        linkOrTitle = document.createElement('span');
                        linkOrTitle.innerText = video.title;
                        linkOrTitle.classList.add('gray');
                    }

                    submitLink.innerText = 'Submit';
                    submitLink.href = `/SubmitEpisode/${video.id}`;

                    for (const cellCreator of this.cellCreators) {
                        tr.appendChild(cellCreator.cellCreator(video));
                    }

                    newTBody.appendChild(tr);
                });

                // replace table
                const oldTBody = table.lastElementChild;
                if (oldTBody && oldTBody.tagName === 'TBODY') {
                    table.removeChild(oldTBody);
                }
                table.appendChild(newTBody);

                // pagination
                const paginationContainer = document.getElementById('pagination');
                if (!paginationContainer) {
                    return;
                }

                paginationContainer.innerHTML = '';
                let pageCounter = 1;

                for (let i = 0; i < videoResult.video_count; i += videoResult.amount_per_page) {
                    const a = document.createElement('a');
                    a.innerText = pageCounter.toString(10);
                    if (this.currentPage === pageCounter) {
                        a.classList.add('active-page');
                    }
                    paginationContainer.appendChild(a);
                    a.addEventListener('click', e => {
                        e.preventDefault();
                        const pageText = a.innerText;
                        this.currentPage = parseInt(pageText, 10);
                        this.LoadVideos();
                    });
                    pageCounter++;
                }
            });
        })
    }

    private CreateGetVideosUri(request: VideoRequest): string {
        const base = '/api/videos/';
        const asc = `?Asc=${request.Asc ? 'true' : 'false'}`;
        const orderBy = `&OrderBy=${request.OrderBy}`;
        const search = request.Search ? `&Search=${request.Search}` : '';
        const page = `&Page=${request.Page.toString(10)}`;
        const amount = `&Amount=${request.Amount.toString(10)}`;
        const from = request.From ? `&From=${request.From}` : '';
        const until = request.Until ? `&From=${request.Until}` : '';
        const resourceId = request.ResourceId ? `&ResourceId=${request.ResourceId}` : '';
        const resourceType = request.ResourceType ? `&ResourceType=${request.ResourceType.toString(10)}` : '';
        const completeUri = `${base}${asc}${orderBy}${search}${page}${amount}${from}${until}${resourceType}${resourceId}`;
        return completeUri;
    }

    private InitializeItemsPerPageSelectEvent(): void {
        const selectElement = <HTMLSelectElement>document.getElementById('items-per-page');
        if (!selectElement) {
            return;
        }

        selectElement.addEventListener('change', () => {
            this.amount = parseInt(selectElement.value, 10);
            this.currentPage = 1;
            this.LoadVideos();
        });
    };

    private InitializeSearchEvent(): void {
        const searchBox = <HTMLInputElement>document.getElementById('search');
        if (!searchBox) {
            return;
        }

        searchBox.addEventListener('input', () => {
            if (this.searchTimeout !== null) {
                clearTimeout(this.searchTimeout);
            }

            this.searchTimeout = setTimeout(() => {
                this.searchTerm = searchBox.value;
                this.currentPage = 1;
                this.LoadVideos();
            }, 300);
        });
    };

    private CreateTableHead(): void {
        const table = document.getElementById(this.tableId);
        if (table && table instanceof HTMLTableElement) {
            const thead = table.createTHead();
            thead.id = 'video-table-head';
            const theadRow = document.createElement('tr');

            for (const cellCreator of this.cellCreators) {
                const th = document.createElement('th');
                th.innerText = cellCreator.cellHeader;
                if (cellCreator.sortByOnClick !== undefined) {
                    th.setAttribute('data-sort-by', cellCreator.sortByOnClick.toString(10));
                    th.classList.add('hand');
                }
                theadRow.appendChild(th);
            }

            thead.appendChild(theadRow);
            table.appendChild(thead);
        }
    }

    private InitializeTableHeaderClickEvents() {
        const tableHeader = document.getElementById('video-table-head');
        if (!tableHeader) {
            return;
        }

        const tableHeaderFields = tableHeader.getElementsByTagName('th');
        if (!tableHeaderFields || tableHeaderFields.length === 0) {
            return;
        }

        // removes down arrow of releasedate on first click
        if (!this.lastClickedOn) {
            for (let i = 0; i < tableHeaderFields.length; i++) {
                if (tableHeaderFields[i].innerText.indexOf('Releasedate') !== -1) {
                    this.lastClickedOn = tableHeaderFields[i];
                    break;
                }
            }
        }

        for (let i = 0; i < tableHeaderFields.length; i++) {
            if (tableHeaderFields[i].hasAttribute("data-sort-by")) {
                tableHeaderFields[i].addEventListener('click', e => {
                    if (!e.target) {
                        return;
                    }

                    const sortAttributeValue = tableHeaderFields[i].getAttribute("data-sort-by");
                    if (!sortAttributeValue) {
                        return;
                    }

                    const sortAttributeEnumValue = parseInt(sortAttributeValue, 10);

                    if (this.orderBy === sortAttributeEnumValue) {
                        this.asc = !this.asc;
                    } else {
                        this.orderBy = sortAttributeEnumValue;
                        this.currentPage = 1;
                        this.asc = false;
                    }

                    if (this.lastClickedOn) {
                        this.lastClickedOn.innerText = this.lastClickedOn.innerText.substring(0, this.lastClickedOn.innerText.length - 2);
                    }

                    const target = <HTMLTableHeaderCellElement>e.target;
                    target.innerText = target.innerText + (this.asc ? ' ⇑' : ' ⇓');

                    this.lastClickedOn = target;

                    this.LoadVideos();
                });
            }
        }
    }
}

export {
    VideosComponent,
    VideosComponentCellCreator
}