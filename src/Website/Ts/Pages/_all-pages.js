import { registerEpisodesPage } from "./episodes";
import { registerEpisodePage } from "./episode";
import { registerResourceOverviewPage } from "./resource-overview";
import { registerDownloadsPage } from "./downloads";
import { registerHomePage } from "./home";
import { registerResourcePage } from "./resource";
import { registerQuotesPage } from "./quotes";
import { registerManageQuotesPage } from "./manage-quotes";
import { registerEditQuotePage } from "./edit-quote";
import { registerConfirmDeleteQuotePage } from "./confirm-delete-quote";

(() => {
    registerEpisodePage();
    registerEpisodesPage();
    registerResourceOverviewPage();
    registerDownloadsPage();
    registerResourcePage();
    registerHomePage();
    registerQuotesPage();
    registerManageQuotesPage();
    registerEditQuotePage();
    registerConfirmDeleteQuotePage();
})();
