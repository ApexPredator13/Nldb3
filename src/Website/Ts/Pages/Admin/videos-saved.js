import { Html, t, H1, Hr, P } from "../../Framework/renderer";
import { backToAdminOverview } from "../../Components/Admin/go-back-links";
import { registerPage } from "../../Framework/router";


/**
 * success page after videos were added/updated
 * @constructor
 * @param {string[]} parameters - route parameters. parameters[0] are the video IDs in a single string
 */
function VideosSavedPage(parameters) {
    this.videoIds = parameters[0];
}


VideosSavedPage.prototype = {

    renderPage: function () {
        new Html([
            H1(
                t('The videos have been saved successfully.')
            ),
            Hr(),
            P(
                t(`Processed videos: ${this.videoIds}`)
            ),
            Hr(),
            backToAdminOverview()
        ]);
    }
}



function registerVideosSavedPage() {
    registerPage(VideosSavedPage, 'Videos Saved!', ['Admin', 'VideosSaved', '{videoIds}'])
}

export {
    VideosSavedPage,
    registerVideosSavedPage
}
