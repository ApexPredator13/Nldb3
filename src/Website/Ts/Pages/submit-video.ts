import { Component, FrameworkElement, A } from "../Framework/renderer";
import { PageData, registerPage } from "../Framework/router";
import { SubmitQuote } from "../Components/SubmitVideo/submit-quote";
import { SubmitTopic } from "../Components/SubmitVideo/submit-topic";
import { HistoryTable } from "../Components/SubmitVideo/history-table";
import { getConfig } from "../Framework/Customizable/config.development";
import { YoutubePlayer } from "../Components/SubmitVideo/youtube-player";
import { addClassIfNotExists, removeClassIfExists } from "../Framework/browser";

export class SubmitVideo implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        const videoId = parameters[0];
        const origin = getConfig().baseUrlWithoutTrailingSlash;
        new YoutubePlayer();

        this.E = {
            e: ['div'],
            a: [[A.Id, 'menu-wrapper']],
            c: [
                {
                    e: ['div'],
                    a: [[A.Id, 'left-column']],
                    c: [
                        {
                            e: ['div'],
                            a: [[A.Id, 'youtube-player-container']],
                            c: [
                                {
                                    e: ['iframe'],
                                    a: [
                                        [A.Id, 'ytplayer'],
                                        [A.Src, `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${origin}&rel=0&autoplay=1`],
                                        [A.FrameBorder, '0']
                                    ]
                                }
                            ]
                        },
                        {
                            e: ['div'],
                            a: [[A.Id, 'quotes-and-topic-wrapper']],
                            c: [
                                new SubmitQuote(videoId),
                                new SubmitTopic(videoId),
                                new HistoryTable(videoId)
                            ]
                        }
                    ]
                },
                {
                    e: ['div'],
                    a: [[A.Id, 'right-column']]
                }
            ]
        }
    }

    static RegisterPage() {
        const page: PageData = {
            Component: SubmitVideo,
            Title: 'loading video...',
            Url: ['SubmitVideo', '{id}'],
            afterRender: () => {
                // make navigation invisible
                const nav = document.getElementById('nav');
                if (nav) {
                    removeClassIfExists(nav, 'w20');
                    addClassIfNotExists(nav, 'display-none');
                }

                const main = document.getElementById('main-container');
                if (main) {
                    removeClassIfExists(main, 'w80');
                    addClassIfNotExists(main, 'w100');
                }
            },
            beforeLeaving: () => {
                // show navigation again
                const nav = document.getElementById('nav');
                if (nav) {
                    addClassIfNotExists(nav, 'w20');
                    removeClassIfExists(nav, 'display-none');
                }

                const main = document.getElementById('main-container');
                if (main) {
                    removeClassIfExists(main, 'w100');
                    addClassIfNotExists(main, 'w80');
                }
            }
        };
        registerPage(page);
    }
}

