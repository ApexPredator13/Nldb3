import { Div, div, Html, Tbody, td, a, th, cl, id, t, tr, thead, H1, p, P, do_nothing, select, option, attr, input, Table, tbody, modal, event, href, span, style } from "../../Framework/renderer";
import { get } from "../../Framework/http";
import { addClassIfNotExists, removeClassIfExists } from "../../Framework/browser";
import { getUser } from "../../Framework/Customizable/authentication";
import { notLoggedIn } from "./modal-contents";
import { Link } from "../../Pages/_link-creator";
import { navigate, PAGE_TYPE_EPISODE } from "../../Framework/router";


/**
 * Renders videos
 * @constructor
 * @param {string} containerId - the container the table will be rendered into
 * @param {string} [header] - the text that will be displayed in the header
 * @param {string} [description] - the description that will be placed right below the header
 * @param {string|null} [from] - the starting point. can be: vanilla, wrathofthelamb, communityremix, rebirth, afterbirth, afterbirthplus, antibirth
 * @param {string|null} [to] - the end point. can be: vanilla, wrathofthelamb, communityremix, rebirth, afterbirth
 * @param {string} [resourceId] - the resource that must appear in a video for it to be included in the search result
 * @param {number|null} [resourceType] - the resource type that the resource has
 */
function Videos(containerId, header, description, from = null, to = null, resourceId = null, resourceType = null) {

    this.header = header;
    this.description = description;
    this.resourceType = resourceType;
    this.from = from;
    this.to = to;
    this.resourceId = resourceId;

    this.currentPage = 1;
    this.amount = 50;
    this.searchTimeout = null;
    this.searchTerm = '';
    this.lastOrderedBy = null;
    this.orderBy = 2;
    this.asc = false;

    this.paginationId = 'pagination';
    this.videoTableId = 'video-table';
    this.videoTableBodyId = 'video-table-body';

    this.link = new Link();

    new Html([
        H1(t(header)),
        description ? P(t(description)) : do_nothing,

        Div(
            p(
                t('Items per Page: '),
                select(
                    event('input', e => this.selectAmountEvent(e)),

                    option('50', '50', true),
                    option('100', '100', false),
                    option('150', '150', false),
                    option('200', '200', false)
                ),
                input(
                    attr({ type: 'text', id: 'search', placeholder: 'search...' }),
                    event('input', () => this.searchEvent())
                )
            )
        ),

        Div(id(this.paginationId)),

        Table(
            id(this.videoTableId),

            thead(
                tr(
                    th(
                        t('Title'),
                        attr({ class: 'hand', r: '1', title: 'Video Title' }),
                        event('click', () => {
                            this.orderBy = 1;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 1;
                        })
                    ),
                    th(
                        t('Duration'),
                        attr({ class: 'hand', r: '3', title: 'Video duration' }),
                        event('click', () => {
                            this.orderBy = 3;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 3;
                        })
                    ),
                    th(
                        t('Release Date ⇓'),
                        attr({ class: 'hand', r: '2', title: 'Video Release Date' }),
                        event('click', () => {
                            this.orderBy = 2;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 2;
                        })
                    ),
                    th(
                        t('👍'),
                        attr({ class: 'hand', r: '4', title: 'Number of Likes' }),
                        event('click', () => {
                            this.orderBy = 4;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 4;
                        })
                    ),
                    th(
                        t('👎'),
                        attr({ class: 'hand', r: '5', title: 'Number of Dislikes' }),
                        event('click', () => {
                            this.orderBy = 5;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 5;
                        })
                    ),
                    th(
                        t('👎/👍'),
                        attr({ class: 'hand', r: '9', title: 'Like/Dislike Ratio (percent of dislikes)' }),
                        event('click', () => {
                            this.orderBy = 9;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 9;
                        })
                    ),
                    th(
                        t('Views'),
                        attr({ class: 'hand', r: '6', title: 'View Count' }),
                        event('click', () => {
                            this.orderBy = 6;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 6;
                        })
                    ),
                    th(
                        t('Comm'),
                        attr({ class: 'hand', r: '8', title: 'Comment Count' }),
                        event('click', () => {
                            this.orderBy = 8;
                            this.reloadVideos(true);
                            this.lastOrderedBy = 8;
                        })
                    ),
                    th(
                        t('HD'),
                        attr({ title: 'Is at least 720p?' })
                    ),
                    th(),
                    th()
                )
            ),
            tbody()
        )
    ], containerId);

    this.searchInputElement = document.getElementById('search');

    this.reloadVideos(false);
}



