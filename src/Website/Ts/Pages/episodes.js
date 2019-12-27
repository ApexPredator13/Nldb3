import { Render, Div } from "../Framework/renderer";
import { Videos } from "../Components/General/Videos";
import { registerPage, initRouter } from "../Framework/router";

function episodesPage() {
    new Render([
        Div(id('videos-x'))
    ]);

    Videos('videos-x', 'A list of all Isaac episodes');
}

function registerEpisodesPage() {
    registerPage(episodesPage, 'Isaac Episodes', ['Episodes']);
}

export {
    episodesPage,
    registerEpisodesPage
}

(() => {
    registerEpisodesPage();
    initRouter();
})();




