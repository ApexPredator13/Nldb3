import { Component, FrameworkElement } from "../Framework/renderer";
import { VideosComponent } from "../Components/General/videos";
import { registerPage, PageData, initRouter } from "../Framework/router";

export class EpisodesPage implements Component {
    E: FrameworkElement;
    constructor() {
        this.E = {
            e: ['div'],
            c: [ new VideosComponent('A list of all Isaac episodes') ]
        }
    }

    static Link() {
        return 'Episodes';
    }

    static RegisterPage(): void {
        const page: PageData = {
            Component: EpisodesPage,
            Title: 'Isaac Episodes',
            Url: ['Episodes']
        };

        registerPage(page);
    }
}

(() => {
    EpisodesPage.RegisterPage();
    initRouter();
})();

