import { registerEpisodesPage } from "./episodes";
import { registerEpisodePage } from "./episode";
import { registerResourceOverviewPage } from "./resource-overview";
import { registerDownloadsPage } from "./downloads";
import { registerHome } from "./home";
import { registerResourcePage } from "./resource";

(() => {
    registerEpisodePage();
    registerEpisodesPage();
    registerResourceOverviewPage();
    registerDownloadsPage();
    registerResourcePage();
    registerHome();
})();
