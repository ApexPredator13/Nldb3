"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var home_1 = require("./home");
var downloads_1 = require("./downloads");
var episodes_1 = require("./episodes");
var resource_overview_1 = require("./resource-overview");
var episode_1 = require("./episode");
var redirect_1 = require("./redirect");
var submit_video_1 = require("./submit-video");
var resource_1 = require("./resource");
(function () {
    home_1.HomePage.RegisterPage();
    resource_1.Resource.RegisterPage();
    downloads_1.DownloadsPage.RegisterPage();
    episodes_1.EpisodesPage.RegisterPage();
    resource_overview_1.ResourceOverviewPage.RegisterPage();
    episode_1.EpisodePage.RegisterPage();
    redirect_1.Redirect.RegisterPage();
    submit_video_1.SubmitVideo.RegisterPage();
    resource_1.Resource.RegisterPage();
})();
//# sourceMappingURL=_all-pages.js.map