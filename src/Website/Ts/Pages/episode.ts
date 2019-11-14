import { Component, FrameworkElement, AsyncComponentPart, A } from "../Framework/renderer";
import { initRouter, PageData, registerPage, setTitle, PageType, extractParametersFromRoute } from "../Framework/router";
import { get } from "../Framework/http";
import { Video } from "../Models/video";
import { EventsTableComponent } from "../Components/Video/events-table";
import { VideoStats } from "../Components/Video/video-stats";
import { Timeline } from "../Components/Video/timeline";

export class EpisodePage implements Component {
    E: FrameworkElement;
    A: Array<AsyncComponentPart>;

    private videoId: string;
    private videoData: Promise<Video>;

    private headerContainerId = 'video-title';
    private videoEventsTableId = 'video-events-table';

    constructor(parameters: Array<string>) {
        console.log('PARAMETERS', parameters);
        if (!parameters || parameters.length === 0) {
            parameters = extractParametersFromRoute(1);
        }

        this.videoId = parameters[0];

        // load video
        this.videoData = get<Video>(`/api/videos/${this.videoId}`);

        // set title again - could be empty if page data didn't exist
        this.videoData.then(video => setTitle(video.title));

        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['div'],
                    a: [[A.Id, this.headerContainerId]]
                },
                {
                    e: ['div'],
                    a: [[A.Id, this.videoEventsTableId]],
                    c: [
                        {
                            e: ['h3', 'Gameplay-Events in chronological order']
                        },
                        new EventsTableComponent(this.videoData, 0),
                        {
                            e: ['h3', 'Timeline']
                        },
                        new Timeline(this.videoData, 0),
                        {
                            e: ['h3', 'Video Statistics compared to record episodes / an average episode']
                        },
                        new VideoStats(this.videoData)
                    ]
                }
            ]
        };

        this.A = [
            this.CreateVideoTitle()
        ]
    }

    private CreateVideoTitle(): AsyncComponentPart {
        return {
            I: this.headerContainerId,
            P: this.videoData.then(video => {
                return { e: ['h1', video.title] };
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
    EpisodePage.RegisterPage();
    initRouter();
})();
