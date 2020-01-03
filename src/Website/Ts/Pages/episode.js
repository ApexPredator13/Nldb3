import { Html, Div, id, div, H1, Hr, h2, hr, p, style, t } from "../Framework/renderer";
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
 * @constructor
 * @param {string[]} parameters - route parameters. parameters[0] is the youtube video ID
 */
function EpisodePage(parameters) {
    this.videoData = get(`/api/videos/${parameters[0]}`);
    this.headerContainerId = 'video-title';
}



EpisodePage.prototype = {

    // renders all html that is required for the data to be displayed
    renderPage: function () {
        new Html([
            Div(
                id(this.headerContainerId)
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

        this.createPageHeader();
        this.setDocumentTitle();

        // then display all other stuff!
        const submissionIndex = 0;          // improvement: let user choose which submission to view

        renderPlayedCharacters(this.videoData, submissionIndex, 'featuring');
        renderTimeline(this.videoData, submissionIndex, 'timeline');
        renderTimeSpentOnEachFloor(this.videoData, submissionIndex, 'time-spent');
        renderEventsTable(this.videoData, submissionIndex, 'events-table');
        renderTransformationProgress(this.videoData, submissionIndex, 'trans-prog');
        renderTransformationProgressChart(this.videoData, submissionIndex, 'trans-prog-chart');
        renderItemsSortedBySources(this.videoData, submissionIndex, 'items-sources');
        renderItempickupChart(this.videoData, submissionIndex, 'item-pickup-chart');
        renderVideoStats(this.videoData, 'video-stats');
    },

    createPageHeader: function () {
        this.videoData.then(video => {
            new Html([
                H1(t(video.title)),
                Hr()
            ], this.headerContainerId);
        })
        // improvement: catch
    },

    setDocumentTitle: function () {
        this.videoData.then(video => setTitle(video.title))
        // improvement: catch
    }
}


function registerEpisodePage() {
    registerPage(EpisodePage, 'loading video...', ['{youtubeVideoId}'], PAGE_TYPE_EPISODE);
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
