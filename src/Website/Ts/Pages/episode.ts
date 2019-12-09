import { Component, FrameworkElement, AsyncComponentPart, A } from "../Framework/renderer";
import { initRouter, PageData, registerPage, setTitle, PageType, extractParametersFromRoute, setGlobalPageType } from "../Framework/router";
import { get } from "../Framework/http";
import { Video } from "../Models/video";
import { EventsTableComponent } from "../Components/Video/events-table";
import { VideoStats } from "../Components/Video/video-stats";
import { Timeline } from "../Components/Video/timeline";
import { ItemsSortedBySources } from "../Components/Video/sorted-by-sources";
import { TransformationProgress } from "../Components/Video/transformation-progress";
import { TransformationProgressChart } from "../Components/Video/transformation-progress-chart";
import { PlayedCharacters } from "../Components/Video/played-characters";
import { TimeSpentOnEachFloor } from "../Components/Video/time-spent-on-each-floor";
import { ItemPickupChart } from "../Components/Video/item-pickup-chart";

export class EpisodePage implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    private videoId: string;
    private videoData: Promise<Video | null>;

    private headerContainerId = 'video-title';

    constructor(parameters: Array<string>) {
        if (!parameters || parameters.length === 0) {
            parameters = extractParametersFromRoute(1);
        }

        this.videoId = parameters[0];

        // load video
        this.videoData = get<Video>(`/api/videos/${this.videoId}`);

        this.videoData.then(video => setTitle(video ? video.title : 'failed to load video'));

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['div'],
                    a: [[A.Id, this.headerContainerId]]
                },
                {
                    e: ['div'],
                    c: [
                        {
                            e: ['h2', 'Featuring...']
                        },
                        new PlayedCharacters(this.videoData, 0),
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h2', 'Timeline']
                        },
                        {
                            e: ['p', 'Click on a floor to jump to this part in the video']
                        },
                        new Timeline(this.videoData, 0),
                        {
                            e: ['h2', 'Approximate time spent on each floor (in seconds)']
                        },
                        new TimeSpentOnEachFloor(this.videoData, 0),
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h2', 'Gameplay-Events in chronological order']
                        },
                        new EventsTableComponent(this.videoData, 0),
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h2', 'Naturally Achieved Transformation Progress']
                        },
                        new TransformationProgress(this.videoData, 0),
                        {
                            e: ['h3', 'Transformative items from this episode, by transformation'],
                            a: [[A.Id, 'transformation-progress-header']]
                        },
                        new TransformationProgressChart(this.videoData, 0),
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h2', 'Item pickups sorted by item source']
                        },
                        new ItemsSortedBySources(this.videoData, 0),
                        new ItemPickupChart(this.videoData, 0),
                        {
                            e: ['hr']
                        },
                        {
                            e: ['h2', 'Video Stats compared to record episodes / an average episode']
                        },
                        new VideoStats(this.videoData),
                        {
                            e: ['div'],
                            a: [[A.Style, 'width: 100%; height: 400px;']]
                        }
                    ]
                }
            ]
        };

        this.A = [
            this.CreateVideoTitle()
        ];
    }

    private CreateVideoTitle(): AsyncComponentPart {
        return {
            I: this.headerContainerId,
            P: this.videoData.then(video => {
                return {
                    e: ['h1', video ? video.title : 'Failed to load video'],
                    c: [
                        {
                            e: ['hr']
                        }
                    ]
                };
            })
        }
    }

    static RegisterPage(): void {
        const pageData: PageData = {
            Component: EpisodePage,
            Title: 'Loading Episode...',
            Url: ['{id}'],
            specificPageType: PageType.Episode
        }
        registerPage(pageData);
    }
}


(() => {
    setGlobalPageType(PageType.Episode);
    EpisodePage.RegisterPage();
    initRouter();
})();