Videos.prototype = {

    /**
     * processes the search event after the user typed something
     * @param {Event} e - the raw input event
     */
    searchEvent: function () {

        if (this.searchTimeout !== null) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }

        this.searchTimeout = setTimeout(
            function () {
                this.searchTerm = this.searchInputElement.value.length >= 3 ? this.searchInputElement.value : null;
                this.currentPage = 1;
                this.reloadVideos(false);
            }.bind(this),
            300
        );
    },


    /**
     * processes the select event after the user changed the amount of videos that should be displayed
     * @param {Event} e - the raw input event
     */
    selectAmountEvent: function (e) {
        this.amount = parseInt(e.target.value, 10);
        this.reloadVideos(false);
    },


    /**
     * processes the click event after the user clicked on a page
     * @param {Event} e
     */
    pageClickEvent: function (e) {
        this.currentPage = parseInt(e.target.innerText, 10);
        this.reloadVideos(false);
    },


    /**
     * sends the user to the 'submit video' page
     * @param {Event} e
     * @param {string} videoId
     */
    submitVideoEvent: function (e, videoId) {
        addClassIfNotExists(e.target, 'progress');
        getUser(true).then(user => {
            if (!user) {
                modal(false, notLoggedIn());
            } else {
                navigate(new Link().submitVideo(videoId))
            }
        }).finally(() => {
            if (e && e.target) {
                removeClassIfExists(e.target, 'progress');
            }
        });
    },


    /**
     * @param {boolean} allowChangesAsc - indicates whether the result can be auto-switched between ascending and descending order
     */
    createRequestUrl: function (allowChangesAsc) {
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
    },

    /**
     * @param {number} num
     * @param {number=} decimals
     */
    printNumber: function (num, decimals = 0) {
        if (num) {
            if (decimals) {
                return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            } else {
                return num.toString(10).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        } else {
            return '';
        }
    },


    /**
     * @param {Promise} request - the video request
     */
    createPagination: function (request) {
        request.then(videoResult => {

            let pages = [];
            let pageCounter = 1;

            for (let i = 0; i < videoResult.video_count; i += videoResult.amount_per_page) {
                pages.push(pageCounter++);
            }

            new Html([
                Div(
                    id('pagination'),
                    ...pages.map(page =>
                        a(
                            t(page.toString(10)),
                            this.currentPage === page ? cl('active-page') : do_nothing,
                            event('click', e => this.pageClickEvent(e))
                        )
                    )
                )
            ], this.paginationId);
        });
    },


    /**
     * triggers video reload
     * @param {boolean} allowChangeAsc - indicates whether the result can be auto-switched between ascending and descending order
     */
    reloadVideos: function (allowChangeAsc) {

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
    },


    /**
     * creates table content and pagination
     * @param {string} url - the video request URL
     */
    createHtmlFromVideoResponse: function (url) {
        const request = get(url);
        this.createPagination(request);
        this.createVideos(request);
    },


    /**
     * renders the table body
     * @param {Promise} request
     */
    createVideos: function (request) {
        request.then(videoResult => {
            const table = document.getElementById(this.videoTableId);
            table.removeChild(table.lastElementChild);

            new Html([
                Tbody(
                    id(this.videoTableBodyId),
                    ...videoResult.videos.map(video => {

                        const videoIsCurrentlyBeingAdded = video.currently_adding && video.currently_adding > Date.now() - 20000;

                        return tr(
                            td(
                                video.submission_count > 0 ? a(
                                    t(video.title),
                                    videoIsCurrentlyBeingAdded ? style("color: orange") : do_nothing,
                                    videoIsCurrentlyBeingAdded ? attr({title: "video is currently being added!"}) : do_nothing,
                                    href(this.link.episode(video.id)),
                                    event('click', e => navigate(this.link.episode(video.id), e, PAGE_TYPE_EPISODE))
                                ) : span(
                                    t(video.title),
                                    cl('gray'),
                                    videoIsCurrentlyBeingAdded ? style("color: darkorange") : do_nothing,
                                    videoIsCurrentlyBeingAdded ? attr({title: "video is currently being added!"}) : do_nothing,
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
                            ),
                            td(
                                video.submission_count > 0 && video.info_missing ? span(
                                    t('❗'),
                                    attr({
                                        title: 'Needs to be resubmitted because pills, trinkets, runes... are now supported!',
                                        style: 'cursor: help'
                                    })
                                ) : do_nothing
                            )
                        )
                    })
                )
            ], this.videoTableId, true, false);
        });
    }
}

export {
    Videos
}