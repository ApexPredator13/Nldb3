import { registerEpisodesPage } from "./episodes";
import { registerEpisodePage } from "./episode";
import { registerResourceOverviewPage } from "./resource-overview";
import { registerDownloadsPage } from "./downloads";
import { registerHomePage } from "./home";
import { registerResourcePage } from "./resource";
import { registerSubmitVideoPage } from "./submit-video";

(() => {
    registerEpisodePage();
    registerEpisodesPage();
    registerResourceOverviewPage();
    registerDownloadsPage();
    registerResourcePage();
    registerHomePage();
    registerSubmitVideoPage();
})();
