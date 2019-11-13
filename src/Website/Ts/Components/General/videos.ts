import { Component, FrameworkElement, A, AsyncComponentPart, EventType, render } from "../../Framework/renderer";
import { Option } from '../../Components/General/option';
import { get } from "../../Framework/http";
import { VideoResult } from "../../Models/video-result";
import { ResourceType } from "../../Enums/resource-type";
import { goToRouteWithName, setPageData, goToRouteWithUrl } from "../../Framework/router";
import { VideoOrderBy } from "../../Enums/video-order-by";

export class VideosComponent implements Component {

    E: FrameworkElement;
    A: Array<AsyncComponentPart>

    private currentPage = 1;
    private amount = 50;
    private searchTimeout: number | null = null;
    private searchTerm: string | null = null;
    private lastOrderedBy: VideoOrderBy | undefined;
    private orderBy = VideoOrderBy.Published;
    private asc = false;

    private paginationId = 'pagination';
    private videoTableId = 'video-table';
    private videoTableBodyId = 'video-table-body';

    constructor(header: string, description?: string, private resourceType?: ResourceType, private from?: string, private to?: string, private resourceId?: string) {
        const url = this.createRequestUrl(false);
        this.A = this.CreateTbody(url);
        this.E = this.CreateThead(header, description);
    }

