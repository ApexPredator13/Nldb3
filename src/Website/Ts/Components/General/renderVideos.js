import { Div, div, Render, Tbody, td, a, th, cl, id, t, tr, thead, H1, p, P, do_nothing, select, option, attr, input, Table, tbody, modal } from "../../Framework/renderer";
import { get } from "../../Framework/http";
import { addClassIfNotExists, removeClassIfExists } from "../../Framework/browser";
import { getUser } from "../../Framework/Customizable/authentication";
import { notLoggedIn } from "./modal-contents";

const DEFAULT_AMOUNT_PER_PAGE = 50;

export function Videos(containerId, header, description, resourceType, from, to, resourceId) {

    // save variables
    this.header = header;
    this.description = description;

    this.resourceType = resourceType;
    this.from = from;
    this.to = to;
    this.resourceId = resourceId;

    this.currentPage = 1;
    this.amount = DEFAULT_AMOUNT_PER_PAGE;
    this.searchTimeout = null;
    this.searchTerm = '';
    this.lastOrderedBy = null;
    this.orderBy = 2;
    this.asc = false;

    this.paginationId = 'pagination';
    this.videoTableId = 'video-table';
    this.videoTableBodyId = 'video-table-body';

    // define events
    this.searchEvent = function (e) {
        if (this.searchTimeout !== null) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            const target = e.target;
            if (target && target instanceof HTMLInputElement) {
                this.searchTerm = target.value.length >= 3 ? target.value : null;
                this.currentPage = 1;
                this.ReloadVideos(false);
            }
        }, 300);
    }

    this.selectAmountEvent = function (e) {
        this.amount = parseInt(e.target.value, 10);
        this.reloadVideos(false);
    }

    this.pageClickEvent = function (e) {
        this.currentPage = parseInt(e.target.innerText, 10);
        this.reloadVideos(false);
    }

    this.submitVideoEvent = function (e, videoId) {
        addClassIfNotExists(e.target, 'progress');
        getUser().then(user => {
            if (!user) {
                modal(false, notLoggedIn());
            } else {
                navigate(new Link().SubmitVideo(videoId))
            }
        }).finally(() => {
            if (e && e.target) {
                removeClassIfExists(e.target, 'progress');
            }
        });
    }


    // creates the request url
    this.createRequestUrl = function (allowChangesAsc) {
        if (allowChangesAsc) {
            if (this.orderBy === this.lastOrderedBy) {
                this.asc = !this.asc;
            } else {
                this.asc = false;
            }
        }

        const base = '/api/videos/';
        const asc = `?Asc=${this.asc ? 'true' : 'false'}`;
        const orderBy = `&OrderBy=${this.orderBy}`;
        const search = this.searchTerm ? `&Search=${this.searchTerm}` : '';
        const page = `&Page=${this.currentPage.toString(10)}`;
        const amount = `&Amount=${this.amount.toString(10)}`;
        const from_ = this.from ? `&From=${this.from}` : '';
        const until_ = this.to ? `&From=${this.to}` : '';
        const resourceId_ = this.resourceId ? `&ResourceId=${this.resourceId}` : '';
        const resourceType_ = this.resourceType ? `&ResourceType=${this.resourceType.toString(10)}` : '';
        const completeUri = `${base}${asc}${orderBy}${search}${page}${amount}${from_}${until_}${resourceType_}${resourceId_}`;
        return completeUri;
    }

    // pretty-prints number
    this.printNumber = function (num) {
        if (num) {
            if (decimals) {
                return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            } else {
                return num.toString(10).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        } else {
            return undefined;
        }
    }


    // renders the pagination
    this.createPagination = function (request) {
        request.then(videoResult => {

            let pages = [];
            let pageCounter = 1;

            for (let i = 0; i < videoResult.video_count; i += videoResult.amount_per_page) {
                pages.push(pageCounter++);
            }

            new Render([
                Div(
                    ...(pages.map(page => {
                        div(
                            t(page.toString(10)),
                            event('click', this.pageClickEvent)
                        )
                    }))
                )
            ], this.paginationId);
        });
    }

    

    // renders the table body
    this.createVideos = function (request) {
        const link = new Link();
        request.then(videoResult => {

            const table = document.getElementById(this.videoTableId);
            table.removeChild(table.lastElementChild);

            new Render([
                Tbody(
                    id(this.videoTableBodyId),
                    ...(videoResult.videos.map(video => {
                        tr(
                            td(
                                a(
                                    t(video.title),
                                    event('click', e => navigate(link.Episode(video.id), e, PageType.Episode))
                                )
                            ),
                            td(
                                cl('r', 'mono'),
                                t(video.duration ? video.duration.toString(10) : '')
                            ),
                            td(
                                cl('r', 'mono'),
                                t(video.published ? video.published : '')
                            ),
                            td(
                                cl('r', 'mono'),
                                t(this.printNumber(video.likes))
                            ),
                            td(
                                cl('r', 'mono'),
                                t(this.printNumber(video.dislikes))
                            ),
                            td(
                                cl('r', 'mono'),
                                t(this.printNumber(video.ratio, 2))
                            ),
                            td(
                                cl('r', 'mono'),
                                t(this.printNumber(video.view_count, 2))
                            ),
                            td(
                                cl('r', 'mono'),
                                t(this.printNumber(video.comment_count, 2))
                            ),
                            td(
                                cl('r', video.is_hd ? 'green' : 'orange'),
                                t(video.is_hd ? '✔' : '✘')
                            ),
                            td(
                                cl('hand', 'u'),
                                t('Submit'),
                                event('click', e => this.submitVideoEvent(e, video.id))
                            )
                        )
                    }))
                )
            ], this.videoTableId, true, false);
        });
    }

    // takes the video request and renders pagination and video table body when data is available
    this.createHtmlFromVideoResponse = function (url) {
        const request = get(url);
        this.createPagination(request);
        this.createVideos(request);
    }

    // triggers video reload
    this.reloadVideos = function (allowChangeAsc) {

        const url = this.createRequestUrl(allowChangeAsc);
        const arrow = this.asc ? ' ⇑' : ' ⇓';
        const ths = document.getElementsByTagName('th');

        // adds arrow to clicked <th> element
        for (let i = 0; i < ths.length; ++i) {
            const th = ths[i];

            if (th.innerText && (th.innerText.endsWith(' ⇑') || th.innerText.endsWith(' ⇓'))) {
                th.innerText = th.innerText.substring(0, th.innerText.length - 2);
            }

            const id = th.getAttribute('r');
            if (id && parseInt(id, 10) === this.orderBy) {
                th.innerText = th.innerText + arrow;
            }
        }

        // replace videos
        this.createHtmlFromVideoResponse(url);
    }



    // now that everything is set up, render component and load videos
    new Render([
        H1(t(header)),
        description ? P(t(description)) : do_nothing,

        Div(
            p(
                t('Items per Page: '),
                select(
                    event('input', this.selectAmountEvent),

                    option(t('50'), attr({ value: '50', selected: 'true' })),
                    option(t('100'), attr({ value: '100' })),
                    option(t('150'), attr({ value: '150' })),
                    option(t('200'), attr({ value: '200' }))
                ),
                input(
                    attr({ type: 'text', id: 'search', placeholder: 'search...' }),
                    event('input', this.searchEvent)
                )
            )
        ),

        Div(id(this.paginationId)),

        Table(
            thead(
                tr(
                    th(
                        t('Title'),
                        attr({ class: 'hand', r: '1' }),
                        event('click', () => {
                            this.orderBy = 1;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 1;
                        })
                    ),
                    th(
                        t('Duration'),
                        attr({ class: 'hand', r: '3' }),
                        event('click', () => {
                            this.orderBy = 3;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 3;
                        })
                    ),
                    th(
                        t('Release Date ⇓'),
                        attr({ class: 'hand', r: '2' }),
                        event('click', () => {
                            this.orderBy = 2;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 2;
                        })
                    ),
                    th(
                        t('👍'),
                        attr({ class: 'hand', r: '4' }),
                        event('click', () => {
                            this.orderBy = 4;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 4;
                        })
                    ),
                    th(
                        t('👎'),
                        attr({ class: 'hand', r: '5' }),
                        event('click', () => {
                            this.orderBy = 5;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 5;
                        })
                    ),
                    th(
                        t('Views'),
                        attr({ class: 'hand', r: '6' }),
                        event('click', () => {
                            this.orderBy = 6;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 6;
                        })
                    ),
                    th(
                        t('Comm'),
                        attr({ class: 'hand', r: '8' }),
                        event('click', () => {
                            this.orderBy = 8;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 8;
                        })
                    ),
                    th(
                        t('HD')
                    ),
                    th()
                )
            ),
            tbody()
        )
    ], containerId);

    this.reloadVideos(false);
}
