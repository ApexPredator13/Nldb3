import { Html, Div, id, div, H1, Hr, h2, hr, p, style } from "../Framework/renderer";
import { initRouter, registerPage, setTitle, setOnLoadPageType, PAGE_TYPE_EPISODE } from "../Framework/router";
import { get } from "../Framework/http";
import { renderEventsTable } from "../Components/Video/events-table";
import { renderVideoStats } from "../Components/Video/video-stats";
import { renderTimeline } from "../Components/Video/timeline";
import { renderItemsSortedBySources } from "../Components/Video/sorted-by-sources";
import { renderTransformationProgress } from "../Components/Video/transformation-progress";
import { renderTransformationProgressChart } from "../Components/Video/transformation-progress-chart";
import { renderPlayedCharacters } from "../Components/Video/played-characters";
import { renderTimeSpentOnEachFloor } from "../Components/Video/time-spent-on-each-floor";
import { renderItempickupChart } from "../Components/Video/item-pickup-chart";

/**
 * Displays an entire episode
 * @param {string[]} parameters - route parameters. parameters[0] is the youtube video ID
 */
function EpisodePage(parameters) {
    const videoData = get(`/api/videos/${parameters[0]}`);
    const headerContainerId = 'video-title';

    createVideoTitle(video, headerContainerId);
    videoData.then(video => setTitle(video ? video.title : 'failed to load video'));
    

    new Html([
        Div(
            id(headerContainerId)
        ),
        Div(
            h2(t('Featuring...')),
            div(id('featuring')),
            hr(),

            h2(t('Timeline')),
            p(t('Click on a floor to jump to this part in the video')),
            div(id('timeline')),

            h2(t('Approximate time spent on each floor (in seconds)')),
            div(id('time-spent')),
            hr(),

            h2(t('Gameplay-Events in chronological order')),
            div(id('events-table')),
            hr(),

            h2(t('Naturally Achieved Transformation Progress')),
            div(id('trans-prog')),

            h2(t('Transformative items from this episode, by transformation')),
            div(id('trans-prog-chart')),
            hr(),

            h2(t('Item pickups sorted by item source')),
            div(id('items-sources')),
            div(id('item-pickup-chart')),
            hr(),

            h2(t('Video Stats compared to record episodes / an average episode')),
            div(id('video-stats')),

            div(style('width: 100%; height: 300px;'))
        )
    ]);

    const submissionIndex = 0;
    renderPlayedCharacters(videoData, submissionIndex, 'featuring');
    renderTimeline(videoData, submissionIndex, 'timeline');
    renderTimeSpentOnEachFloor(videoData, submissionIndex, 'time-spent');
    renderEventsTable(videoData, submissionIndex, 'events-table');
    renderTransformationProgress(videoData, submissionIndex, 'trans-prog');
    renderTransformationProgressChart(videoData, submissionIndex, 'trans-prog-chart');
    renderItemsSortedBySources(videoData, submissionIndex, 'items-sources');
    renderItempickupChart(videoData, submissionIndex, 'item-pickup-chart');
    renderVideoStats(videoData, 'video-stats');
}

function createVideoTitle(video, containerId) {
    video.then(video => {
        new Html([
            H1(video.title),
            Hr()
        ], containerId);
    })
}

function registerEpisodePage() {
    registerPage(EpisodePage, 'loading video...', ['{id}'], PAGE_TYPE_EPISODE);
}

export {
    registerEpisodePage,
    EpisodePage
}

(() => {
    setOnLoadPageType(PAGE_TYPE_EPISODE);
    registerEpisodePage();
    initRouter();
})();