    private CreateThead(header: string, description?: string): FrameworkElement {

        const headerElements: Array<FrameworkElement> = new Array<FrameworkElement>();
        headerElements.push({ e: ['h1', header] });
        if (description) {
            headerElements.push({ e: ['p', description] });
        }

        const selectEvent = (e: Event) => {
            const target = e.target;
            if (target && target instanceof HTMLSelectElement) {
                const value = target.value;
                const amount = parseInt(value, 10);
                this.amount = amount;
                this.ReloadVideos(false);
            }
        };

        const inputEvent = (e: Event) => {
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
        };

        return {
            e: ['div'],
            c: [
                ...headerElements,
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['p', 'Items per Page:'],
                            c: [
                                {
                                    e: ['select'],
                                    a: [[A.Id, 'items-per-page']],
                                    c: [
                                        new Option('50', '50', true),
                                        new Option('100', '100'),
                                        new Option('150', '150'),
                                        new Option('200', '200'),
                                    ],
                                    v: [[EventType.Change, selectEvent]]
                                },
                                {
                                    e: ['input'],
                                    a: [[A.Type, 'text'], [A.Id, 'search'], [A.Placeholder, 'search...']],
                                    v: [[EventType.Input, inputEvent]]
                                }
                            ]
                        }
                    ]
                },
                {
                    e: ['div'],
                    a: [[A.Id, this.paginationId]],
                },
                {
                    e: ['table'],
                    a: [[A.Id, this.videoTableId]],
                    c: [
                        {
                            e: ['thead'],
                            a: [[A.Id, 'video-table-head']],
                            c: [
                                {
                                    e: ['tr'],
                                    c: [
                                        {
                                            e: ['th', 'Title'],
                                            v: [[EventType.Click, () => { this.orderBy = VideoOrderBy.Title; this.ReloadVideos(true); this.lastOrderedBy = VideoOrderBy.Title; }]],
                                            a: [[A.Class, 'hand'], [A.DataId, VideoOrderBy.Title.toString(10)]]
                                        },
                                        {
                                            e: ['th', 'Duration'],
                                            v: [[EventType.Click, () => { this.orderBy = VideoOrderBy.Duration; this.ReloadVideos(true); this.lastOrderedBy = VideoOrderBy.Duration; }]],
                                            a: [[A.Class, 'hand'], [A.DataId, VideoOrderBy.Duration.toString(10)]]
                                        },
                                        {
                                            e: ['th', 'Release Date ⇓'],
                                            v: [[EventType.Click, () => { this.orderBy = VideoOrderBy.Published; this.ReloadVideos(true); this.lastOrderedBy = VideoOrderBy.Published; }]],
                                            a: [[A.Class, 'hand'], [A.DataId, VideoOrderBy.Published.toString(10)]]
                                        },
                                        {
                                            e: ['th', '👍'],
                                            v: [[EventType.Click, () => { this.orderBy = VideoOrderBy.Likes, this.ReloadVideos(true); this.lastOrderedBy = VideoOrderBy.Likes; }]],
                                            a: [[A.Class, 'hand'], [A.DataId, VideoOrderBy.Likes.toString(10)], [A.Title, 'Likes']]
                                        },
                                        {
                                            e: ['th', '👎'],
                                            v: [[EventType.Click, () => { this.orderBy = VideoOrderBy.Dislikes, this.ReloadVideos(true), this.lastOrderedBy = VideoOrderBy.Dislikes; }]],
                                            a: [[A.Class, 'hand'], [A.DataId, VideoOrderBy.Dislikes.toString(10)], [A.Title, 'Dislikes']]
                                        },
                                        {
                                            e: ['th', '👎%'],
                                            v: [[EventType.Click, () => { this.orderBy = VideoOrderBy.LikeDislikeRatio, this.ReloadVideos(true), this.lastOrderedBy = VideoOrderBy.LikeDislikeRatio; }]],
                                            a: [[A.Class, 'hand'], [A.DataId, VideoOrderBy.LikeDislikeRatio.toString(10)], [A.Title, 'Dislikes in %']]
                                        },
                                        {
                                            e: ['th', 'Views'],
                                            v: [[EventType.Click, () => { this.orderBy = VideoOrderBy.ViewCount, this.ReloadVideos(true), this.lastOrderedBy = VideoOrderBy.ViewCount; }]],
                                            a: [[A.Class, 'hand'], [A.DataId, VideoOrderBy.ViewCount.toString(10)], [A.Title, 'View Count']]
                                        },
                                        {
                                            e: ['th', 'Comm'],
                                            v: [[EventType.Click, () => { this.orderBy = VideoOrderBy.CommentCount, this.ReloadVideos(true), this.lastOrderedBy = VideoOrderBy.CommentCount; }]],
                                            a: [[A.Class, 'hand'], [A.DataId, VideoOrderBy.CommentCount.toString(10)], [A.Title, 'Comment Count']]
                                        },
                                        {
                                            e: ['th', 'HD'],
                                        },
                                        {
                                            e: ['th']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }



    private CreateTbody(url: string): Array<AsyncComponentPart> {
        console.log('loading videos from ', url);

        const videoRequest = get<VideoResult>(url);

        const pagination: AsyncComponentPart = {
            P: this.CreatePagination(videoRequest),
            I: this.paginationId
        }

        const videos: AsyncComponentPart = {
            P: this.CreateVideos(videoRequest),
            I: this.videoTableId,
            A: true
        };

        return [pagination, videos];
    }



    private ReloadVideos(allowChangeAsc: boolean) {
        const url = this.createRequestUrl(allowChangeAsc);
        const arrow = this.asc ? ' ⇑' : ' ⇓';
        const ths = document.getElementsByTagName('th');
        for (let i = 0; i < ths.length; ++i) {
            const th = ths[i];

            // remove arrow
            if (th.innerText && (th.innerText.endsWith(' ⇑') || th.innerText.endsWith(' ⇓'))) {
                th.innerText = th.innerText.substring(0, th.innerText.length - 2);
            }

            // add arrow
            const id = th.getAttribute('data-id');
            if (id && parseInt(id, 10) === this.orderBy) {
                th.innerText = th.innerText + arrow;
            }
        }

        // replace videos
        const x = this.CreateTbody(url);

        Promise.all([x[0].P, x[1].P]).then(([p, v]) => {
            const pagination = render(p);
            const videos = render(v);

            const paginationContainer = document.getElementById(this.paginationId);
            const videoTable = document.getElementById(this.videoTableId);

            if (pagination && videos && paginationContainer && videoTable) {

                // replace pagination
                paginationContainer.innerHTML = '';
                paginationContainer.appendChild(pagination);

                // remove old tbody
                const tBodys = videoTable.getElementsByTagName('tbody');
                if (tBodys && tBodys.length > 0) {
                    const tBody = tBodys[0];
                    if (tBody.parentElement) {
                        tBody.parentElement.removeChild(tBody);
                    }
                }

                // add new tbody
                videoTable.appendChild(videos);
            }
        });
    }



    private createRequestUrl(allowChangeAsc: boolean): string {
        if (allowChangeAsc) {
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

    

    private async CreatePagination(videoRequest: Promise<VideoResult>): Promise<FrameworkElement> {
        return videoRequest.then(videoResult => {
            const paginationElements = new Array<FrameworkElement>();

            let pageCounter = 1;
            for (let i = 0; i < videoResult.video_count; i += videoResult.amount_per_page) {

                const clickEvent = (e: Event) => {
                    e.preventDefault();
                    const target = e.target;
                    if (target && target instanceof HTMLAnchorElement) {
                        this.currentPage = parseInt(target.innerText, 10);
                        this.ReloadVideos(false);
                    }
                };

                paginationElements.push({
                    e: ['a', pageCounter.toString(10)],
                    a: [this.currentPage === pageCounter ? [A.Class, 'active-page'] : null],
                    v: [[EventType.Click, clickEvent]]
                });
                ++pageCounter;
            }

            const paginationContainer: FrameworkElement = {
                e: ['div'],
                c: paginationElements
            }

            return paginationContainer;
        });
    }



    private async CreateVideos(videoRequest: Promise<VideoResult>): Promise<FrameworkElement> {
        return videoRequest.then(videoResult => {
            const videos = new Array<FrameworkElement>();
            for (let i = 0; i < videoResult.videos.length; ++i) {
                const video = videoResult.videos[i];
                const clickEvent = (e: Event) => {
                    e.preventDefault();
                    console.log('clicked title.', video);
                    if (video.submission_count > 0) {
                        setPageData('episode', { title: video.title, id: video.id });
                        goToRouteWithUrl('/Episode');
                    }
                }

                const rMono: [A, string] = [A.Class, 'r mono'];

                const cells: Array<FrameworkElement> = [
                    {
                        e: ['td'],
                        c: [
                            {
                                e: ['a', video.title],
                                v: [[EventType.Click, clickEvent]],
                                a: [video.submission_count > 0 ? [A.Class, 'hand'] : [A.Class, 'gray']]
                            }
                        ]
                    },
                    {
                        e: ['td', video.duration ? video.duration : ''],
                        a: [rMono]
                    },
                    {
                        e: ['td', video.published ? video.published : ''],
                        a: [rMono]
                    },
                    {
                        e: ['td', this.PrintNumber(video.likes)],
                        a: [rMono]
                    },
                    {
                        e: ['td', this.PrintNumber(video.dislikes)],
                        a: [rMono]
                    },
                    {
                        e: ['td', this.PrintNumber(video.ratio, 2)],
                        a: [rMono]
                    },
                    {
                        e: ['td', this.PrintNumber(video.view_count)],
                        a: [rMono]
                    },
                    {
                        e: ['td', this.PrintNumber(video.comment_count)],
                        a: [rMono]
                    },
                    {
                        e: ['td', video.is_hd ? '✔' : '✘'],
                        a: [[A.Class, 'r ' + (video.is_hd ? 'green' : 'orange')]]
                    },
                    {
                        e: ['td', 'Submit'],
                        v: [[EventType.Click, e => { e.preventDefault(); goToRouteWithName('submit'); }]],
                        a: [[A.Class, 'hand u']]
                    }
                ]

                videos.push({
                    e: ['tr'],
                    c: cells
                });
            }
            const tbody: FrameworkElement = {
                e: ['tbody'],
                c: videos,
                a: [[A.Id, this.videoTableBodyId]]
            }

            return tbody;
        });
    }



    private PrintNumber(num: number | undefined | null, decimals: null | 1 | 2 = null): string | undefined {
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
}

