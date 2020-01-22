import { Html, Div, h1, p, P, div, hr, cl, id, h3, style, attr, t, do_nothing } from "../Framework/renderer";
import { topic } from "../Components/Home/topic";
import { get } from "../Framework/http";
import { rankImage, rankName } from "../Components/Home/Rank";
import { statHeader, statImage, statText } from "../Components/Home/stat";
import { registerPage, initRouter, PAGE_TYPE_ISAAC_RESOURCE } from "../Framework/router";
import { Link, RO_ITEMS, RO_ITEMSOURCES, RO_BOSSES, RO_CHARACTERS, RO_FLOORS, RO_TRANS } from "./_link-creator";
import { overhaulWarning } from "../Components/Home/overhaul-warning";


/**
 * The Front Page
 * @constructor
 */
function HomePage() {
    this.belowFoldContainerId = 'below-fold-content';
}

HomePage.prototype = {

    /** renders everything that can be displayed immidiately. */
    renderPage: function () {
        const link = new Link();

        new Html([
            Div(
                h1(t('Welcome to the Northernlion Database!')),
                p(t('A database dedicated to the best Let\'s Play series on the internet.')),
                hr(),

                overhaulWarning(),

                div(
                    id('topics'),

                    div(
                        cl('topics-row'),
                        topic('Isaac Episodes', "-100", link.episodes()),
                        topic('Items', "-241", link.resourceOverview(RO_ITEMS)),
                        topic('Quotes', "-382", link.quotes())
                    ),

                    div(
                        cl('topics-row'),
                        topic('Item Sources', "-523", link.resourceOverview(RO_ITEMSOURCES)),
                        topic('Bossfights', "-664", link.resourceOverview(RO_BOSSES)),
                        topic('Characters', "-805", link.resourceOverview(RO_CHARACTERS))
                    ),

                    div(
                        cl('topics-row'),
                        topic('Floors', "-946", link.resourceOverview(RO_FLOORS)),
                        topic('Random Episode Generator', "-1369", '/'),
                        topic('Transformations', "-1228", link.resourceOverview(RO_TRANS))
                    ),
                ),

                div(
                    t('loading page...'),
                    id(this.belowFoldContainerId)
                )
            )
        ]);

        this.renderBelowTheFoldContent();
    },


    /** loads fun & facts from the server and displays it */
    renderBelowTheFoldContent: function () {
        Promise.all([
            get('/api/frontpage/top-users'),
            get('/api/frontpage'),
        ]).then(([topUsers, data]) => {
            const link = new Link();
            console.log(topUsers);

            new Html([
                Div(
                    div(
                        id('top-contributors-container'),

                        div(
                            cl('fp-contributors-header'),
                            h3(
                                t('Big thanks to our top contributors!!')
                            )
                        ),

                        rankImage('0', '-1560'),
                        rankName(topUsers[0], 1),
                        rankImage('-50', '-1560'),
                        rankName(topUsers[1], 2),
                        rankImage('-100', '-1560'),
                        rankName(topUsers[2], 3),

                        div(
                            cl('fp-contributors-header'),
                            h3(
                                t('...and all the other major contributors!')
                            )
                        ),

                        div(
                            style('padding: 0 20%; background-color: transparent; font-size: 1.1rem; border-top: none; grid-column-start: 1; grid-column-end: 3;'),
                            p(
                                attr({ style: 'padding-top: 0', id: 'major-contributors' }),
                                t(topUsers.slice(3).map(user => user.name).join(', '))
                            )
                        )
                    ),

                    div(
                        id('fp-stats-container'),
                        statHeader(`So far, ${data.video_count.toString(10)} videos have been added to the database. In those videos, Northernlion...`),
                        statImage('0', '-1510', link.isaacResource('MagicMushroom'), PAGE_TYPE_ISAAC_RESOURCE),
                        statText(`...picked up ${data.items_collected.toString(10)} items`),
                        statImage('-50', '-1510', link.isaacResource('Delirium'), PAGE_TYPE_ISAAC_RESOURCE),
                        statText(`...fought ${data.bosses_fought.toString(10)} bosses`),
                        statImage('-100', '-1510', link.resourceOverview(RO_FLOORS), PAGE_TYPE_ISAAC_RESOURCE),
                        statText(`...went through ${data.floors_visited.toString(10)} floors`),
                        statImage('-150', '-1510', link.isaacResource('StopWatch'), PAGE_TYPE_ISAAC_RESOURCE),
                        statText(`...played for ${data.total_playtime_days.toString(10)} full days, ${data.total_playtime_hours.toString(10)} hours, ${data.total_playtime_minutes.toString(10)} minutes and ${data.total_playtime_seconds.toString(10)} seconds`),
                        statImage('0', '-1610', link.resourceOverview(RO_CHARACTERS)),
                        statText(`...played ${data.characters_played.toString(10)} characters`),
                        statImage('-150', '-1560', link.isaacResource('Maggie'), PAGE_TYPE_ISAAC_RESOURCE),
                        statText(`...lost ${data.average_deaths.toString(10)} runs`),

                        statHeader('On an average run, Northernlion...'),
                        statImage('-50', '-1610', link.isaacResource('TheDSix'), PAGE_TYPE_ISAAC_RESOURCE),
                        statText(`collects ${data.average_items_total.toFixed(2)} items`),
                        statImage('-100', '-1610', link.isaacResource('Monstro'), PAGE_TYPE_ISAAC_RESOURCE),
                        statText(`fights ${data.average_bossfights.toFixed(2)} bosses`),
                        statImage('-150', '-1610', link.isaacResource('Shop'), PAGE_TYPE_ISAAC_RESOURCE),
                        statText(`buys ${data.average_items_shop.toFixed(2)} items from the shop`),
                        statImage('0', '-1660', link.resourceOverview(RO_FLOORS)),
                        statText(`goes through ${data.average_floors_visited.toFixed(2)} floors`),
                        statImage('-50', '-1660', link.resourceOverview(RO_CHARACTERS)),
                        statText(`dies ${data.average_deaths.toFixed(2)} times`),
                        statImage('-100', '-1660', link.isaacResource('ChestItem'), PAGE_TYPE_ISAAC_RESOURCE),
                        statText(`picks up ${data.average_chest_items.toFixed(2)} items from the chest`),
                        statImage('-150', '-1660', link.resourceOverview(RO_TRANS)),
                        statText(`transforms ${data.average_transformations.toFixed(2)} times`),
                        statImage('0', '-1710', link.resourceOverview(RO_CHARACTERS)),
                        statText(`has a ${data.average_chest_items.toFixed(2)}% chance of winning`)
                    ),

                    div(
                        style('width: 100%; height: 300px')
                    )
                )
            ], this.belowFoldContainerId);
        }).catch(() => {
            new Html([
                P(t('Failed to load front page data! :/'))
            ], this.belowFoldContainerId);
        });
    }
}

function registerHomePage() {
    registerPage(HomePage, 'Welcome to the Northernlion Database', ['']);
}

export {
    registerHomePage,
    HomePage
}


(() => {
    registerHomePage();
    initRouter();
})();

