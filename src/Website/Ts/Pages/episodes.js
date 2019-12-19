"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var videos_1 = require("../Components/General/videos");
var router_1 = require("../Framework/router");
var EpisodesPage = /** @class */ (function () {
    function EpisodesPage() {
        this.E = {
            e: ['div'],
            c: [new videos_1.VideosComponent('A list of all Isaac episodes')]
        };
    }
    EpisodesPage.Link = function () {
        return 'Episodes';
    };
    EpisodesPage.RegisterPage = function () {
        var page = {
            Component: EpisodesPage,
            Title: 'Isaac Episodes',
            Url: ['Episodes']
        };
        router_1.registerPage(page);
    };
    return EpisodesPage;
}());
exports.EpisodesPage = EpisodesPage;
(function () {
    EpisodesPage.RegisterPage();
    router_1.initRouter();
})();
//# sourceMappingURL=episodes.js.map