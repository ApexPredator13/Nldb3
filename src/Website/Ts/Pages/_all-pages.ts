import { HomePage } from "./home";
import { DownloadsPage } from "./downloads";
import { EpisodesPage } from "./episodes";
import { ResourceOverviewPage } from "./resource-overview";
import { EpisodePage } from "./episode";
import { Redirect } from "./redirect";
import { SubmitVideo } from "./submit-video";
import { Resource } from "./resource";

(() => {
    HomePage.RegisterPage();
    Resource.RegisterPage();
    DownloadsPage.RegisterPage();
    EpisodesPage.RegisterPage();
    ResourceOverviewPage.RegisterPage();
    EpisodePage.RegisterPage();
    Redirect.RegisterPage();
    SubmitVideo.RegisterPage();
    Resource.RegisterPage();
})();
