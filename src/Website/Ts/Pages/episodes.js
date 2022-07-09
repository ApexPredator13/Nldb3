import { Html, Div, id } from "../Framework/renderer";
import { Videos } from "../Components/General/Videos";
import { registerPage, initRouter } from "../Framework/router";
import { get } from "../Framework/http";

/** 
 *  the episode overview page
 *  @constructor
 */
function EpisodesPage() { }

EpisodesPage.prototype = {

    /** renders the page and displays all videos */
    renderPage: function () {

        get('/Api/Videos/count', false, false).then(x => {
            new Html([
                Div(id('videos-x'))
            ]);

            new Videos('videos-x', 'A list of all ' + x + ' Isaac episodes');
        });
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




