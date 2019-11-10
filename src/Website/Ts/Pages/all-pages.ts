import { HomePage } from "./home";
import { DownloadsPage } from "./downloads";
import { EpisodesPage } from "./episodes";
import { ResourceOverviewPage } from "./resource-overview";
import { EpisodePage } from "./episode";

(() => {
    document.addEventListener('DOMContentLoaded', () => {
        HomePage.RegisterPage();
        DownloadsPage.RegisterPage();
        EpisodesPage.RegisterPage();
        ResourceOverviewPage.RegisterPage();
        EpisodePage.RegisterPage();
    });
})();
