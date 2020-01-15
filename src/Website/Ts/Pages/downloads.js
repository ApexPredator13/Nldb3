import { Html, Div, h1, t, span, hr, h3, a, href, cl, p, br, event, attr } from "../Framework/renderer";
import { registerPage, initRouter } from "../Framework/router";
import { Link } from "./_link-creator";

/**
 * The Downloads page.
 * @constructor
 */
function DownloadsPage() {
    this.link = new Link();
}

DownloadsPage.prototype = {

    /** renders the page */
    renderPage: function () {
        new Html([
            Div(
                h1(
                    t('Downloads')
                ),
                hr(),
                h3(
                    t('Database Dump')
                ),
                p(
                    t("Note: Don't download this unless you know how to use a SQL database."),
                    cl('orange')
                ),
                p(
                    span(
                        t('This is a direct SQL-Dump of everything that is stored here (All data related to users is removed). ')
                    ),
                    br(),
                    span(
                        t('The Northernlion Database uses PostgreSQL to store data, and the dump is created with help of the pg_dump tool.')
                    ),
                    br(),
                    span(
                        t('The dump will be recreated once an hour.')
                    )
                ),
                a(
                    t('Download SQL Dump'),
                    href('Api/Downloads/DownloadFile')
                ),
                p(
                    t('After downloading, '),
                    a(
                        t('consider reading the guide'),
                        attr({
                            href: '/SqlDump/Description',
                            target: '_blank'
                        }),
                    ),
                    t(' on how to set things up and a description of all the tables.')
                )
            )
        ]);
    }
}


function registerDownloadsPage() {
    registerPage(DownloadsPage, 'Downloads', ['Downloads']);
}

export {
    DownloadsPage,
    registerDownloadsPage
}

(() => {
    registerDownloadsPage();
    initRouter();
})();

