import { Html, Div, id } from "../Framework/renderer";
import { Videos } from "../Components/General/Videos";
import { registerPage, initRouter } from "../Framework/router";

/** 
 *  the episode overview page
 *  @constructor
 */
function EpisodesPage() { }

EpisodesPage.prototype = {

    /** renders the page and displays all videos */
    renderPage: function () {
        new Html([
            Div(id('videos-x'))
        ]);

        new Videos('videos-x', 'A list of all Isaac episodes');
    }
}

function registerEpisodesPage() {
    registerPage(EpisodesPage, 'Isaac Episodes', ['Episodes']);
}

export {
    EpisodesPage,
    registerEpisodesPage
}

(() => {
    registerEpisodesPage();
    initRouter();
})();




