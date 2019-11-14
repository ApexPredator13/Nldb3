import { Component, FrameworkElement } from "../../Framework/renderer";
import { BackToOverviewLinks } from "../../Components/Admin/back-to-overview-links";
import { PageData, registerPage } from "../../Framework/router";

export class VideosSavedPage implements Component {
    E: FrameworkElement;

    constructor(parameters: Array<string>) {
        const videoIds = parameters[0];
        this.E = {
            e: ['div'],
            c: [
                {
                    e: ['p', 'The videos have been saved successfully.']
                },
                {
                    e: ['p', `Processed videos: ${videoIds}`]
                },
                new BackToOverviewLinks()
            ]
        }
    }

    static RegisterPage() {
        const page: PageData = {
            Component: VideosSavedPage,
            Title: 'Videos Saved!',
            Url: ['Admin', 'VideosSaved', '{videoIds}']
        }
        registerPage(page);
    }
}

