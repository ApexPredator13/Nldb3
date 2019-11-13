import { Component, FrameworkElement } from "../../Framework/renderer";
import { BackToOverviewLinks } from "../../Components/Admin/back-to-overview-links";
import { PageData, registerPage, getPageData } from "../../Framework/router";

export class VideosSaved implements Component {
    E: FrameworkElement;

    constructor() {
        const data = getPageData();
        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['p', 'The videos have been saved successfully.']
                },
                {
                    e: ['p', 'Processed videos: ' + (data && typeof(data) === 'string' ? data : 'no data found')]
                },
                new BackToOverviewLinks()
            ]
        }
    }

    static RegisterPage() {
        const data: PageData = {
            AppendTo: 'main-container',
            Component: VideosSaved,
            Title: 'Videos Saved!',
            Urls: ['/Admin/VideosSaved']
        }
        registerPage('videos-saved', data);
    }
}

